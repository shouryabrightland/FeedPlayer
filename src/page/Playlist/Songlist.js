import React from "react";
import { usePlayerCtx } from "../../core/PlayerProvider"
import SongListStyles from "./SongList.module.css"

export default React.memo(function SongList({ songs, playlist }) {
    const player = usePlayerCtx();
    const isActive = (index)=>player.current?.path == playlist.path && player.current.songUrl == songs[index].songUrl;

    const onClick = (index) => {
        const isPlaying = isActive(index) && player.isPlaying;
        const isLoading = isActive(index) && player.isLoading;
        if (isLoading) return;
        if (isActive(index)) player.toggle()
        else player.load(songs, playlist, index);
    }
    return (
        <div className={SongListStyles.list}>
            {songs.map((song, index) => (

                <SongCard
                    key={song.songUrl}
                    song={song}
                    onClick={()=>onClick(index)}
                    isActive={isActive(index)}
                />
            ))}
        </div>
    )
})

function SongCard({ song, onClick, isActive }) {

    return (
        <div className={`${SongListStyles.item} ${isActive ? SongListStyles.active : ""}`}
            onClick={onClick}>
            <div className={SongListStyles.side}>
                <img src={song.path + song.thumbnail} />
            </div>
            <div className={SongListStyles.header}>
                <div className={SongListStyles.info}>
                    <div className={`${SongListStyles.title} ${SongListStyles.textOverflow}`}>
                        {song.title}
                    </div>
                    <div className={`${SongListStyles.desc} ${SongListStyles.textOverflow}`}>
                        {song.description}
                    </div>
                </div>
                <div className={SongListStyles.options}>
                    <svg role="img" className={SongListStyles.icon} viewBox="0 0 24 24">
                        <path d="M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 15a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-7.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"></path>
                    </svg>
                </div>
            </div>
        </div>
    )
}














// export default React.memo(function List(prop) {
//     console.log("Rendering List")
//     /** @type {Song[]}*/
//     const list = prop.list;

//     /** @type {PlayerState} */
//     const playstate = prop.playstate;

//     return (
//         <div className={styles.list}>
//             {list.map((song, index) => (
//                 <Card
//                     key={index}
//                     song={song}
//                     index={index}
//                     playstate={playstate}
//                     list={list}
//                 />
//             ))}
//         </div>
//     );
// })
// /**
//  * @param {{list:Song[],index:int,playstate:PlayerState,song:Song}} prop
// */
// function Card({ list, index, playstate, song }) {
//     const currentSong = usePlayerValue(playstate.song);
//     const isActive = currentSong?.songUrl === song.songUrl;

//     return (
//         <div
//             className={`${styles.item} ${isActive ? styles.active : ""}`}
//             onClick={() => {
//                 if (isActive) playstate.toggle();
//                 else playstate.loadQueue(list, index);
//             }}
//         >
//             <div className={styles.side}>
//                 <img src={song.thumbnail} />
//             </div>

//             <div className={styles.header}>
//                 <div className={styles.info}>
//                     <div className={`${styles.title} ${styles.textOverflow}`}>
//                         {song.title}
//                     </div>
//                     <div className={`${styles.desc} ${styles.textOverflow}`}>
//                         {song.description}
//                     </div>
//                 </div>

//                 <div className={styles.options}>
//                     <svg role="img" className={styles.icon} viewBox="0 0 24 24">
//                         <path d="M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 15a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-7.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"></path>
//                     </svg>
//                 </div>
//             </div>
//         </div>
//     );
// }