import React from "react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPlaylist } from "../services/PlaylistServices";
import { fetchSongs } from "../services/SongServices.js"; 

import PlaylistStyles from "./Playlist.module.css";
import templateFXStyles from "./templateFX.module.css";
import { getAverageColor, PlayBtn } from "../components/sm_components.js";
import SongList from "./Playlist/Songlist.js";
import { PlayerProvider, usePlayer } from "../core/PlayerProvider.js";



export default function PlayListPage() {
    const [params] = useSearchParams();
    const id = params.get("k");

    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) {
            setError("No playlist id");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);

                const data = await fetchPlaylist(id);
                if (!data) {
                    setError("Invalid playlist");
                    return;
                }

                setPlaylist(data);

                const songsData = (await fetchSongs(data.songsUrl)).map((v)=>{
                    v.path = data.path
                    return v
                });
                setSongs(songsData || []);

            } catch (e) {
                console.log(e);
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <PlaylistLayOut>
            <FirstPage thumbnailUrl={playlist.thumbnail}>
                <PlaylistBtn songs={songs}/>
                <Info data={playlist} songs={songs}/>
            </FirstPage>
            <SongList songs={songs}/>
        </PlaylistLayOut>
        
    );
}

function Info({data,songs}){
    return <div className={`${PlaylistStyles.info}`}>
    {/* <div className={`${PlaylistStyles.info} ${isReady ? "" : styles.infoHidden}`}> */}
        <Title text={data.title}/>
        <Description text={data.description}/>
        <PlayListMeta songs={songs}/>
        <Options>
            <LikeIcon/>
            <ShareIcon/>
            <DetailIcon/>
        </Options>
    </div>
}

const PlayListMeta = React.memo(function PlayListMeta({ songs }) {
    console.log("rendering Playlist Meta")
    return (<div className={`pt2 ${PlaylistStyles.playlistInfo}`}><Text>{`${songs?.length || 0} songs`}</Text></div>)

})

function Description({text}){
    return <div className={`pt1 ${PlaylistStyles.desc}`}><Text>{text}</Text></div>
}
function Title({text}){
    return <div className={`pt1 ${PlaylistStyles.title}`}><Text>{text}</Text></div>
}
function Text({children}){
    return children?
        <span>{children}</span>:
    <span className={PlaylistStyles.TextBlank}>{templateFX()}</span>
}

function PlaylistBtn({songs}){
    const player = usePlayer();
    return (
        <div className={PlaylistStyles.outer_btn}>
                    <div className={PlaylistStyles.playbtn} onClick={()=>{
                        if(player.isPlaying){
                            player.toggle()
                        }else player.playQueue(songs, 0);
                    }}>
                        <PlayBtn isPlaying={player.isPlaying} styles={PlaylistStyles}/>
                    </div>
                </div>
    )
}

function PlaylistThumbnail({ url }){
    return (
        <div className={PlaylistStyles.thumbnail}>
            {url && <img src={url} />}
        </div>
    )
}


function Options({children}){
    return (
        <div className={PlaylistStyles.options}>
            {children.map((v)=>(
                <div className={PlaylistStyles.item}>
                    {v}
                </div>
            ))}
        </div>
    )
}
function ShareIcon(){
    return <svg role="img" aria-hidden="true" className="icon" viewBox="0 0 24 24">
        <path d="M18.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M15 5.5a3.5 3.5 0 1 1 1.006 2.455L9 12l7.006 4.045a3.5 3.5 0 1 1-.938 1.768l-6.67-3.85a3.5 3.5 0 1 1 0-3.924l6.67-3.852A3.5 3.5 0 0 1 15 5.5m-9.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m13 6.5a1.5 1.5 0 1 0-.001 3 1.5 1.5 0 0 0 .001-3"></path>
    </svg>                        
}
function LikeIcon(){
    return <svg role="img" aria-hidden="true" className="icon" viewBox="0 0 24 24"><path d="M5.21 1.57a6.76 6.76 0 0 1 6.708 1.545.124.124 0 0 0 .165 0 6.74 6.74 0 0 1 5.715-1.78l.004.001a6.8 6.8 0 0 1 5.571 5.376v.003a6.69 6.69 0 0 1-1.49 5.655l-7.954 9.48a2.518 2.518 0 0 1-3.857 0L2.12 12.37A6.68 6.68 0 0 1 .627 6.714 6.76 6.76 0 0 1 5.21 1.57m3.12 1.803a4.757 4.757 0 0 0-5.74 3.725l-.001.002a4.68 4.68 0 0 0 1.049 3.969l.009.01 7.958 9.485a.518.518 0 0 0 .79 0l7.968-9.495a4.69 4.69 0 0 0 1.049-3.965 4.8 4.8 0 0 0-3.931-3.794 4.74 4.74 0 0 0-4.023 1.256l-.008.008a2.123 2.123 0 0 1-2.9 0l-.007-.007a4.76 4.76 0 0 0-2.214-1.194z"></path></svg>                   
}
function DetailIcon(){
    return (
        <svg role="img" aria-hidden="true" className="icon" viewBox="0 0 24 24">
            <path d="M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 15a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-7.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"></path>
        </svg>
    )
}
function FirstPage({children,thumbnailUrl}){
    const [bg,setBg] = useState(null)
    useEffect(()=>{
        getAverageColor(thumbnailUrl).then((rgb)=>{
            setBg(rgb)
        })
    },[thumbnailUrl])
    return(
        <div className={`${PlaylistStyles.firstpage} ${bg ? "" : PlaylistStyles.firstpageHidden}`}
        style={{'--bg':`${bg}`}}>
            <PlaylistThumbnail url={thumbnailUrl} />
            {children}
        </div>
    )
}

function PlaylistLayOut({children}){
    return (
        <div className={PlaylistStyles.playlist}>
            {children}
        </div>
    )
}

function templateFX(){
    return <div className={templateFXStyles.loading}>.</div>
}