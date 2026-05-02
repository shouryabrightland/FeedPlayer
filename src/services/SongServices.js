export async function fetchSongs(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();

        return (data.song_list || []);
    } catch (e) {
        console.log("songs error", e);
        return [];
    }
}