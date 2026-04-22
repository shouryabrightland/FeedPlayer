import Song from "./components/song.class"
export function buildConfig(data, KEY) {
  return {
    ...data,
    song_list: data.song_list.map(s => new Song(s, KEY)),
    _key: KEY
  }
}