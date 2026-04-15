import Song from "./song.class";

class state {
  constructor(value) {
    this.onchangelistener = []
    this.set(value)
  }
  get() {
    return this.value
  }
  set(value) {
    this.value = value
    this.onchangelistener.forEach((onchange) => {
      if (onchange) onchange(this.get())
    })
  }
  onUpdate(fn) {
    this.onchangelistener.push(fn);

    return () => {
      this.onchangelistener =
        this.onchangelistener.filter(f => f !== fn);
    };
  }
}

export default class PlayerState {
  constructor() {

    // 🎵 Single global audio instance
    /** @type {HTMLAudioElement}*/
    this.audio = new Audio();

    // 📊 State
    this.isActive = new state(false);
    this.isPlaying = new state(false);
    this.song = new state(null);
    this.currentTime = new state(0);
    this.duration = new state(0);
    this.onSongEnd = null;

    // 🎧 Events
    this.audio.addEventListener("timeupdate", () => {
      const t = this.audio.currentTime;

      if (Math.abs(t - this.currentTime.get()) > 0.3) {
        this.currentTime.set(t);
      }
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.duration.set(this.audio.duration);
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying.set(true)
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener("ended", () => {
      this.isPlaying.set(false)
      this.onSongEnd?.();
    });
  }

  // ▶️ Play a new song
  play(song) {
    if (!song || !song.songUrl) return;

    // If new song → change source
    if (!this.song.get() || this.song.get().songUrl !== song.songUrl) {
      this.audio.src = song.songUrl;
      this.song.set(song);
    }

    this.isActive.set(true);
    this.audio.play();
  }

  // ⏸ Pause
  pause() {
    this.audio.pause();
  }

  // 🔁 Toggle
  toggle() {
    this.isPlaying.get() ? this.pause() : this.audio.play();
  }

  // ⏩ Seek
  seek(time) {
    this.audio.currentTime = time;
  }

  // 🔊 Volume
  setVolume(v) {
    this.audio.volume = v;
  }

  // ⏹ Stop
  stop() {
    this.audio.pause();
    this.audio.currentTime.set(0);
    this.isPlaying.set(false);
    this.isActive.set(false);
    this.song.set(null);
  }

  // 📈 Helpers
  getProgress() {
    if (!this.duration.get()) return 0;
    return (this.currentTime.get() / this.duration.get()) * 100;
  }

  formatTime(sec) {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}