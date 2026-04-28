import React from "react"
import { useEffect, useState } from "react";
import PlayerState from "../PlayerState.class"
import { usePlayerValue } from "../state.class";
import { AppState, useAppState } from "../../AppState.class";
import PlayerBackdrop from "./backdrop";
import { getAverageColor, PlayBtn } from "../sm_components";
import { CoverArt, ProgressBar, SuffleBtn, LoopBtn } from "./components";
import styles from "./player.module.css"
/**
 * @param {{playstate:PlayerState,appstate:AppState}}
*/

function CardPlayer({state,maximisePlayer,bgcolor}){
    const isActive = usePlayerValue(state.isActive)
    const song = usePlayerValue(state.song)
    const toggle = () => state.toggle()
    console.log("rendering CardPlayer")
    return (
        <div className={isActive ? styles.outerPlayerCard : `${styles.outerPlayerCard} ${styles.min}`}
            style={{ '--bg': bgcolor }}>
            <div className={styles.playerCard}>
                <div className={styles.thumbnail}>
                    <img src={song?.thumbnail} />
                </div>
                <div className={styles.info} onClick={maximisePlayer}>
                    <div className={styles.title}>{song?.title}</div>
                    <div className={styles.description}>{song?.description}</div>
                </div>
                <div className={styles.playbtn} onClick={toggle}>
                    <PlayBtn styles={styles} state={state} />
                </div>
                {isActive && <CardProgressBar state={state}/>}
            </div>
        </div>
    )
}

function CardProgressBar({state}){
    const currentTime = usePlayerValue(state.currentTime)
    const durationRaw = state.duration.get();
    const progress = durationRaw
        ? (currentTime / durationRaw) * 100
        : 0;
    return (
        <div className={styles.cardBar}>
            <div className={styles.progress} style={{width:`${progress}%`}}></div>
        </div>
    )
}


function Player({ playstate, appstate }) {

    const config = useAppState(appstate.CONFIG)
    /** @type {PlayerState}*/
    const state = playstate

    const isActive = usePlayerValue(state.isActive)
    const [isMini, setIsMini] = useState(false)
    const song = usePlayerValue(state.song)
    const coverArtMinimize = usePlayerValue(state.coverArtMinimize)

    const [bgColor, setBgColor] = useState("black");
    useEffect(() => {
        if (!song?.thumbnail) return;

        getAverageColor(song.thumbnail).then((color) => {
            setBgColor(color);
        });
    }, [song]);


    if (!config) return;
    console.log("Rendering Player");


    const minimizePlayer = () => setIsMini(true)
    const maximisePlayer = () => setIsMini(false)
    const toggle = () => state.toggle()

    const toggleLoop = () => state.isLoop.set(!state.isLoop.get());
    const toggleSuffle = () => state.suffle.set(!state.suffle.get());
    const next = () => state.next();
    const prev = () => state.prev();

    return (<>
    {isMini && <CardPlayer state={state} maximisePlayer={maximisePlayer} bgcolor={bgColor}/>}

        <div className={isActive && !isMini ? styles.outerPlayer : `${styles.outerPlayer} ${styles.min}`}>
            <div className={styles.player}>
                <PlayerBackdrop
                    state={state}
                    isMini={isMini}
                    bgcolor={bgColor}
                />

                <div className={`${styles.main} ${coverArtMinimize ? styles.enableFeed : ""}`}>
                    <div className={styles.header}>
                        <div onClick={minimizePlayer}>
                            <span>
                                <svg role="img" className={`icon ${styles.icon}`} viewBox="0 0 24 24">
                                    <path d="M2.793 8.043a1 1 0 0 1 1.414 0L12 15.836l7.793-7.793a1 1 0 1 1 1.414 1.414L12 18.664 2.793 9.457a1 1 0 0 1 0-1.414"></path>
                                </svg>
                            </span>
                        </div>
                        <div className={styles.title}>
                            {config?.title}
                        </div>
                        <div className={styles.options}>
                            <span>
                                <svg role="img" className={`icon ${styles.icon}`} viewBox="0 0 24 24">
                                    <path d="M4.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m15 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"></path>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <CoverArt state={state} />
                    <div className={styles.meta}>
                        <div className={styles.info}>
                            <div className={styles.name}>{song?.title}</div>
                            <div className="desc">{song?.description}</div>
                        </div>
                        <div className={styles.likeBtn}>
                            <svg role="img" className="icon" viewBox="0 0 24 24"><path d="M5.21 1.57a6.76 6.76 0 0 1 6.708 1.545.124.124 0 0 0 .165 0 6.74 6.74 0 0 1 5.715-1.78l.004.001a6.8 6.8 0 0 1 5.571 5.376v.003a6.69 6.69 0 0 1-1.49 5.655l-7.954 9.48a2.518 2.518 0 0 1-3.857 0L2.12 12.37A6.68 6.68 0 0 1 .627 6.714 6.76 6.76 0 0 1 5.21 1.57m3.12 1.803a4.757 4.757 0 0 0-5.74 3.725l-.001.002a4.68 4.68 0 0 0 1.049 3.969l.009.01 7.958 9.485a.518.518 0 0 0 .79 0l7.968-9.495a4.69 4.69 0 0 0 1.049-3.965 4.8 4.8 0 0 0-3.931-3.794 4.74 4.74 0 0 0-4.023 1.256l-.008.008a2.123 2.123 0 0 1-2.9 0l-.007-.007a4.76 4.76 0 0 0-2.214-1.194z"></path></svg>
                        </div>

                    </div>
                    <ProgressBar state={state} isMini={isMini}/>
                    <div className={styles.playerControl}>
                        <div className={styles.options}>
                            <div className={styles.opt} onClick={toggleSuffle}>
                                <SuffleBtn state={state} />
                            </div>
                            <div className={styles.opt} onClick={prev}>
                                <span><svg role="img" className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M6.3 3a.7.7 0 0 1 .7.7v6.805l11.95-6.899a.7.7 0 0 1 1.05.606v15.576a.7.7 0 0 1-1.05.606L7 13.495V20.3a.7.7 0 0 1-.7.7H4.7a.7.7 0 0 1-.7-.7V3.7a.7.7 0 0 1 .7-.7z"></path></svg></span>
                            </div>
                            <div className={`${styles.opt} ${styles.playbtn}`} onClick={toggle}>
                                <PlayBtn state={state} styles={styles} />
                            </div>
                            <div className={styles.opt} onClick={next}>
                                <span><svg role="img" className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M17.7 3a.7.7 0 0 0-.7.7v6.805L5.05 3.606A.7.7 0 0 0 4 4.212v15.576a.7.7 0 0 0 1.05.606L17 13.495V20.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z"></path></svg></span>
                            </div>
                            <div className={styles.opt} onClick={toggleLoop}>
                                <LoopBtn state={state} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div></>)
}

export default React.memo(Player)

