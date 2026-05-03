import { createContext, useContext } from "react";
import { usePlayer } from "./usePlayer";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const player = usePlayer();
    return (
        <PlayerContext.Provider value={player}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayerCtx() {
    return useContext(PlayerContext);
}