export default class state {
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
    if (typeof fn !== "function") return () => { };
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }
}
