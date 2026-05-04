import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


import { fetchPlaylist } from "../services/PlaylistServices";
import { usePlaylistCtx } from "../core/PlaylistProvider";

import { Header } from "./navbar/Header";

import HomeStyles from "./Home.module.css";
import { decodeID } from "../services/PlaylistIDServices";
import { APP_NAME } from "../const";
import { DeleteIcon } from "../icons";


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
            <Header/>
            {children}
        </div>
    )
}

function PlaylistList() {
    const { playlists, addPlaylist, removePlaylist } = usePlaylistCtx();

    const handleRemovePlaylist = (id) => {
        removePlaylist(id); // ✅ use store
    };

    return (
        <div className={HomeStyles.list}>
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

            <PlaylistAdd addPlaylist={addPlaylist} />
        </div>
    );
}

function PlaylistAdd({ addPlaylist }) {
    const [pop, set] = useState(false);
    return (<>
        <AddBtn set={set} />
        {
            pop &&
            <PopOut set={set} addPlaylist={addPlaylist} />
        }
    </>
    )
}
function PopOut({ set, addPlaylist }) {
    const [msg, setMsg] = useState("");
    const handleChange = async (e) => {
        const id = e.target.value;
        setMsg("");

        const playlist = await fetchPlaylist(id);

        if (!playlist) {
            setMsg("No Playlist Found");
            return;
        }

        addPlaylist(playlist); // ✅ pass full object
        set(false);
    };
    return (
        <div className={`${HomeStyles.idPopOut}`}>
            <div className={HomeStyles.backdrop} onClick={() => set(false)}></div>
            <div className={HomeStyles.popout}>
                <div className={HomeStyles.header}>Enter your Playlist ID</div>
                <div className={HomeStyles.description}>(If provided by Owner)</div>
                <input type="text" id={HomeStyles.key} className={HomeStyles.checking} onChange={handleChange} />
                <span className={HomeStyles.msgSpan}>{msg}</span>
            </div>
        </div>
    )
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
    return (
        <div className={`${HomeStyles.item}`}>
            <div className={HomeStyles.side}>
                <img src={playlist.thumbnail} onClick={openPlaylist} />
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
                    <DeleteIcon/>
                </div>
            </div>
        </div>
    )
}





















