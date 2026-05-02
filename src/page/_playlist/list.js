import PlayerState from "../../core/PlayerState.class";
import Song from "../../core/song.class";
import { usePlayerValue } from "../../core/state.class";
import styles from "./list.module.css";
import React from "react"

export default React.memo(function List(prop) {
    console.log("Rendering List")
    /** @type {Song[]}*/
    const list = prop.list;

    /** @type {PlayerState} */
    const playstate = prop.playstate;

    return (
        <div className={styles.list}>
            {list.map((song, index) => (
                <Card
                    key={index}
                    song={song}
                    index={index}
                    playstate={playstate}
                    list={list}
                />
            ))}
        </div>
    );
})
/**
 * @param {{list:Song[],index:int,playstate:PlayerState,song:Song}} prop
*/
function Card({ list, index, playstate, song }) {
    const currentSong = usePlayerValue(playstate.song);
    const isActive = currentSong?.songUrl === song.songUrl;

    return (
        <div
            className={`${styles.item} ${isActive ? styles.active : ""}`}
            onClick={() => {
                if (isActive) playstate.toggle();
                else playstate.loadQueue(list, index);
            }}
        >
            <div className={styles.side}>
                <img src={song.thumbnail} />
            </div>

            <div className={styles.header}>
                <div className={styles.info}>
                    <div className={`${styles.title} ${styles.textOverflow}`}>
                        {song.title}
                    </div>
                    <div className={`${styles.desc} ${styles.textOverflow}`}>
                        {song.description}
                    </div>
                </div>

                <div className={styles.options}>
                    <svg role="img" className={styles.icon} viewBox="0 0 24 24">
                        <path d="M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 15a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-7.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
}