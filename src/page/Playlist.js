import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { usePlayerCtx } from "../core/PlayerProvider.js";
import { fetchPlaylist } from "../services/PlaylistServices";
import { fetchSongs } from "../services/SongServices.js";

import { getAverageColor, PlayBtn } from "../components/sm_components.js";
import { DetailIcon, LikeIcon, ShareIcon } from "../icons.js";

import SongList from "./Playlist/Songlist.js";

import PlaylistStyles from "./Playlist.module.css";
import templateFXStyles from "./templateFX.module.css";
import LoadingPage from "./others/LoadingPage.js";
import ErrorPage from "./others/ErrorPage.js";
import { LastPlayList_Key } from "../const.js";
import { shareContent } from "../components/shareContent.js";

import { DB } from "../core/db";
import { _DBName, _StoreName, _DBVersion, _PlaylistKey } from "../const";
import { usePlaylistCtx } from "../core/PlaylistProvider.js";


export default React.memo(function PlayListPage() {
    const [params] = useSearchParams();
    const id = params.get("k") || localStorage.getItem(LastPlayList_Key);

    const { addPlaylist, hasPlaylist, ready } = usePlaylistCtx();


    const navigate = useNavigate();

    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError({title:"No Playlist Selected",
                message:"Selected Playlist will be Shown Here"});
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
                    setError({title:"No Playlist Found",
                        message:"Provide Link is invalid or Playlist is moved"});
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
                setError({title:"Error",message: "Something Went Wrong"});
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [id, ready]);

    // intentionally excluding hasPlaylist & addPlaylist
    // because they are unstable references

    if (!ready || loading) return <LoadingPage />;
    if (error) return <ErrorPage title={error.title} message={error.message} />;
    if (!playlist) return <ErrorPage message="Failed to load playlists" />;

    return (
        <PlaylistLayOut>
            <FirstPage thumbnailUrl={playlist.thumbnail}>
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
        if (isPlaying) {
            player.toggle()
        } else player.load(songs, playlist, 0);
    }
    return (
        <div className={PlaylistStyles.outer_btn}>
            <div className={PlaylistStyles.playbtn} onClick={onClick}>
                <PlayBtn isPlaying={isPlaying} isLoading={isLoading} styles={PlaylistStyles} />
            </div>
        </div>
    )
}

function PlaylistThumbnail({ url }) {
    return (
        <div className={PlaylistStyles.thumbnail}>
            {url && <img src={url} />}
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

function FirstPage({ children, thumbnailUrl }) {
    const [bg, setBg] = useState(null)
    useEffect(() => {
        if (!thumbnailUrl) return;
        getAverageColor(thumbnailUrl).then((rgb) => {
            setBg(rgb)
        })
    }, [thumbnailUrl])
    return (
        <div className={`${PlaylistStyles.firstpage} ${bg ? "" : PlaylistStyles.firstpageHidden}`}
            style={{ '--bg': `${bg}` }}>
            <PlaylistThumbnail url={thumbnailUrl} />
            {children}
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