import state from "./state.class";

export default class Song {
  constructor(data, basePath = "") {
    this.title = data.title || "-";
    this.description = data.description
    this.songUrl = basePath + (data.songUrl || "");

    // optional UI metadata
    this.thumbnail = basePath + (data.thumbnail || "null.png");

    this.media = (data.media || []).map(m =>{return {type:m?.type,src:basePath + m?.src}});

    // purely informational (no logic attached)
    this.duration = new state(null);
  }
}