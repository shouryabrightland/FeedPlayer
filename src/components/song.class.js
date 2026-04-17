// models/Song.js
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
    if(this.video) this.video = basePath+this.video

    // 📊 Derived metadata
    /** @type {int}*/
    this.duration = null;
    /** @type {boolean}*/
    this.isLoaded = false;

    // 🔄 internal loader (no controls exposed)
    this._audio = new Audio(this.songUrl);

    this._audio.addEventListener("loadedmetadata", () => {
      this.duration = this._audio.duration;
      this.isLoaded = true;

      if (this.onLoad) this.onLoad(this); // notify if needed
    });
  }

  // ⏱ helper only (no control)
  getFormattedDuration() {
    if (!this.duration) return "0:00";
    const m = Math.floor(this.duration / 60);
    const s = Math.floor(this.duration % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}