// core/PlayerContext.js
import { createContext, useContext, useRef, useState } from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const audioRef = useRef(new Audio());

    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const playQueue = (songs, startIndex = 0) => {
        if (!songs.length) return;

        setQueue(songs);
        setIndex(startIndex);

        const song = songs[startIndex];
        audioRef.current.src = song.path + song.songUrl;
        audioRef.current.play();

        setIsPlaying(true);
    };

    const toggle = () => {
        if (!audioRef.current.src) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }

        setIsPlaying(p => !p);
    };

    const next = () => {
        if (index >= queue.length - 1) return;

        const newIndex = index + 1;
        setIndex(newIndex);

        const song = queue[newIndex];
        audioRef.current.src = song.path + song.songUrl;
        audioRef.current.play();

        setIsPlaying(true);
    };

    return (
        <PlayerContext.Provider value={{
            queue,
            index,
            isPlaying,
            playQueue,
            toggle,
            next
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);