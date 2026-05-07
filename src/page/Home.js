import React from "react";
import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { usePlaylistCtx } from "../core/PlaylistProvider";

import { Header } from "./navbar/Header";
import { DeleteIcon } from "../icons";

import HomeStyles from "./Home.module.css";
import { MediaImage } from "../components/mediaImage";


export default function Home() {
    return (
        <HomeLayout>
            <PlaylistList />
        </HomeLayout>
    )
}

function HomeLayout({ children }) {
    return (
        <div className={HomeStyles.Home}>
            <Header />
            {children}
        </div>
    )
}

const PlaylistList = React.memo(() => {
    const { playlists, addPlaylist, removePlaylist, fetchPlaylist } = usePlaylistCtx();

    const handleRemovePlaylist = (id) => {
        removePlaylist(id); // ✅ use store
    };

    return (
        <div className={`${HomeStyles.list} no-copy`}>
            <div className={HomeStyles.heading}>
                {playlists.length
                    ? "Select the playlist below"
                    : "No Playlist Found in your Device"}
            </div>

            {playlists.map((v) => (
                <PlaylistCard
                    playlist={v}
                    key={v.id}
                    removePlaylist={() => handleRemovePlaylist(v.id)}
                />
            ))}

            <PlaylistAdd addPlaylist={addPlaylist} fetchPlaylist={fetchPlaylist} />
        </div>
    );
})

function PlaylistAdd({ addPlaylist, fetchPlaylist }) {
    const [pop, set] = useState(false);
    return (<>
        <AddBtn set={set} />
        {
            pop &&
            <PopOut set={set} addPlaylist={addPlaylist} fetchPlaylist={fetchPlaylist} />
        }
    </>
    )
}

function PopOut({ set, addPlaylist, fetchPlaylist }) {
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const debounceRef = useRef(null);
    const requestIdRef = useRef(0); // 🔥 prevents race conditions

    const handleChange = useCallback((e) => {
        const id = e.target.value.trim().replace(/\s/g, "");

        setMsg("");

        // ❌ clear previous debounce
        clearTimeout(debounceRef.current);

        // optional: avoid useless calls
        // optional format check
        if (!/^[A-Za-z0-9\-_]+$/.test(id)) {
            setMsg("Invalid ID format");
            return;
        }

        debounceRef.current = setTimeout(async () => {
            const currentRequestId = ++requestIdRef.current;

            try {
                setLoading(true);

                const playlist = await fetchPlaylist(id);

                // ❗ ignore outdated responses
                if (currentRequestId !== requestIdRef.current) return;

                if (!playlist) {
                    setMsg("No Playlist Found");
                    return;
                }

                addPlaylist(playlist);
                set(false); // close popup

            } catch (err) {
                if (currentRequestId !== requestIdRef.current) return;

                setMsg("Something went wrong");
            } finally {
                if (currentRequestId === requestIdRef.current) {
                    setLoading(false);
                }
            }
        }, 400); // 🔥 debounce delay

    }, [fetchPlaylist, addPlaylist, set]);

    return (
        <div className={HomeStyles.idPopOut}>
            <div
                className={HomeStyles.backdrop}
                onClick={() => set(false)}
            ></div>

            <div className={HomeStyles.popout}>
                <div className={HomeStyles.header}>
                    Enter your Playlist ID
                </div>

                <div className={HomeStyles.description}>
                    (If provided by Owner)
                </div>

                <input
                    type="text"
                    id={HomeStyles.key}
                    className={HomeStyles.checking}
                    onChange={handleChange}
                />

                {loading && (
                    <span className={HomeStyles.msgSpan}>
                        Checking...
                    </span>
                )}

                {!loading && msg && (
                    <span className={HomeStyles.msgSpan}>
                        {msg}
                    </span>
                )}
            </div>
        </div>
    );
}
function AddBtn({ set }) {
    const handleClick = () => set(true)
    return (<div className={`${HomeStyles.item} ${HomeStyles.AddBtn}`} onClick={handleClick}>
        <svg width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
        </svg>
        <span className={HomeStyles.bottomText}>Add Playlist</span>
    </div >)
}

function PlaylistCard({ playlist, removePlaylist }) {
    const navigate = useNavigate()
    const openPlaylist = () => navigate(`/playlist?k=${playlist.id}`)
    console.log(playlist.isvalid, "sdfg")
    return (
        <div className={`${HomeStyles.item} ${(!playlist.isvalid) ? HomeStyles.invalid : ""}`}>
            <div className={HomeStyles.side}>
                <MediaImage base={playlist.path} src={playlist.thumbnail} onClick={openPlaylist} alt={playlist.title} />
            </div>
            <div className={HomeStyles.header} onClick={openPlaylist}>
                <div className={HomeStyles.info}>
                    <div className={`${HomeStyles.title} ${HomeStyles.textOverflow}`}>
                        {playlist.title}
                    </div>
                    <div className={`${HomeStyles.desc} ${HomeStyles.textOverflow}`}>
                        {playlist.description}
                    </div>
                </div>
                <div className={HomeStyles.options} onClick={(e) => {
                    e.stopPropagation();
                    removePlaylist();
                }}>
                    <DeleteIcon />
                </div>
            </div>
        </div>
    )
}





















