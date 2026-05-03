import { useEffect, useRef, useState } from "react";

import { LoopIcon, NextIcon, PreviousIcon, SuffleIcon } from "../../icons"
import { getAverageColor, PlayBtn } from "../../components/sm_components";

import PlayerStyles from "./player.module.css"

export function LoopBtn({active}) {
    return (
        <span className={active ? PlayerStyles.green:""}>
            <LoopIcon styles={PlayerStyles}/>
        </span>
    )
}

export function SuffleBtn({active}) {
    return (
        <span className={active? PlayerStyles.green:""}>
            <SuffleIcon styles={PlayerStyles}/>
        </span>
    )
}


export function PlayerControl({ player }) {
    const {
        toggle,
        next,
        prev,
        isPlaying,
        isLoop,
        isShuffle,
        setIsLoop,
        setIsShuffle
    } = player;

    const toggleLoop = ()=>setIsLoop(!isLoop)
    const toggleShuffle = ()=>setIsShuffle(!isShuffle)

    const isLoading = player.isLoading
    const toggleBtn = ()=>{
        if(!isLoading) toggle()
    }

    return (
        <div className={PlayerStyles.playerControl}>
            <div className={PlayerStyles.options}>

                {/* Shuffle */}
                <div className={PlayerStyles.opt} onClick={toggleShuffle}>
                    <SuffleBtn active={isShuffle} />
                </div>

                {/* Previous */}
                <div className={PlayerStyles.opt} onClick={prev}>
                    <span>
                        <PreviousIcon styles={PlayerStyles}/>
                    </span>
                </div>

                {/* Play / Pause */}
                <div className={`${PlayerStyles.opt} ${PlayerStyles.playbtn}`} onClick={toggleBtn}>
                    <PlayBtn styles={PlayerStyles} isPlaying={isPlaying} isLoading={isLoading} />
                </div>

                {/* Next */}
                <div className={PlayerStyles.opt} onClick={next}>
                    <span>
                        <NextIcon styles={PlayerStyles}/>
                    </span>
                </div>

                {/* Loop */}
                <div className={PlayerStyles.opt} onClick={toggleLoop}>
                    <LoopBtn active={isLoop} />
                </div>

            </div>
        </div>
    );
}



export function ProgressBar({ player }) {
    const barRef = useRef(null);
    const progressRef = useRef(null);
    const bufferRef = useRef(null);

    const wasPlayingRef = useRef(false);
    const rafRef = useRef(null);

    const [time, setTime] = useState({ current: 0, duration: 0 });
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        const audio = player.audioRef.current;
        if (!audio) return;

        const updateUI = () => {
            if (!audio.duration) return;

            const current = audio.currentTime;
            const duration = audio.duration;

            // progress
            if (progressRef.current) {
                progressRef.current.style.width =
                    (current / duration) * 100 + "%";
            }

            // buffer
            if (bufferRef.current && audio.buffered.length) {
                const end = audio.buffered.end(audio.buffered.length - 1);
                bufferRef.current.style.width =
                    (end / duration) * 100 + "%";
            }

            // labels (low freq safe)
            setTime({ current, duration });
        };

        const rafLoop = () => {
            updateUI();
            rafRef.current = requestAnimationFrame(rafLoop);
        };

        const startRAF = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(rafLoop);
        };

        const stopRAF = () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };

        const onTimeUpdate = () => {
            if (!audio.duration || !audio.paused) return;
            updateUI();
        };

        const onVisibility = () => {
            if (document.hidden) stopRAF();
            else if (!audio.paused) startRAF();
        };

        audio.addEventListener("play", startRAF);
        audio.addEventListener("pause", stopRAF);
        audio.addEventListener("ended", stopRAF);
        audio.addEventListener("timeupdate", onTimeUpdate);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            stopRAF();
            audio.removeEventListener("play", startRAF);
            audio.removeEventListener("pause", stopRAF);
            audio.removeEventListener("ended", stopRAF);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [player.audioRef]);

    // 🎯 Drag logic
    useEffect(() => {
        if (!dragging) return;

        const move = (e) => handleSeek(e);
        const up = () => {
            setDragging(false);
            if (wasPlayingRef.current) player.play();
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);

        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
    }, [dragging]);

    function handlePointerDown(e) {
        const audio = player.audioRef.current;
        if (!audio) return;

        wasPlayingRef.current = player.isPlaying;
        setDragging(true);
        player.pause();
        handleSeek(e);
    }

    function handleSeek(e) {
        const audio = player.audioRef.current;
        if (!audio || !barRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;

        x = Math.max(0, Math.min(x, rect.width));

        const percent = x / rect.width;
        audio.currentTime = percent * (audio.duration || 0);
    }

    function format(t) {
        if (!t) return "0:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    return (
        <div className={PlayerStyles.progressBar} ref={barRef} onPointerDown={handlePointerDown}>
            <div className={PlayerStyles.bar}>
                <div ref={bufferRef} className={PlayerStyles.buffer}></div>
                <div ref={progressRef} className={PlayerStyles.progress}></div>
            </div>

            <div className={PlayerStyles.label}>
                <span className={PlayerStyles.start}>{format(time.current)}</span>
                <span className={PlayerStyles.end}>{format(time.duration)}</span>
            </div>
        </div>
    );
}