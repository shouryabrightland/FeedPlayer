import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { LastPlayList_Key } from "../const";
import { usePlaylistCtx } from "../core/PlaylistProvider.js";
import { usePlayerCtx } from "../core/PlayerProvider.js";
import { fetchSongs } from "../services/SongServices.js";

import { getAverageColor, PlayBtn} from "../components/sm_components.js";
import { DetailIcon, LikeIcon, ShareIcon } from "../icons.js";

import SongList from "./Playlist/Songlist.js";

import PlaylistStyles from "./Playlist.module.css";
import templateFXStyles from "./templateFX.module.css";
import LoadingPage from "./others/LoadingPage.js";
import ErrorPage from "./others/ErrorPage.js";
import { shareContent } from "../components/shareContent.js";
import { decodeID} from "../services/PlaylistIDServices.js";
import { getImageURL, MediaImage } from "../components/mediaImage.js";



export default React.memo(function PlayListPage() {
    const [params] = useSearchParams();
    const id = params.get("k") || localStorage.getItem(LastPlayList_Key);

    const { addPlaylist, hasPlaylist, ready, fetchPlaylist } = usePlaylistCtx();

    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (!id) {
            setError({
                title: "No Playlist Selected",
                message: "Selected Playlist will be Shown Here"
            });
            setLoading(false);
            return;
        }

        let active = true;

        (async () => {
            try {
                setLoading(true);

                const data = await fetchPlaylist(id);
                if (!active) return;

                if (!data) {
                    setError({
                        title: "No Playlist Found",
                        message: "Provide Link is invalid or Playlist is moved"
                    });
                    return;
                }

                const clean = normalizePlaylist(data);

                if (!isValidPlaylist(clean)) {
                    setError({ title: "Invalid Playlist", message: "Corrupted data" });
                    return;
                }

                setPlaylist(data);

                if (ready && !hasPlaylist(data.id)) {
                    addPlaylist(data);
                }

                const songsData = await fetchSongs(data.songsUrl);
                if (!active) return;

                setSongs((songsData || []).map(v => ({ ...v, path: data.path })));

            } catch (e) {
                if (!active) return;
                setError({ title: "Error", message: e });
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [id, ready, addPlaylist, fetchPlaylist, hasPlaylist]);

    // intentionally excluding hasPlaylist & addPlaylist
    // because they are unstable references

    if (!ready || loading) return <LoadingPage />;
    if (error) return <ErrorPage title={error.title} message={error.message} />;
    if (!playlist) return <ErrorPage message="Failed to load playlists" />;

    console.log(playlist,"first page")

    return (
        <PlaylistLayOut>
            <FirstPage base={playlist.path} path={playlist.thumbnail}>
                <PlaylistBtn songs={songs} playlist={playlist} />
                <Info data={playlist} songs={songs} />
            </FirstPage>
            <SongList songs={songs} playlist={playlist} />
        </PlaylistLayOut>
    );
})

function Info({ data, songs }) {
    const handleShare = async () => {
        const result = await shareContent({
            title: data.title,
            text: data.description,
            url: `${window.location.origin}${window.location.pathname}?k=${data.id}`
        });

        if (result.method === "clipboard") {
            console.log("Link copied to clipboard");
        }
    };

    return <div className={`${PlaylistStyles.info}`}>
        {/* <div className={`${PlaylistStyles.info} ${isReady ? "" : styles.infoHidden}`}> */}
        <Title text={data.title} />
        <Description text={data.description} />
        <PlayListMeta songs={songs} />
        <Options>
            <LikeIcon />
            <ShareIcon onClick={handleShare} />
            <DetailIcon />
        </Options>
    </div>
}

const PlayListMeta = React.memo(
    function PlayListMeta({ songs }) {
        console.log("rendering Playlist Meta")
        return (<div className={`pt2 ${PlaylistStyles.playlistInfo}`}><Text>{`${songs?.length || 0} songs`}</Text></div>)

    })

function Description({ text }) {
    return <div className={`pt1 ${PlaylistStyles.desc}`}><Text>{text}</Text></div>
}
function Title({ text }) {
    return <div className={`pt1 ${PlaylistStyles.title}`}><Text>{text}</Text></div>
}

function Text({ children }) {
    return children ?
        <span>{children}</span> :
        <span className={PlaylistStyles.TextBlank}>{templateFX()}</span>
}

function PlaylistBtn({ songs, playlist }) {
    const player = usePlayerCtx()
    const isActive = player.current?.path === playlist.path;
    const isPlaying = isActive && player.isPlaying;
    const isLoading = isActive && player.isLoading;

    const onClick = () => {
        if (isLoading) return;
        if(isActive){
            player.toggle()
        }else{
            player.load(songs, playlist, 0);
            player.setIsVisible(true)
        }
    }
    return (
        <div className={PlaylistStyles.outer_btn}>
            <div className={PlaylistStyles.playbtn} onClick={onClick}>
                <PlayBtn isPlaying={isPlaying} isLoading={isLoading} styles={PlaylistStyles} />
            </div>
        </div>
    )
}

function Options({ children }) {
    return (
        <div className={PlaylistStyles.options}>
            {React.Children.map(children, (child, i) => (
                <div
                    className={PlaylistStyles.item}
                    key={i}
                    onClick={child.props.onClick}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}

function FirstPage({ children, base , path }) {
    const [bg, setBg] = useState(null)
    const thumbnailUrl = getImageURL(base,path,50)
    useEffect(() => {
        if (!thumbnailUrl) return;
        getAverageColor(thumbnailUrl).then((rgb) => {
            setBg(rgb)
        })
    }, [thumbnailUrl])
    console.log(base,path,"image thumbnail")
    return (
        <div className={`${PlaylistStyles.firstpage} ${bg ? "" : PlaylistStyles.firstpageHidden}`}
            style={{ '--bg': `${bg}` }}>
            <PlaylistThumbnail base={base} path={path} />
            {children}
        </div>
    )
}

function PlaylistThumbnail({ base,path }) {
    console.log(base,path,"image resoler")
    return (
        <div className={PlaylistStyles.thumbnail}>
            {path && <MediaImage src={path} base={base} alt="" style={{
                width:"100%",
                height: "100%"
            }} />}
        </div>
    )
}


function PlaylistLayOut({ children }) {
    return (
        <div className={PlaylistStyles.playlist}>
            {children}
        </div>
    )
}

function templateFX() {
    return <div className={templateFXStyles.loading}>.</div>
}



function normalizePlaylist(raw) {
    const path = decodeID(raw?.id ?? "")
    return {
        id: raw?.id ?? null,
        title: raw?.title ?? "",
        path: path,
        songsUrl: raw?.songsUrl ?? "",
        thumbnail: raw?.thumbnail
    };
}

function isValidPlaylist(p) {
    return (
        typeof p.id === "string" &&
        typeof p.songsUrl === "string" &&
        typeof p.path === "string"
    );
}