import { useEffect, useState } from "react";
import PlayerState from "../PlayerState.class"
import "./player.css"
export default function Player(prop) {
    /** @type {PlayerState}*/
    const state = prop.playstate
    const config = prop.config || null
    const [isActive, setIsActive] = useState(state?.isActive.get())
    const [isMini, setIsMini] = useState(true)
    const [song, setSong] = useState(state?.song?.get())
    const [currentTime, setCurrentTime] = useState(state?.currentTime.get())

    useEffect(() => {
        const isActveRemver = state?.isActive.onUpdate((isactive) => setIsActive(isactive))
        const songRemve = state?.song.onUpdate((song) => setSong(song))
        const currentTimeRemove = state?.currentTime.onUpdate((c) => setCurrentTime(c))

        return () => {
            isActveRemver()
            songRemve()
            currentTimeRemove()
        }
    }, [state])

    const { current, next, fade } = useBackground(song?.media);
    console.log("func", state)

    return (<>
        <div className="outer-player-card">
            <div className="player-card">
                <div className="thumbnail">
                    <img src={song?.thumbnail} />
                </div>
                <div className="info">
                    <div className="title">{song?.title}</div>
                    <div className="description">{song?.description}</div>
                </div>
                <div className="playbtn">
                    <svg className="icon" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>
                </div>
            </div>
        </div>
        <div className={isActive && !isMini ? "outer-player" : "outer-player min"}>
            <div className="player">
                <div className="backdrop">
                    <img className="media" src={current} />
                    <img className={`media next ${fade ? "show" : ""}`} src={next} />
                </div>
                <div className="main">
                    <div className="header">
                        <div id="player-back-btn">
                            <span>
                                <svg role="img" className="icon" viewBox="0 0 24 24">
                                    <path d="M2.793 8.043a1 1 0 0 1 1.414 0L12 15.836l7.793-7.793a1 1 0 1 1 1.414 1.414L12 18.664 2.793 9.457a1 1 0 0 1 0-1.414"></path>
                                </svg>
                            </span>
                        </div>
                        <div className="title">
                            {config?.title}
                        </div>
                        <div className="options">
                            <span>
                                <svg role="img" className="icon" viewBox="0 0 24 24">
                                    <path d="M4.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m15 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"></path>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="cover-art">
                        <div className="thumbnail">
                            <img src={song?.thumbnail} />
                        </div>
                    </div>
                    <div className="meta-data">
                        <div className="info">
                            <div className="name">{song?.title}</div>
                            <div className="desc">{song?.description}</div>
                        </div>
                        <div className="likeBtn">
                            <svg role="img" className="icon" viewBox="0 0 24 24"><path d="M5.21 1.57a6.76 6.76 0 0 1 6.708 1.545.124.124 0 0 0 .165 0 6.74 6.74 0 0 1 5.715-1.78l.004.001a6.8 6.8 0 0 1 5.571 5.376v.003a6.69 6.69 0 0 1-1.49 5.655l-7.954 9.48a2.518 2.518 0 0 1-3.857 0L2.12 12.37A6.68 6.68 0 0 1 .627 6.714 6.76 6.76 0 0 1 5.21 1.57m3.12 1.803a4.757 4.757 0 0 0-5.74 3.725l-.001.002a4.68 4.68 0 0 0 1.049 3.969l.009.01 7.958 9.485a.518.518 0 0 0 .79 0l7.968-9.495a4.69 4.69 0 0 0 1.049-3.965 4.8 4.8 0 0 0-3.931-3.794 4.74 4.74 0 0 0-4.023 1.256l-.008.008a2.123 2.123 0 0 1-2.9 0l-.007-.007a4.76 4.76 0 0 0-2.214-1.194z"></path></svg>
                        </div>

                    </div>
                    <div className="progress-bar">
                        <div className="bar">
                            <div className="progress" style={{ width: (state?.getProgress()) + "%" }}></div>
                        </div>
                        <div className="label">
                            <span className="start">{state?.formatTime(currentTime)}</span>
                            <span className="end">{song?.getFormattedDuration()}</span>
                        </div>
                    </div>
                    <div className="player-control">
                        <div className="options">
                            <div className="opt">
                                <span><svg role="img" className="icon" viewBox="0 0 24 24"><path d="M18.788 3.702a1 1 0 0 1 1.414-1.414L23.914 6l-3.712 3.712a1 1 0 1 1-1.414-1.414L20.086 7h-1.518a5 5 0 0 0-3.826 1.78l-7.346 8.73a7 7 0 0 1-5.356 2.494H1v-2h1.04a5 5 0 0 0 3.826-1.781l7.345-8.73A7 7 0 0 1 18.569 5h1.518l-1.298-1.298z"></path><path d="M18.788 14.289a1 1 0 0 0 0 1.414L20.086 17h-1.518a5 5 0 0 1-3.826-1.78l-1.403-1.668-1.306 1.554 1.178 1.4A7 7 0 0 0 18.568 19h1.518l-1.298 1.298a1 1 0 1 0 1.414 1.414L23.914 18l-3.712-3.713a1 1 0 0 0-1.414 0zM7.396 6.49l2.023 2.404-1.307 1.553-2.246-2.67a5 5 0 0 0-3.826-1.78H1v-2h1.04A7 7 0 0 1 7.396 6.49"></path></svg></span>
                            </div>
                            <div className="opt">
                                <span><svg role="img" className="icon" viewBox="0 0 24 24"><path d="M6.3 3a.7.7 0 0 1 .7.7v6.805l11.95-6.899a.7.7 0 0 1 1.05.606v15.576a.7.7 0 0 1-1.05.606L7 13.495V20.3a.7.7 0 0 1-.7.7H4.7a.7.7 0 0 1-.7-.7V3.7a.7.7 0 0 1 .7-.7z"></path></svg></span>
                            </div>
                            <div className="opt playbtn">
                                <svg className="icon" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>
                            </div>
                            <div className="opt">
                                <span><svg role="img" className="icon" viewBox="0 0 24 24"><path d="M17.7 3a.7.7 0 0 0-.7.7v6.805L5.05 3.606A.7.7 0 0 0 4 4.212v15.576a.7.7 0 0 0 1.05.606L17 13.495V20.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z"></path></svg></span>
                            </div>
                            <div className="opt">
                                <span><svg role="img" className="icon" viewBox="0 0 24 24"><path d="M6 2a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h1v-2H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4.798l1.298-1.298a1 1 0 1 0-1.414-1.414L9.373 19l3.713 3.712a1 1 0 0 0 1.414-1.414L13.202 20H18a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"></path></svg></span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div></>)
}

function useBackground(media = []) {
    const [index, setIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if (!media.length) return;

        const interval = setInterval(() => {
            const newIndex = Math.floor(Math.random() * media.length);

            setNextIndex(newIndex);
            setFade(true);

            setTimeout(() => {
                setIndex(newIndex);
                setFade(false);
            }, 1000); // match CSS transition
        }, 4000);

        return () => clearInterval(interval);
    }, [media]);

    return {
        current: media[index],
        next: media[nextIndex],
        fade
    };
}