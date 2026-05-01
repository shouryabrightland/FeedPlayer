import { useState, useEffect } from "react";
export default class state {
  constructor(value , name = "unknown") {
    this.listeners = [];
    this.value = value;
    this.name = name
  }

  get() {
    return this.value;
  }

  set(value) {
    if (this.value === value) return;
    console.warn("STATE CHANGED",this.name,this.value,"->",value)
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

export function usePlayerValue(stateObj) {
  const [value, setValue] = useState(stateObj?.get());

  useEffect(() => {
    if (!stateObj) return;

    const update = (newVal) => {
      setValue(prev => (prev === newVal ? prev : newVal));
    };

    update(stateObj.get());
    return stateObj.onUpdate(update);
  }, [stateObj]);

  return value;
}
