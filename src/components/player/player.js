import { useEffect, useState, useMemo } from "react";
import PlayerState from "../PlayerState.class"
import { Play_btn } from "../sm_components";
import { useRef } from "react";
import { usePlayerValue } from "../state.class";
import styles from "./player.module.css"
import React from "react"
import { AppState, useAppState } from "../../AppState.class";

function ProgressBar(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const barRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const currentTime = usePlayerValue(state.currentTime)
    const song = usePlayerValue(state.song);
    const durationRaw = state.duration.get();
    const duration = state.formatTime(durationRaw);
    const progress = durationRaw
        ? (currentTime / durationRaw) * 100
        : 0;
    const buffer = state.bufferedPercent.get()

    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (!dragging) return;

        const move = (e) => handleSeek(e);
        const up = () => {
            setDragging(false);
            if (wasPlayingRef.current) state.play();
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);

        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
    }, [dragging]);



    function handlePointerDown(e) {
        wasPlayingRef.current = state.isPlaying.get();
        setDragging(true);
        state.pause();
        handleSeek(e);
    }


    function handleSeek(e) {
        const rect = barRef.current.getBoundingClientRect();

        let clickX = e.clientX - rect.left;

        // clamp (important)
        clickX = Math.max(0, Math.min(clickX, rect.width));

        const percent = clickX / rect.width;

        const duration = state.duration.get();
        const newTime = percent * duration;

        state.seek(newTime);
    }


    return (
        <div className={styles.progressBar} ref={barRef} onPointerDown={handlePointerDown}>
            <div className={styles.bar}>
                <div className={styles.progress} style={{ width: progress + "%" }}></div>
                <div className={styles.buffer} style={{ width: buffer + "%" }}></div>
            </div>
            <div className={styles.label}>
                <span className={styles.start}>{state?.formatTime(currentTime)}</span>
                <span className={styles.end}>{duration}</span>
            </div>
        </div>)

}

const Player_backdrop = React.memo(function Player_backdrop({ media = [], state }) {
    const containerRef = useRef(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target.querySelector("video");

                    if (!video) return;

                    if (entry.isIntersecting) {
                        if (state.isPlaying.get()) {
                            video.play().catch(() => { });
                        }
                    } else {
                        video.pause();
                    }
                });
            },
            {
                threshold: 0.6 // only active when mostly visible
            }
        );

        itemRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [media, state]);

    // sync pause/play with player
    useEffect(() => {
        const cleanup = state.isPlaying.onUpdate((isPlaying) => {
            itemRefs.current.forEach((el) => {
                if (!el) return;
                const video = el.querySelector("video");
                if (!video) return;

                if (isPlaying) {
                    video.play().catch(() => { });
                } else {
                    video.pause();
                }
            });
        });

        return cleanup;
    }, [state]);

    const baseList = useMemo(() => shuffleArray(media), [media]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const itemHeight = window.innerHeight;
        const middleIndex = baseList.length * 2; // center of 5 blocks

        container.scrollTop = middleIndex * itemHeight;
    }, [baseList]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let timeout;

        const handleScroll = () => {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                const itemHeight = window.innerHeight;
                const total = baseList.length;

                const currentIndex = Math.round(container.scrollTop / itemHeight);

                // reposition silently
                if (currentIndex < total || currentIndex > total * 3) {
                    container.scrollTop =
                        (currentIndex % total + total * 2) * itemHeight;
                }
            }, 120); // wait for scroll to stop
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [baseList]);

    const loopedMedia = useMemo(() => {
        return [
            ...baseList,
            ...baseList,
            ...baseList,
            ...baseList,
            ...baseList
        ];
    }, [baseList]);

    const coverArtMinimize = usePlayerValue(state.coverArtMinimize);

    return (
        <div className={`${styles.backdropFeed} ${coverArtMinimize?"":styles.blur}`} ref={containerRef}>
            {loopedMedia.map((item, i) => (
                <div
                    key={i}
                    className={styles.feedItem}
                    ref={(el) => (itemRefs.current[i] = el)}
                >
                    {item.type === "video" ? (
                        <video
                            src={item.src}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                        />
                    ) : (
                        <img src={item.src} alt="" />
                    )}
                </div>
            ))}
        </div>
    );
});

