import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { _DBName, _DBVersion, _PlaylistKey, _StoreName, DBName, StoreName } from "../const";
import { DB } from "../core/db";
import { fetchPlaylist } from "../services/PlaylistServices";


import HomeStyles from "./Home.module.css";
import { decodeID } from "../services/PlaylistIDServices";


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
            <div className={HomeStyles.header}>FeedPlayer</div>
            {children}
        </div>
    )
}

function PlaylistList() {
    const [playlists, setPlaylists] = useState([]);
    const dbRef = React.useRef(null);
    const isFirst = useRef(true);

    if (!dbRef.current) {
        dbRef.current = new DB(_DBName, _StoreName, _DBVersion);
    }
    const _DB = dbRef.current;

    useEffect(() => {
        (async () => {
            const data = await _DB.get(_PlaylistKey);
            if (Array.isArray(data)) setPlaylists(data);
        })();
    }, []);

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        _DB.set(_PlaylistKey, playlists);
    }, [playlists]);

    const addPlaylist = async (id) => {
        const playlist = await fetchPlaylist(id);

        if (!playlist) return;

        setPlaylists(prev => {
            if (prev.find(p => p.id === id)) return prev;
            return [...prev, playlist];
        });
    };

    const removePlaylist = (id) => {
        setPlaylists(prev => prev.filter(p => p.id !== id));
    };

    return (<>
        <div className={HomeStyles.list}>
            <div className={HomeStyles.heading}>
                {playlists.length ? "Select the playlist below" : "No Playlist Found in your Device"}
            </div>
            {playlists.length != 0 && playlists.map((v, i, arr) =>
                <PlaylistCard playlist={v} key={v.id} addPlaylist={addPlaylist} removePlaylist={() => removePlaylist(v.id)} />
            )}
            <PlaylistAdd addPlaylist={addPlaylist} />
        </div>
    </>
    )
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

        addPlaylist(id).finally(() => set(false));
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
                    <svg width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                    </svg>
                </div>
            </div>
        </div>
    )
}





















