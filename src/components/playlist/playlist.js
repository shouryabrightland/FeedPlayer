import "./playlist.css"
import List from "./list"
import Song from "../song.class"
import PlayerState from "../PlayerState.class"
import { Play_btn } from "../sm_components"
import { useState, useEffect } from "react"

function useTotalDuration(list = []) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!list.length) return;

    const update = () => {
      const sum = list.reduce((acc, song) => acc + (song.duration.get() || 0), 0);
      setTotal(sum);
    };

    // subscribe to all songs
    const cleanups = list.map(song =>
      song.duration.onUpdate(update)
    );

    // initial calc
    update();

    return () => cleanups.forEach(fn => fn && fn());
  }, [list]);

  return total;
}

function formatTotal(sec) {
  const m = Math.floor(sec / 60);
  return `${m} min`;
}

function Playlist(prop) {
    const CONFIG = prop.config || {}
    const KEY = prop.k || ""
    const title = CONFIG.title || null
    const Description = CONFIG.description || null
    const thumbnail_url = CONFIG.thumbnail || null

    /** @type {Song[]} */
    const list = CONFIG["song_list"] || []

    /**@type {PlayerState}*/
    const state = prop.playstate

    const totalDuration = useTotalDuration(list);
    
    return (
        <div className="playlist">
            <div className='firstpage'>
                <div className="thumbnail">
                    {thumbnail_url && <img src={KEY + thumbnail_url} />}
                </div>
                <div className="outer-btn">
                    <div className="playbtn" onClick={() => {
                        state.loadQueue(list, state.queue.get() === list ? state.queueIndex.get() : 0)
                    }}>
                        <Play_btn state={state} />
                    </div>
                </div>

                <div className="info">
                    <div className="pt1 title">{title}</div>
                    <div className="pt1 desc">{Description}</div>
                    <div className="pt2 playlistInfo">{list.length} songs<span className="dot"></span> {formatTotal(totalDuration)}</div>
                    <div className="options">

                        <div className="opt like">
                            <svg role="img" aria-hidden="true" className="icon" viewBox="0 0 24 24"><path d="M5.21 1.57a6.76 6.76 0 0 1 6.708 1.545.124.124 0 0 0 .165 0 6.74 6.74 0 0 1 5.715-1.78l.004.001a6.8 6.8 0 0 1 5.571 5.376v.003a6.69 6.69 0 0 1-1.49 5.655l-7.954 9.48a2.518 2.518 0 0 1-3.857 0L2.12 12.37A6.68 6.68 0 0 1 .627 6.714 6.76 6.76 0 0 1 5.21 1.57m3.12 1.803a4.757 4.757 0 0 0-5.74 3.725l-.001.002a4.68 4.68 0 0 0 1.049 3.969l.009.01 7.958 9.485a.518.518 0 0 0 .79 0l7.968-9.495a4.69 4.69 0 0 0 1.049-3.965 4.8 4.8 0 0 0-3.931-3.794 4.74 4.74 0 0 0-4.023 1.256l-.008.008a2.123 2.123 0 0 1-2.9 0l-.007-.007a4.76 4.76 0 0 0-2.214-1.194z"></path></svg>
                        </div>

                        <div className="opt">
                            <svg role="img" aria-hidden="true" className="icon" viewBox="0 0 24 24">
                                <path d="M18.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M15 5.5a3.5 3.5 0 1 1 1.006 2.455L9 12l7.006 4.045a3.5 3.5 0 1 1-.938 1.768l-6.67-3.85a3.5 3.5 0 1 1 0-3.924l6.67-3.852A3.5 3.5 0 0 1 15 5.5m-9.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m13 6.5a1.5 1.5 0 1 0-.001 3 1.5 1.5 0 0 0 .001-3"></path>
                            </svg>
                        </div>

                        <div className="opt">
                            <svg role="img" aria-hidden="true" className="icon" viewBox="0 0 24 24">
                                <path d="M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 15a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-7.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"></path></svg>
                        </div>

                    </div>
                </div>
            </div>
            <List list={list} k={KEY} playstate={state} />
        </div>
    )
}

export default Playlist