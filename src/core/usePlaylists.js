import { useCallback, useEffect, useRef, useState } from "react";
import { DB } from "./db";
import { _DBName, _StoreName, _DBVersion, _PlaylistKey } from "../const";

import { decodeID, encodeID } from "../services/PlaylistIDServices";
import { resolveURL } from "../components/sm_components";

export function usePlaylists() {
    const [playlists, setPlaylists] = useState([]);
    const [ready, setReady] = useState(false);

    const dbRef = useRef(null);
    const isLoaded = useRef(false);

    const fetchPlaylist = useCallback(_fetchPlaylist, [])
    const isValidPlaylist = useCallback(_isValidPlaylist, [])
    const fetchVarify = useCallback(_fetchVarify, [])


    if (!dbRef.current) {
        dbRef.current = new DB(_DBName, _StoreName, _DBVersion);
    }

    const _DB = dbRef.current;

    // Load from DB
    useEffect(() => {
        (async () => {
            try {
                const data = await _DB.get(_PlaylistKey);
                if (Array.isArray(data)) setPlaylists(data);
            } catch (e) {
                console.log("db failed", e);
            } finally {
                isLoaded.current = true;
                setReady(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (!ready) return;

        playlists.forEach(async (playlist, idx) => {
            const isvalid = await fetchVarify(playlist.id);

            setPlaylists(prev => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], isvalid };
                return copy;
            });
        });

    }, [ready]);

    // Sync to DB
    useEffect(() => {
        if (!isLoaded.current) return;

        try {
            _DB.set(_PlaylistKey, playlists);
        } catch (e) {
            console.log("db failed", e);
        }
    }, [playlists]);


    // Add playlist
    const addPlaylist = useCallback((playlist) => {
        if (!isValidPlaylist(playlist)) {
            console.error("Invalid playlist rejected:", playlist);
            return;
        }

        const error = validatePlaylist(playlist);
        if (error) {
            console.error("Playlist rejected:", error, playlist);
            return;
        }

        setPlaylists(prev => {
            if (prev.some(p => p.id === playlist.id)) return prev;
            return [...prev, playlist];
        });
    }, [isValidPlaylist]);

    // Remove playlist
    const removePlaylist = useCallback((id) => {
        setPlaylists(prev => prev.filter(p => p.id !== id));
    }, []);

    // Check existence
    const hasPlaylist = useCallback((id) => {
        return playlists.some(p => p.id === id);
    }, [playlists]);


    return {
        playlists,
        addPlaylist,
        removePlaylist,
        hasPlaylist,
        fetchPlaylist,
        ready
    };
}


async function _fetchVarify(id) {
    if (!id || typeof id !== "string") return false;
    try {
        const rawPath = decodeID(id);
        const base = normalizeBase(rawPath);
        if (!base) return false;
        const indexURL = resolveURL(base, "index.json");
        const data = await safeFetchJSON(indexURL, {
            maxSize: 1024,
            timeout: 5000
        });
        console.log(data, !data?.isKey || !data?.config)
        if (!data?.isKey || !data?.config) return false;
        return true;

    } catch (e) {
        console.error(e)
        return false;
    }
}

function validatePlaylist(playlist) {
    if (!playlist) return "No playlist";
    if (typeof playlist.id !== "string") return "Invalid id";
    if (!playlist.path.startsWith("http")) return "Invalid path";
    return null;
}


function _isValidPlaylist(playlist) {
    if (!playlist || typeof playlist !== "object") return false;

    if (typeof playlist.id !== "string" || playlist.id.length === 0) return false;
    if (typeof playlist.path !== "string" || !playlist.path.startsWith("http")) return false;

    if (typeof playlist.title !== "string") return false;
    if (typeof playlist.description !== "string") return false;

    if (typeof playlist.thumbnail !== "string") return false;
    if (typeof playlist.songsUrl !== "string") return false;

    return true;
}


async function _fetchPlaylist(id) {
    if (!id || typeof id !== "string") return null;

    try {
        const rawPath = decodeID(id);
        const base = normalizeBase(rawPath);

        if (!base) return null;

        const indexURL = resolveURL(base, "index.json");

        const data = await safeFetchJSON(indexURL, {
            maxSize: 1024,
            timeout: 5000
        });

        if (!data?.isKey || !data?.config) return null;

        const configURL = resolveURL(base, data.config);
        if (!configURL) return null;

        const configRes = await fetch(configURL);
        if (!configRes.ok) return null;

        const config = await configRes.json();

        return {
            id: encodeID(base),
            path: base,
            title: config.title || "",
            description: config.description || "",
            thumbnail: resolveURL(base, config.thumbnail || "") || "",
            songsUrl: resolveURL(base, config.songsUrl || "") || "",
            isvalid: true
        };

    } catch (e) {
        console.log("invalid playlist", e);
        return null;
    }
}


async function safeFetchJSON(url, { maxSize = 1024, timeout = 3000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, { signal: controller.signal });

        // ❗ 1. Check status
        if (!res.ok) {
            throw new Error("HTTP error: " + res.status);
        }

        // ❗ 2. Check content type
        const type = res.headers.get("content-type") || "";
        if (!type.includes("application/json")) {
            throw new Error("Not JSON (probably HTML page)");
        }

        // ❗ 3. Check size (header)
        const length = res.headers.get("content-length");
        if (length && Number(length) > maxSize) {
            throw new Error("File too large");
        }

        const text = await res.text();

        // ❗ 4. Extra safety: detect HTML manually
        if (text.trim().startsWith("<")) {
            throw new Error("Received HTML instead of JSON");
        }

        if (text.length > maxSize) {
            throw new Error("File too large");
        }

        return JSON.parse(text);

    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("Request timeout");
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}


function normalizeBase(path) {
    try {
        // already absolute (http/https)
        if (/^https?:\/\//i.test(path)) {
            return path.endsWith("/") ? path : path + "/";
        }

        // root-relative (/abcplaylist/)
        if (path.startsWith("/")) {
            return new URL(path, window.location.origin).href;
        }

        // relative (abcplaylist/)
        return new URL(path, window.location.href).href;

    } catch {
        return null;
    }
}


