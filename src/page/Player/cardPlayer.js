import { useRef,useEffect } from "react";

import { PlayBtn } from "../../components/sm_components";

import PlayerStyles from "./player.module.css";



export default function CardPlayer({isVisible,setVisible, theme, player }) {
    if (!player.isActive) return;
    const toggle = player.toggle
    const song = player.current
    const thumbnailUrl = song?.path + song?.thumbnail
    console.log("rendering CardPlayer")
    return (
        <div className={player.isActive && !isVisible ? PlayerStyles.outerPlayerCard : `${PlayerStyles.outerPlayerCard} ${PlayerStyles.min}`}
            style={{ '--bg': theme }}>
            <div className={PlayerStyles.playerCard}>
                <div className={PlayerStyles.thumbnail}>
                    <img src={thumbnailUrl} />
                </div>
                <div className={PlayerStyles.info} onClick={()=>setVisible(true)}>
                    <div className={PlayerStyles.title}>{song?.title}</div>
                    <div className={PlayerStyles.description}>{song?.description}</div>
                </div>
                <div className={PlayerStyles.playbtn} onClick={toggle}>
                    <PlayBtn styles={PlayerStyles} isPlaying={player.isPlaying} isLoading={player.isLoading} />
                </div>
                {!isVisible && <CardProgressBar player={player}/>}
            </div>
        </div>
    )
}



function CardProgressBar({ player }) {
    const barRef = useRef(null);

    useEffect(() => {
        let raf;

        const update = () => {
            const audio = player.audioRef.current;
            if (audio && audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                if (barRef.current) barRef.current.style.width = progress + "%";
            }
            raf = requestAnimationFrame(update);
        };
        raf = requestAnimationFrame(update);

        return () => cancelAnimationFrame(raf);
    }, [player.audioRef]);

    return (
        <div className={PlayerStyles.cardBar}>
            <div
                ref={barRef}
                className={PlayerStyles.progress}
            />
        </div>
    );
}