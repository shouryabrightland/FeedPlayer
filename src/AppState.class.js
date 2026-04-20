import state from "./components/state.class";
import { useState, useEffect } from "react";
export class AppState{
    constructor(){
        this.KEY = new state(null)
        this.CONFIG = new state(null)
    }
}


export function useAppState(stateObj) {
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