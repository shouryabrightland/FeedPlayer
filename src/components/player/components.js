import React from "react";
import { useRef, useState, useEffect} from "react";
import { usePlayerValue } from "../../core/state.class";
import styles from "./player.module.css"

/**
 * @param {{PlayerState, boolean}} prop
*/
export function  ProgressBar({state, isMini}) {
    const barRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const currentTime = usePlayerValue(state.currentTime)
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

    if(isMini) return;
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

export function CoverArt({ state }) {
    const minimize = usePlayerValue(state.coverArtMinimize)
    const song = usePlayerValue(state.song)
    const toggle = () => state.coverArtMinimize.set(!minimize)
    return (
        <div className={`${styles.coverArt} ${minimize ? styles.minimize : ""}`}>
            <div className={styles.thumbnail}>
                <img src={song?.thumbnail} onClick={toggle} />
            </div>
        </div>
    )
}

export function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function LoopBtn(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const isLoop = usePlayerValue(state.isLoop)

    return (
        <span><svg role="img" className={`icon ${styles.icon} ${isLoop ? styles.green : ""}`} viewBox="0 0 24 24"><path d="M6 2a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h1v-2H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4.798l1.298-1.298a1 1 0 1 0-1.414-1.414L9.373 19l3.713 3.712a1 1 0 0 0 1.414-1.414L13.202 20H18a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"></path></svg></span>
    )
}

export function SuffleBtn(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const isSuffle = usePlayerValue(state.suffle)
    return (
        <span><svg role="img" className={`icon ${styles.icon} ${isSuffle ? styles.green : ""}`} viewBox="0 0 24 24"><path d="M18.788 3.702a1 1 0 0 1 1.414-1.414L23.914 6l-3.712 3.712a1 1 0 1 1-1.414-1.414L20.086 7h-1.518a5 5 0 0 0-3.826 1.78l-7.346 8.73a7 7 0 0 1-5.356 2.494H1v-2h1.04a5 5 0 0 0 3.826-1.781l7.345-8.73A7 7 0 0 1 18.569 5h1.518l-1.298-1.298z"></path><path d="M18.788 14.289a1 1 0 0 0 0 1.414L20.086 17h-1.518a5 5 0 0 1-3.826-1.78l-1.403-1.668-1.306 1.554 1.178 1.4A7 7 0 0 0 18.568 19h1.518l-1.298 1.298a1 1 0 1 0 1.414 1.414L23.914 18l-3.712-3.713a1 1 0 0 0-1.414 0zM7.396 6.49l2.023 2.404-1.307 1.553-2.246-2.67a5 5 0 0 0-3.826-1.78H1v-2h1.04A7 7 0 0 1 7.396 6.49"></path></svg></span>
    )
}


