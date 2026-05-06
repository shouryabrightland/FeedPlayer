// usePlayer.js
import { useState, useRef, useEffect, useCallback } from "react";
import { APP_NAME, LastPlayList_Key, STORAGE_KEY } from "../const";
import { encodeID } from "../services/PlaylistIDServices";
import { usePlaylistCtx } from "./PlaylistProvider";

export function usePlayer() {
    const audioRef = useRef(null);
    const nextRef = useRef(null);
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    if (!nextRef.current) {
        nextRef.current = new Audio();
    }

    const PlaylistMetaRef = useRef(null);

    const [current, setCurrent] = useState(null);
    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoop, setIsLoop] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const prevIndexRef = useRef(-1);
    const nextIndexRef = useRef(-1);
    const shouldPlayRef = useRef(false);

    const playlist = usePlaylistCtx();

    const setSource = useCallback((audioRef, song) => {
        audioRef.current.src = song ? song.path + song.songUrl : "";
        audioRef.current.preload = "auto"
    }, [])

    const reset = useCallback(() => {
        setCurrent(null)
        setQueue([])
        setIndex(-1)
        setIsPlaying(false)
        setIsLoop(false)
        setIsShuffle(false)
        setIsLoading(false)
        setIsVisible(false)
        audioRef.current.pause()
        setSource(audioRef, "")

        setSource(nextRef, "")
        nextIndexRef.current = prevIndexRef.current = -1;

        localStorage.removeItem(LastPlayList_Key)
        localStorage.removeItem(STORAGE_KEY);
        shouldPlayRef.current = false;
    }, [setSource])

    const play = useCallback(() => {
        shouldPlayRef.current = true;

        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    }, []);

    const pause = useCallback(() => {
        shouldPlayRef.current = false;

        audioRef.current.pause();
        setIsPlaying(false);
    }, []);

    const seek = useCallback((time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, [])

    const load = useCallback((list, Playlist = null, start = 0) => {
        PlaylistMetaRef.current = Playlist;
        if (!list?.length) return;
        setQueue(list);
        const safeIndex = Math.min(start, list.length - 1);
        setIndex(safeIndex)
        setCurrent(list[safeIndex])
        setSource(audioRef, list[safeIndex])
        seek(0);
        play()
    }, [seek,setSource]);

    const next = useCallback(() => {
        if (nextIndexRef.current >= 0) {
            setSource(audioRef,queue[nextIndexRef.current]);
            setIndex(nextIndexRef.current);
            setCurrent(queue[nextIndexRef.current]);
        }
        seek(0)
        if (shouldPlayRef.current) play();
    }, [seek,queue,play,setSource]);

    const prev = useCallback(() => {
        if (prevIndexRef.current >= 0) {
            setSource(audioRef,queue[prevIndexRef.current]);
            setIndex(prevIndexRef.current);
            setCurrent(queue[prevIndexRef.current]);
        }
        seek(0)
        if (shouldPlayRef.current) play();
    }, [seek,queue,play,setSource]);

    const toggle = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);


    //index update
    useEffect(() => {
        if (queue.length === 0) return;

        let nextIndex = (index + 1) % queue.length;
        let prevIndex = (index - 1 + queue.length) % queue.length;

        if (isLoop) {
            prevIndex = -1;
            nextIndex = -1;
        }

        if (isShuffle) {
            let a = Math.floor(Math.random() * queue.length);
            if (a !== index) nextIndex = a % queue.length;
        }

        if (nextIndex !== nextIndexRef.current) {
            const nextSong = queue[nextIndex];
            setSource(nextRef, nextSong)
            nextIndexRef.current = nextIndex
        }

        if (prevIndex !== prevIndexRef.current) {
            prevIndexRef.current = prevIndex
        }

    }, [isLoop, isShuffle, index, queue,setSource])



    //load player
    useEffect(() => {
        try {
            const str = localStorage.getItem(STORAGE_KEY);
            if (!str) return;
            const saved = JSON.parse(str);

            if (!saved) return;

            setQueue(saved.queue || []);
            setIndex(saved.index ?? -1);
            setIsLoop(saved.isLoop || false);
            setIsShuffle(saved.isShuffle || false);

            if (saved.queue && saved.index >= 0) {
                const song = saved.queue[saved.index];
                setCurrent(song);
                setSource(audioRef, song)
                // restore time
                if (saved.currentTime) {
                    audioRef.current.currentTime = saved.currentTime;
                }
            }

        } catch (e) {
            console.error("Failed to load player state", e);
        }
    }, [setSource]);

    //update player
    useEffect(() => {
        const data = {
            queue,
            index,
            isLoop,
            isShuffle,
            currentTime: audioRef.current.currentTime
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(LastPlayList_Key, encodeID(current?.path))

    }, [queue, index, isLoop, isShuffle, isPlaying, current]);



    //resolve play when user want
    useEffect(() => {
        if (!current) return;

        if (!shouldPlayRef.current) return;

        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));

    }, [current]);

    //auto next
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnd = () => {
            next()
        };
        audio.addEventListener("ended", handleEnd);
        return () => {
            audio.removeEventListener("ended", handleEnd);
        };
    }, [next]);

    //checking songs in existing playlist
    useEffect(() => {
        if (!playlist.ready || !current) return;

        const id = encodeID(current.path);
        const exists = playlist.playlists.some(p => p.id === id);

        console.log("exist check", exists, id, "sdf",current.path)

        if (!exists) reset();
    }, [current, playlist.ready, playlist.playlists, reset]);


    //title update
    useEffect(() => {
        if (current) {
            document.title = `${isPlaying ? "▶" : "⏸"} ${current.title} • ${APP_NAME}`;
        } else {
            document.title = APP_NAME;
        }
    }, [current, isPlaying]);

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
    }, [index]);



    return {
        PlaylistMetaRef,
        index,
        current,
        isPlaying,
        isActive: current ? true : false,
        isNext: (nextIndexRef.current >= 0),
        isPrev: (prevIndexRef.current >= 0),
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

        isLoading,

        reset,

        isVisible,
        setIsVisible
    };
}