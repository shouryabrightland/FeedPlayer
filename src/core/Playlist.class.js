import Song from "./song.class";
import state from "./state.class";
export class PlayList {
  constructor(id) {
    this.isValid = null
    this.isLoaded = new state(false,"isLoaded")
    this.isSongsLoaded = new state(false, "isSongLoaded")
    this.id = id
    this.path = this.decodeID(this.id)
    this.thumbnailUrl = null
    this.title = null
    this.description = null
    this.songs = new state([],"songs of Playlist")
    this.songsUrl = ""
  }
  async init() {
    this.isLoaded.set(false)
    this.isValid = await (async () => {
      try {
        if (!this.isValidPlaylist(this.id)) return false;
        console.log("fetching Playlist:", this.id);
        const data = await this._safeFetchJSON(this.path + "index.json", { maxSize: 1024, timeout: 3000 });
        if (!data?.isKey || !data?.config) {
          throw new Error("Invalid PlaylistID structure");
        }
        const configRes = await fetch(this.path + data.config);
        const configData = await configRes.json();
        this.thumbnailUrl = this.path + (configData.thumbnail || "")
        this.title = configData.title || ""
        this.description = configData.description || ""
        this.songsUrl = this.path + (configData.songsUrl || "")
        return true;
      } catch (err) {
        console.log("invalid Playlist ID:", err);
        return false
      }
    })()
    this.isLoaded.set(true)
  }
  isValidPlaylist(key) {
  return typeof key === "string" &&
    key.length < 50 &&                 // limit size
    /^[a-zA-Z0-9/_-]+$/.test(key);    // whitelist chars
}
  encodeID(raw) {
    if (!raw) return "";
    // return btoa(raw)
    //   .replace(/\+/g, "-")
    //   .replace(/\//g, "_")
    //   .replace(/=+$/, "");

    return raw;
  }
  decodeID(encoded) {
    if (!encoded) return "";
    // encoded = encoded
    //   .replace(/-/g, "+")
    //   .replace(/_/g, "/");

    // while (encoded.length % 4) {
    //   encoded += "=";
    // }

    // return atob(encoded);

    return encoded
  }
  async loadSongs() {
    if (!this.songsUrl || this.isSongsLoaded) return

    this.isSongsLoaded.set(false)
    this.isValid = await (async () => {
      try {
        const SongsRes = await fetch(this.path + this.songsUrl);
        const SongsData = await SongsRes.json();
        this.songs.set(SongsData.song_list.map(s => new Song(s, this.path)))
        return true
      } catch (e) {
        console.log("invalid Playlist Songs:", e);
        return false
      }
    })()
    this.isSongsLoaded.set(true)
  }

  async _safeFetchJSON(url, { maxSize = 1024, timeout = 3000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal });

      // ❗ 1. Check status
      if (!res.ok) {
        throw new Error("HTTP error: " + res.status);
      }

      // ❗ 2. Check content type
      const type = res.headers.get("content-type") || "";
      if (!type.includes("application/json")) {
        throw new Error("Not JSON (probably HTML page)");
      }

      // ❗ 3. Check size (header)
      const length = res.headers.get("content-length");
      if (length && Number(length) > maxSize) {
        throw new Error("File too large");
      }

      const text = await res.text();

      // ❗ 4. Extra safety: detect HTML manually
      if (text.trim().startsWith("<")) {
        throw new Error("Received HTML instead of JSON");
      }

      if (text.length > maxSize) {
        throw new Error("File too large");
      }

      return JSON.parse(text);

    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  getInfo() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      songsUrl: this.songsUrl,
      thumbnail: this.thumbnailUrl
    }
  }
}
