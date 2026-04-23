import state from "./state.class";

export default class PlayerState {
  constructor() {
    // 🎧 main audio
    this.audio = new Audio();

    // 🎧 preloaded next audio
    this.nextAudio = null;

    // 🎯 states
    this.isActive = new state(false);
    this.isPlaying = new state(false);
    this.isLoading = new state(false);

    this.song = new state(null);
    this.currentTime = new state(0);
    this.duration = new state(0);
    this.bufferedPercent = new state(0);

    this.coverArtMinimize = new state(false);

    // 🎵 queue
    this.queue = new state([]);
    this.queueIndex = new state(0);

    this.prevSong = new state(null);
    this.nextSong = new state(null);

    this.isLoop = new state(false);
    this.suffle = new state(false);

    this._bindAudioEvents(this.audio);
  }

  // =========================
  // 🎧 AUDIO EVENTS
  // =========================

  _bindAudioEvents(audio) {
    audio.addEventListener("timeupdate", () => {
      const t = audio.currentTime;
      if (Math.abs(t - this.currentTime.get()) > 0.25) {
        this.currentTime.set(t);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      this.duration.set(audio.duration || 0);
    });

    audio.addEventListener("progress", () => {
      if (!audio.duration) return;

      try {
        const buffered = audio.buffered;
        if (buffered.length > 0) {
          const end = buffered.end(buffered.length - 1);
          const percent = (end / audio.duration) * 100;
          this.bufferedPercent.set(percent);
        }
      } catch {}
    });

    audio.addEventListener("play", () => {
      this.isPlaying.set(true);
    });

    audio.addEventListener("pause", () => {
      this.isPlaying.set(false);
    });

    audio.addEventListener("ended", () => {
      this.next();
    });
  }

  // =========================
  // 🎵 QUEUE CONTROL
  // =========================

  loadQueue(list = [], startIndex = 0) {
    if (!Array.isArray(list) || list.length === 0) return;

    const i = Math.max(0, Math.min(startIndex, list.length - 1));

    this.queue.set(list);
    this.queueIndex.set(i);

    this._playCurrent();
  }

  _getCurrentSong() {
    return this.queue.get()[this.queueIndex.get()] || null;
  }

  _getNextIndex() {
    const q = this.queue.get();
    if (!q.length) return 0;

    if (this.suffle.get()) {
      return Math.floor(Math.random() * q.length);
    }

    return (this.queueIndex.get() + 1) % q.length;
  }

  _getPrevIndex() {
    const q = this.queue.get();
    if (!q.length) return 0;

    return (this.queueIndex.get() - 1 + q.length) % q.length;
  }

  // =========================
  // ▶️ CORE PLAY LOGIC
  // =========================

  _playCurrent() {
    const song = this._getCurrentSong();
    if (!song) return;

    // try reuse preloaded audio
    if (this._usePreloaded(song)) {
      this.audio.play();
    } else {
      this._loadSong(song);
      this.audio.play().catch(() => {
        this.isPlaying.set(false);
      });
    }

    this.isActive.set(true);
    this._updateNeighbors();
  }

  _loadSong(song) {
    this.isLoading.set(true);

    this.audio.src = song.songUrl;
    this.song.set(song);

    const onReady = () => {
      this.isLoading.set(false);
      this.audio.removeEventListener("canplay", onReady);
    };

    this.audio.addEventListener("canplay", onReady);
  }

  // =========================
  // ⚡ PRELOAD SYSTEM
  // =========================

  _preloadNext() {
    const next = this.nextSong.get();
    if (!next) return;

    // already preloaded
    if (this.nextAudio && this.nextAudio.src === next.songUrl) return;

    this.nextAudio = new Audio();
    this.nextAudio.preload = "auto";
    this.nextAudio.src = next.songUrl;
  }

  _usePreloaded(song) {
    if (this.nextAudio && this.nextAudio.src === song.songUrl) {
      this.audio.pause();

      this.audio = this.nextAudio;
      this.nextAudio = null;

      this._bindAudioEvents(this.audio);
      this.song.set(song);

      return true;
    }
    return false;
  }

  // =========================
  // 🔄 NAVIGATION
  // =========================

  next() {
    if (!this.isLoop.get()) {
      this.queueIndex.set(this._getNextIndex());
    }
    this._playCurrent();
  }

  prev() {
    if (this.currentTime.get() > 3) {
      this.seek(0);
      return;
    }

    this.queueIndex.set(this._getPrevIndex());
    this._playCurrent();
  }

  // =========================
  // 🎛 CONTROLS
  // =========================

  play() {
    if (!this.audio.src) {
      this._playCurrent();
      return;
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  toggle() {
    this.isPlaying.get() ? this.pause() : this.play();
  }

  seek(t) {
    this.audio.currentTime = t;
  }

  setVolume(v) {
    this.audio.volume = Math.max(0, Math.min(1, v));
  }

  // =========================
  // 🧠 NEIGHBOR MGMT
  // =========================

  _updateNeighbors() {
    const q = this.queue.get();
    const i = this.queueIndex.get();

    this.prevSong.set(q[i - 1] || null);
    this.nextSong.set(q[i + 1] || null);

    this._preloadNext();
  }

  // =========================
  // 🧹 CLEANUP (CONTROLLED)
  // =========================

  clearCurrentBuffer() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();

    this.bufferedPercent.set(0);
    this.isLoading.set(false);
  }

  clearNextBuffer() {
    if (this.nextAudio) {
      this.nextAudio.pause();
      this.nextAudio.src = "";
      this.nextAudio = null;
    }
  }

  stop() {
    this.pause();
    this.seek(0);

    this.isActive.set(false);
    this.song.set(null);

    this.queue.set([]);
    this.queueIndex.set(0);

    this.clearNextBuffer();
  }

  // =========================
  // ⏱ UTILS
  // =========================

  formatTime(sec) {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  destroy() {
    this.stop();
    this.audio.src = "";
    this.nextAudio = null;
  }
}