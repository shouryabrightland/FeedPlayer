import { useEffect, useState, useRef } from "react";

import { BackIcon, DetailIcon, LikeIcon } from "../../icons"

import { usePlayerCtx } from "../../core/PlayerProvider"
import { getAverageColor, PlayBtn } from "../../components/sm_components";
import CardPlayer from "./cardPlayer";
import PlayerBackdrop from "./Backdrop"

import PlayerStyles from "./player.module.css"
import { PlayerControl, ProgressBar } from "./components";
import { NO_IMAGE_URL } from "../../const";



export default function Player() {
    const player = usePlayerCtx();
    const [isVisible, setIsVisible] = useState(false);
    const [coverArtMinimize, setCoverArtMinimize] = useState(false);
    const [bg, setBg] = useState(null)
    const song = player.current;
    const thumbnailUrl = song?.path + song?.thumbnail

    useEffect(() => {
        if (!thumbnailUrl) return;
        getAverageColor(thumbnailUrl).then((rgb) => {
            setBg(rgb)
        })
    }, [thumbnailUrl])

    return (<>
        <CardPlayer player={player} isVisible={isVisible} setVisible={setIsVisible} theme={bg}/>
        <PlayerLayOut isVisible={isVisible}>
            <PlayerBackdrop player={player} isVisible={isVisible}
            minimize={coverArtMinimize} bgcolor={bg}/>
            <div className={`${PlayerStyles.main} ${coverArtMinimize ? PlayerStyles.enableFeed : ""}`}>
                <PlayerHeader title={song?.title} onBack={() => setIsVisible(false)} />
                <CoverArt song={song} minimize={coverArtMinimize} setMinimize={setCoverArtMinimize} />
                <PlayerMeta song={song} />
                <ProgressBar player={player} />
                <PlayerControl player={player} />
            </div>
        </PlayerLayOut>
    </>
    )
}


function CoverArt({ song, minimize, setMinimize }) {
    const toggle = ()=>setMinimize(!minimize)
    const url = song?.path + song?.thumbnail || NO_IMAGE_URL;
    if(url)
    return (
        <div className={`${PlayerStyles.coverArt} ${minimize ? PlayerStyles.minimize : ""}`}>
            <div className={PlayerStyles.thumbnail}>
                <img src={url} onClick={toggle} />
            </div>
        </div>
    )
}


function PlayerMeta({ song }) {
    return (
        <div className={PlayerStyles.meta}>
            <div className={PlayerStyles.info}>
                <div className={PlayerStyles.name}>{song?.title}</div>
                <div className="desc">{song?.description}</div>
            </div>
            <div className={PlayerStyles.likeBtn}>
                <LikeIcon />
            </div>
        </div>
    )
}


function PlayerHeader({ onBack, title }) {
    return (
        <div className={PlayerStyles.header}>
            <div onClick={onBack}>
                <span>
                    <BackIcon />
                </span>
            </div>
            <div className={PlayerStyles.title}>
                {title}
            </div>
            <div className={PlayerStyles.options}>
                <span>
                    <DetailIcon />
                </span>
            </div>
        </div>
    )
}

function PlayerLayOut({ children, isVisible }) {
    return (
        <div className={isVisible ? PlayerStyles.outerPlayer : `${PlayerStyles.outerPlayer} ${PlayerStyles.min}`}>
            <div className={PlayerStyles.player}>
                {children}
            </div>
        </div>
    )
}