function CoverArt({state}) {
    const minimize = usePlayerValue(state.coverArtMinimize)
    const song = usePlayerValue(state.song)
    const toggle = ()=> state.coverArtMinimize.set(!minimize)
    return (
        <div className={`${styles.coverArt} ${minimize ? styles.minimize : ""}`}>
            <div className={styles.thumbnail}>
                <img src={song?.thumbnail} onClick={toggle} />
            </div>
        </div>
    )
}
/**
 * @param {{playstate:PlayerState,appstate:AppState}}
*/
function Player({playstate,appstate}) {
    
    const config = useAppState(appstate.CONFIG)
    /** @type {PlayerState}*/
    const state = playstate

    const isActive = usePlayerValue(state.isActive)
    const [isMini, setIsMini] = useState(false)
    const song = usePlayerValue(state.song)
    const coverArtMinimize = usePlayerValue(state.coverArtMinimize)
    
    
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
        <div className={isActive ? styles.outerPlayerCard : `${styles.outerPlayerCard} ${styles.min}`}>
            <div className={styles.playerCard}>
                <div className={styles.thumbnail}>
                    <img src={song?.thumbnail} />
                </div>
                <div className={styles.info} onClick={maximisePlayer}>
                    <div className={styles.title}>{song?.title}</div>
                    <div className={styles.description}>{song?.description}</div>
                </div>

                <div className={styles.playbtn} onClick={toggle}>
                    <Play_btn styles={styles} state={state} />
                </div>
            </div>
        </div>

        <div className={isActive && !isMini ? styles.outerPlayer : `${styles.outerPlayer} ${styles.min}`}>
            <div className={styles.player}>
                <Player_backdrop
                    media={song?.media}
                    state={state}
                />

                <div className={`${styles.main} ${coverArtMinimize? styles.enableFeed:""}`}>
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
                    <ProgressBar state={state} />
                    <div className={styles.playerControl}>
                        <div className={styles.options}>
                            <div className={styles.opt} onClick={toggleSuffle}>
                                <Suffle_btn state={state} />
                            </div>
                            <div className={styles.opt} onClick={prev}>
                                <span><svg role="img" className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M6.3 3a.7.7 0 0 1 .7.7v6.805l11.95-6.899a.7.7 0 0 1 1.05.606v15.576a.7.7 0 0 1-1.05.606L7 13.495V20.3a.7.7 0 0 1-.7.7H4.7a.7.7 0 0 1-.7-.7V3.7a.7.7 0 0 1 .7-.7z"></path></svg></span>
                            </div>
                            <div className={`${styles.opt} ${styles.playbtn}`} onClick={toggle}>
                                <Play_btn state={state} styles={styles} />
                            </div>
                            <div className={styles.opt} onClick={next}>
                                <span><svg role="img" className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M17.7 3a.7.7 0 0 0-.7.7v6.805L5.05 3.606A.7.7 0 0 0 4 4.212v15.576a.7.7 0 0 0 1.05.606L17 13.495V20.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z"></path></svg></span>
                            </div>
                            <div className={styles.opt} onClick={toggleLoop}>
                                <Loop_btn state={state} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div></>)
}

export default React.memo(Player)

function useBackground(media = []) {
    const [index, setIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if (!media.length) return; // ✅ just exit, no return object

        const interval = setInterval(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * media.length);
            } while (newIndex === index && media.length > 1);

            setNextIndex(newIndex);
            setFade(true);

            setTimeout(() => {
                setIndex(newIndex);
                setFade(false);
            }, 1000);
        }, 4000);

        return () => clearInterval(interval);
    }, [media]);

    // ✅ handle empty case HERE (not inside useEffect)
    if (!media.length) {
        return { current: "", next: "", fade: false };
    }

    return {
        current: media[index],
        next: media[nextIndex],
        fade
    };
}

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function Loop_btn(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const isLoop = usePlayerValue(state.isLoop)

    return (
        <span><svg role="img" className={`icon ${styles.icon} ${isLoop ? styles.green : ""}`} viewBox="0 0 24 24"><path d="M6 2a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h1v-2H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4.798l1.298-1.298a1 1 0 1 0-1.414-1.414L9.373 19l3.713 3.712a1 1 0 0 0 1.414-1.414L13.202 20H18a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"></path></svg></span>
    )
}


function Suffle_btn(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const isSuffle = usePlayerValue(state.suffle)
    return (
        <span><svg role="img" className={`icon ${styles.icon} ${isSuffle ? styles.green : ""}`} viewBox="0 0 24 24"><path d="M18.788 3.702a1 1 0 0 1 1.414-1.414L23.914 6l-3.712 3.712a1 1 0 1 1-1.414-1.414L20.086 7h-1.518a5 5 0 0 0-3.826 1.78l-7.346 8.73a7 7 0 0 1-5.356 2.494H1v-2h1.04a5 5 0 0 0 3.826-1.781l7.345-8.73A7 7 0 0 1 18.569 5h1.518l-1.298-1.298z"></path><path d="M18.788 14.289a1 1 0 0 0 0 1.414L20.086 17h-1.518a5 5 0 0 1-3.826-1.78l-1.403-1.668-1.306 1.554 1.178 1.4A7 7 0 0 0 18.568 19h1.518l-1.298 1.298a1 1 0 1 0 1.414 1.414L23.914 18l-3.712-3.713a1 1 0 0 0-1.414 0zM7.396 6.49l2.023 2.404-1.307 1.553-2.246-2.67a5 5 0 0 0-3.826-1.78H1v-2h1.04A7 7 0 0 1 7.396 6.49"></path></svg></span>
    )
}
