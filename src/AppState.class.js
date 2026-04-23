import state from "./components/state.class";
import { useState, useEffect } from "react";
export class AppState{
    constructor(){
        this.KEY = new state(null)
        this.isValidKey = new state(0) //0,1,-1 -> 3 states
        this.CONFIG = new state(null)
        
        //login
        this.LoginNeeded = new state(false)
        
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