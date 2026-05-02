import { DB } from "./db";
import state from "./state.class";
import { useState, useEffect } from "react";

import { PlayList } from "./Playlist.class";
export class AppState {
  constructor() {
    this._DB = new DB("FeedPlayer", "Appstate", 1)
    this.KEY = new state(null, "key")
    this.PlayLists = new state([], "PlaylistList")

    this.PlayLists.onUpdate(async (val) => {
      try {
        await this._DB.set(this.PlayLists.name, val)
      } catch (e) {
        console.log(e)
      }
    })
  }
  async init() {
    const val = await this._DB.get(this.PlayLists.name);
    if (Array.isArray(val)) {
      this.PlayLists.set(val);
    }
  }
  async AddPlaylist(id) {
    if (this.ContainsPlaylist(id)) return false;

    const playlist = new PlayList(id)
    await playlist.init()

    if (!playlist.isValid) return false;

    this.PlayLists.set([...this.PlayLists.get(), playlist.getInfo()])
  }

  ContainsPlaylist(id) {

    const current = this.PlayLists.get()
    for (let i = 0; i < current.length; i++) {
      const playlist = current[i];
      if (id == playlist.id) return true
    }
    return false

  }

  RemovePlaylist(id) {
    this.PlayLists.set(this.PlayLists.get().filter((v) => v.id != id))
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