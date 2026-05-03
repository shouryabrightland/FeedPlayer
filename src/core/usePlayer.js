// usePlayer.js
import { useState, useRef, useEffect } from "react";
import { LastPlayList_Key, STORAGE_KEY } from "../const";
import { encodeID } from "../services/PlaylistIDServices";

export function usePlayer() {
    const audioRef = useRef(new Audio());
    const PlaylistMetaRef = useRef(null);

    const [current, setCurrent] = useState(null);
    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isActive, setisActive] = useState(false);
    const [isLoop, setIsLoop] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            if (!saved) return;

            setQueue(saved.queue || []);
            setIndex(saved.index ?? -1);
            setIsLoop(saved.isLoop || false);
            setIsShuffle(saved.isShuffle || false);

            if (saved.queue && saved.index >= 0) {
                const song = saved.queue[saved.index];
                setCurrent(song);

                audioRef.current.src = song.path + song.songUrl;

                // restore time
                if (saved.currentTime) {
                    audioRef.current.currentTime = saved.currentTime;
                }

                setisActive(true);
            }

        } catch (e) {
            console.error("Failed to load player state", e);
        }
    }, []);

    useEffect(() => {
        if (!isActive) return;

        const data = {
            queue,
            index,
            isLoop,
            isShuffle,
            currentTime: audioRef.current.currentTime
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(LastPlayList_Key,encodeID(current?.path))

    }, [queue, index, isLoop, isShuffle, isActive, isPlaying]);

    const play = () => {
        if (!isActive) return;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const pause = () => {
        if (!isActive) return;
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const load = (list, Playlist = null, start = 0) => {
        PlaylistMetaRef.current = Playlist;
        setQueue(list);
        setIndex(start);
        setCurrent(list[start]);
        audioRef.current.src = list[start].path + list[start].songUrl;
        setisActive(true)
        audioRef.current.play();
        setIsPlaying(true);
    };

    const next = () => {
        if (!isActive) return;

        let i;

        if (isShuffle) {
            i = Math.floor(Math.random() * queue.length);
        } else {
            i = index + 1;
        }

        if (i >= queue.length) {
            if (isLoop) i = 0;
            else return;
        }

        setIndex(i);
        setCurrent(queue[i]);
        audioRef.current.src = queue[i].path + queue[i].songUrl;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const prev = () => {
        if (!isActive) return;

        let i = index - 1;

        if (i < 0) {
            if (isLoop) i = queue.length - 1;
            else return;
        }

        setIndex(i);
        setCurrent(queue[i]);
        audioRef.current.src = queue[i].path + queue[i].songUrl;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const toggle = () => isPlaying ? pause() : play();

    const seek = (time) => {
        audioRef.current.currentTime = time;
    };

    //auto next
    useEffect(() => {
        const audio = audioRef.current;

        const handleEnd = () => {
            if (isLoop && !isShuffle) {
                next(); // loop playlist
            } else {
                next();
            }
        };

        audio.addEventListener("ended", handleEnd);

        return () => {
            audio.removeEventListener("ended", handleEnd);
        };
    }, [index, queue, isLoop, isShuffle]);

    //hooking with audio
    useEffect(() => {
        const audio = audioRef.current;

        const loading = () => setIsLoading(true);
        const canPlay = () => setIsLoading(false);

        audio.addEventListener("waiting", loading);
        audio.addEventListener("playing", canPlay);

        return () => {
            audio.removeEventListener("waiting", loading);
            audio.removeEventListener("playing", canPlay);
        };
    }, []);



    return {
        PlaylistMetaRef,
        index,
        current,
        isPlaying,
        isActive,
        audioRef,

        play,
        pause,
        toggle,
        load,
        next,
        prev,
        seek,

        isLoop,
        setIsLoop,

        isShuffle,
        setIsShuffle,

        isLoading
    };
}