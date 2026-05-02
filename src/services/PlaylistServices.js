import { decodeID } from "./PlaylistIDServices";

export async function fetchPlaylist(id) {
    // validation
    if (!id || typeof id !== "string") return null;

    try {
        const path = decodeID(id);

        const res = await fetch(path + "index.json");
        const data = await res.json();

        if (!data?.isKey || !data?.config) return null;

        const configRes = await fetch(path + data.config);
        const config = await configRes.json();

        return {
            id,
            path,
            title: config.title || "",
            description: config.description || "",
            thumbnail: path + (config.thumbnail || ""),
            songsUrl: path + (config.songsUrl || "")
        };

    } catch (e) {
        console.log("invalid playlist", e);
        return null;
    }
}

