// models/Song.js
import state from "./state.class";

export default class Song {
  constructor(data, basePath = "") {
    // 📦 Raw metadata
    /** @type {string}*/
    this.title = data.title || "-";
    /** @type {string}*/
    this.description = data.description || "-";
    /** @type {string}*/
    this.thumbnail = basePath + (data.thumbnail || "null.png");
    /** @type {string}*/
    this.songUrl = basePath + (data.songUrl || "");
    /** @type {string[]}*/
    this.media = (data.media || []).map(m => basePath + m);

    /** @type {string}*/
    this.video = data.video || null;
    if (this.video) this.video = basePath + this.video

    // 📊 Derived metadata
    /** @type {state}*/
    this.duration = new state(null)
    /** @type {boolean}*/
    this.isLoaded = new state(false)

    this.loadMetadata()
  }
  loadMetadata() {
    if (this.isLoaded.get()) return;

    const audio = new Audio(this.songUrl);
    audio.addEventListener("loadedmetadata", () => {
      this.duration.set(audio.duration || 0);
      this.isLoaded.set(true);
    });
  }
  // ⏱ helper only (no control)
  getFormattedDuration() {
    if (!this.duration.get()) return "0:00";
    const m = Math.floor(this.duration.get() / 60);
    const s = Math.floor(this.duration.get() % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}