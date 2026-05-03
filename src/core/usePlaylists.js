import { useEffect, useRef, useState } from "react";
import { DB } from "./db";
import { _DBName, _StoreName, _DBVersion, _PlaylistKey } from "../const";

export function usePlaylists() {
    const [playlists, setPlaylists] = useState([]);
    const [ready, setReady] = useState(false);
    const dbRef = useRef(null);
    const isFirst = useRef(true);

    if (!dbRef.current) {
        dbRef.current = new DB(_DBName, _StoreName, _DBVersion);
    }
    const _DB = dbRef.current;

    // Load from DB
    useEffect(() => {
        (async () => {
            const data = await _DB.get(_PlaylistKey);
            if (Array.isArray(data)) setPlaylists(data);
            console.log("setting true")
            setReady(true);
        })();
    }, []);

    // Sync to DB
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        _DB.set(_PlaylistKey, playlists);
    }, [playlists]);

    // Add playlist
    const addPlaylist = (playlist) => {
        setPlaylists(prev => {
            if (prev.some(p => p.id === playlist.id)) return prev;
            return [...prev, playlist];
        });
    };

    // Remove playlist
    const removePlaylist = (id) => {
        setPlaylists(prev => prev.filter(p => p.id !== id));
    };

    // Check existence
    const hasPlaylist = (id) => {
        return playlists.some(p => p.id === id);
    };

    return { playlists, addPlaylist, removePlaylist, hasPlaylist, ready };
}