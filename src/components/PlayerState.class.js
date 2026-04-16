class state {
  constructor(value) {
    this.listeners = [];
    this.value = value;
  }

  get() {
    return this.value;
  }

  set(value) {
    this.value = value;
    this.listeners.forEach(fn => fn && fn(value));
  }

  onUpdate(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }
}

export default class PlayerState {
  constructor() {
    this.audio = new Audio();

    // 🎯 reactive states
    this.isActive = new state(false);
    this.isPlaying = new state(false);
    this.song = new state(null);
    this.currentTime = new state(0);
    this.duration = new state(0);

    // 🎵 queue system
    this.queue = new state([]);
    this.queueIndex = new state(0);

    this.isLoop = new state(false);
    this.suffle = new state(false);

    // 🎧 audio events
    this.audio.addEventListener("timeupdate", () => {
      const t = this.audio.currentTime;

      // throttle updates
      if (Math.abs(t - this.currentTime.get()) > 0.25) {
        this.currentTime.set(t);
      }
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.duration.set(this.audio.duration || 0);
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying.set(true);
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener("ended", () => {
      this.next();
    });
  }

  // 🎵 Load full queue and start
  loadQueue(list = [], startIndex = 0) {
    if (!Array.isArray(list) || list.length === 0) {
      console.error("❌ Invalid queue");
      return;
    }

    const safeIndex = Math.max(0, Math.min(startIndex, list.length - 1));

    this.queue.set(list);
    this.queueIndex.set(safeIndex);

    this._playCurrent();
  }

  // ▶️ internal play (queue only)
  _playCurrent() {
    const q = this.queue.get();
    const i = this.queueIndex.get();
    const song = q[i];

    if (!song || !song.songUrl) {
      console.error("❌ Invalid song in queue");
      return;
    }

    // avoid reloading same song
    if (!this.song.get() || this.song.get().songUrl !== song.songUrl) {
      this.audio.src = song.songUrl;
      this.song.set(song);
    }

    this.isActive.set(true);
    this.audio.play();
  }

  // ▶️ Resume (NOT play new song)
  resume() {
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
    this.isPlaying.get() ? this.pause() : this.resume();
  }

  // ⏭ Next
  next() {
    if(!this.isLoop.get()){

      const q = this.queue.get();
      if (!q.length) return;
  
      let i = this.queueIndex.get();
      i = this.suffle.get()?Math.round(Math.random()*(q.length-1)):(i + 1) % q.length;
  
      this.queueIndex.set(i);
    }
    this.seek(0);
    this._playCurrent();
  }

  // ⏮ Prev
  prev() {
    const q = this.queue.get();
    if (!q.length) return;

    // Spotify behavior
    if (this.currentTime.get() > 3) {
      this.seek(0);
      return;
    }

    let i = this.queueIndex.get();
    i = (i - 1 + q.length) % q.length;

    this.queueIndex.set(i);
    this._playCurrent();
  }

  // ⏩ Seek
  seek(time) {
    this.audio.currentTime = time;
  }

  // 🔊 Volume
  setVolume(v) {
    this.audio.volume = Math.max(0, Math.min(1, v));
  }

  // ⏹ Stop everything
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;

    this.isPlaying.set(false);
    this.isActive.set(false);
    this.song.set(null);

    this.queue.set([]);
    this.queueIndex.set(0);
  }

  // 📈 Helpers
  getProgress() {
    const d = this.duration.get();
    if (!d) return 0;
    return (this.currentTime.get() / d) * 100;
  }

  formatTime(sec) {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}