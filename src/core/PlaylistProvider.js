import React, { createContext, useContext } from "react";
import { usePlaylists } from "./usePlaylists";

const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
    const store = usePlaylists();
    return (
        <PlaylistContext.Provider value={store}>
            {children}
        </PlaylistContext.Provider>
    );
}

export function usePlaylistCtx() {
    return useContext(PlaylistContext);
}