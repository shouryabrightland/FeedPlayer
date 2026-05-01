import { AppState, useAppState } from "../core/AppState.class"
import styles from "./Home.module.css"
import state from "../core/state.class"
import { useState } from "react";
import { PlayList } from "../core/Playlist.class";
export function Home({ appstate }) {
    const ShowIDPop = new state(false, "Home Popup");
    return <div className={styles.Home}>
        <div className={styles.header}>FeedPlayer</div>
        <List appstate={appstate} showPop={ShowIDPop} />
        <IDPop showpop={ShowIDPop} appstate={appstate} />
    </div>
}
/**
 * @param {{appstate:AppState,showPop:state}}
*/
function List({ appstate, showPop }) {
    const Playlists = useAppState(appstate.PlayLists);
    return <div className={styles.list}>
        <div className={styles.heading}>
            {Playlists.length ? "Select the playlist below" : "No Playlist Found in your Device"}
        </div>
        {Playlists.length!=0 && Playlists.map((v,i,arr)=>
        <Card playlist={v} key={i} appstate={appstate}/>
        )}
        <AddBtn showPop={showPop} />
    </div>
}
/**
 * @param {{showPop:state}}
*/
function AddBtn({ showPop }) {
    const handleClick = () => showPop.set(true)
    return <div className={`${styles.item} ${styles.AddBtn}`} onClick={handleClick}>

        <svg width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
        </svg>
        <span className={styles.bottomText}>Add Playlist</span>
    </div>
}
/**
 * @param {{showpop:state,appstate:AppState}}
*/
function IDPop({ showpop,appstate }) {
    const show = useAppState(showpop);
    const [msg, setMsg] = useState("");
    const [isValid, setisValid] = useState(0)
    const handleChange = (e) => {
        const value = e.target.value;
        const Playlist = new PlayList(value)
        Playlist.init()
        Playlist.isLoaded.onUpdate(() => {
            if (!Playlist.isValid) return setisValid(-1);
            appstate.AddPlaylist(Playlist.id)
            setisValid(1);
            const tm = setTimeout(() => {
                    showpop.set(false);
                }, 500)
            showpop.onUpdate(() => {
                clearTimeout(tm)
            })
        })
    }
    const hide = () => showpop.set(false)

    showpop.onUpdate((s) => {
        if (!s) {
            setisValid(0);
            setMsg("")
        }
    })

    if (!show) return;
    return (<div className={`${styles.idPopOut} ${isValid == 1 ? styles.correct : ""} ${isValid == -1 ? styles.invalid : ""}`}>
        <div className={styles.backdrop} onClick={hide}></div>
        <div className={styles.popout}>
            <div className={styles.header}>Enter your Playlist ID</div>
            <div className={styles.description}>(If provided by Owner)</div>
            <input type="text" id={styles.key} className={styles.checking} onChange={handleChange} />
            <span className={styles.msgSpan}>{msg}</span>
        </div>
    </div>)
}
/**
 * @param {{playlist:object,appstate:AppState}}
*/
function Card({playlist,appstate}){
    const deletePlaylist = ()=>[
        appstate.RemovePlaylist(playlist.id)
    ]
    return  <div className={`${styles.item}`}>
                <div className={styles.side}>
                    <img src={playlist.thumbnail} />
                </div>
                <div className={styles.header}>
                    <div className={styles.info}>
                        <div className={`${styles.title} ${styles.textOverflow}`}>
                            {playlist.title}
                        </div>
                        <div className={`${styles.desc} ${styles.textOverflow}`}>
                            {playlist.description}
                        </div>
                    </div>

                    <div className={styles.options} onClick={deletePlaylist}>
                        <svg width="16" height="16" fill="currentColor" className="icon" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                        </svg>
                    </div>
                </div>
            </div>
}