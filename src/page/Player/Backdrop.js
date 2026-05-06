import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import styles from "./player.module.css";

function PlayerBackdrop({ player, isVisible, minimize, bgcolor }) {
    const containerRef = useRef(null);

    // ✅ use Map (cleaner than object)
    const videoRefs = useRef(new Map());

    const itemHeightRef = useRef(window.innerHeight);
    const scrollTimeout = useRef(null);

    const idleTimeoutRef = useRef(null);
    const isUserActiveRef = useRef(false);

    const [index, setIndex] = useState(0);
    const [failedRealIndexes, setFailedRealIndexes] = useState(new Set());
    const [fullscreen, setFullScreen] = useState(false);

    const isPlaying = player.isPlaying;
    const { current } = player;
    const mediaRaw = useMemo(()=>current?.media || [],[current]);

    // 🔀 shuffle once per song
    const media = useMemo(() => {
        const arr = [...mediaRaw];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [mediaRaw]);

    // ✅ reset failures ONLY when song changes
    useEffect(() => {
        setFailedRealIndexes(new Set());
    }, [current]);

    // 📏 resize
    useEffect(() => {
        const onResize = () => {
            itemHeightRef.current = window.innerHeight;
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // 📜 scroll → index
    useEffect(() => {
        if (!isVisible) return;

        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => {
            clearTimeout(scrollTimeout.current);

            scrollTimeout.current = setTimeout(() => {
                const h = itemHeightRef.current;
                const newIndex = Math.round(container.scrollTop / h);
                setIndex(newIndex);
            }, 10);
        };

        container.addEventListener("scroll", onScroll);

        return () => {
            container.removeEventListener("scroll", onScroll);
            clearTimeout(scrollTimeout.current);
        };
    }, [isVisible]);

    // 🎯 initial scroll position
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !media.length) return;

        const h = itemHeightRef.current;
        const startIndex = media.length * 100;

        container.scrollTop = startIndex * h;
        setIndex(startIndex);
    }, [media]);

    // 🧠 visible items (self-healing)
    const visibleItems = useMemo(() => {
        if (!media.length) return [];

        if (failedRealIndexes.size >= media.length) {
            return [{ type: "fallback", virtualIndex: index }];
        }

        const items = [];
        let i = index - 2;

        while (items.length < 5) {
            const realIndex =
                ((i % media.length) + media.length) % media.length;

            if (!failedRealIndexes.has(realIndex)) {
                items.push({
                    ...media[realIndex],
                    virtualIndex: i,
                    realIndex
                });
            }

            i++;
            if (i > index + media.length + 10) break;
        }

        return items;
    }, [index, media, failedRealIndexes]);

    // 🎥 video control (FIXED, no memory leak)
    useEffect(() => {
        videoRefs.current.forEach((video, vIndex) => {
            const distance = Math.abs(vIndex - index);

            if (!video) return;

            if (!isVisible || !isPlaying) {
                video.pause();
                return;
            }

            if (distance === 0) {
                video.preload = "auto";
                video.play().catch(() => { });
            } else if (distance === 1) {
                video.preload = "metadata";
                video.pause();
            } else {
                video.pause();
            }
        });
    }, [index, isPlaying, isVisible]);

    // 🧹 cleanup unused refs (CRITICAL FIX)
    useEffect(() => {
        const validKeys = new Set(visibleItems.map(i => i.virtualIndex));

        videoRefs.current.forEach((_, key) => {
            if (!validKeys.has(key)) {
                videoRefs.current.delete(key);
            }
        });
    }, [visibleItems]);

    // 🧍 user activity
    useEffect(() => {
        if (!isVisible) return;

        const container = containerRef.current;
        if (!container) return;

        const markActive = () => {
            isUserActiveRef.current = true;

            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = setTimeout(() => {
                isUserActiveRef.current = false;
            }, 20000);
        };

        container.addEventListener("pointerdown", markActive);
        container.addEventListener("wheel", markActive);
        container.addEventListener("touchstart", markActive);

        return () => {
            container.removeEventListener("pointerdown", markActive);
            container.removeEventListener("wheel", markActive);
            container.removeEventListener("touchstart", markActive);
        };
    }, [isVisible]);

    // 🔄 auto-scroll
    useEffect(() => {
        if (!isVisible || !isPlaying || !media.length) return;

        const container = containerRef.current;
        if (!container) return;

        let timer;

        const loop = () => {
            if (isUserActiveRef.current) {
                timer = setTimeout(loop, 1000);
                return;
            }

            const h = itemHeightRef.current;
            const next = Math.round(container.scrollTop / h) + 1;

            container.scrollTo({
                top: next * h,
                behavior: "smooth"
            });

            timer = setTimeout(loop, 4000);
        };

        timer = setTimeout(loop, 2000);

        return () => clearTimeout(timer);
    }, [isVisible, isPlaying, media]);

    const resolveSrc = useCallback((src) => {
        if (!src) return "";
        if (src.startsWith("http")) return src;
        return (current?.path || "") + src;
    }, [current?.path]);

    const markFailed = useCallback((realIndex) => {
        setFailedRealIndexes(prev => {
            if (prev.has(realIndex)) return prev;
            const next = new Set(prev);
            next.add(realIndex);
            return next;
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className={`${styles.backdropFeed} ${!minimize ? styles.blur : ""}`}
            style={{ backgroundColor: bgcolor }}
        >
            <div
                style={{
                    height: `${media.length * 1000 * itemHeightRef.current}px`,
                    position: "relative"
                }}
            >
                {visibleItems.map((item) => (
                    <FeedItem
                        key={item.virtualIndex}
                        info={item}
                        index={index}
                        itemHeight={itemHeightRef.current}
                        videoRefs={videoRefs}
                        resolveSrc={resolveSrc}
                        markFailed={markFailed}
                        fullscreen={fullscreen}
                        setFullScreen={setFullScreen}
                    />
                ))}
            </div>
        </div>
    );
}

const FeedItem = React.memo(function FeedItem({
    info,
    index,
    itemHeight,
    videoRefs,
    resolveSrc,
    markFailed,
    fullscreen,
    setFullScreen
}) {
    const [isTall, setIsTall] = useState(null);
    const [hide, setHide] = useState(false);
    const toggle = useCallback(() => {
        setHide(true);
        setTimeout(()=>{
            setFullScreen((p)=>!p)
            setTimeout(()=>{
                setHide(false)
            },30)
        },110)
    },[setFullScreen])

    if (info.type === "fallback") {
        return <div className={styles.feedItem}>No media available</div>;
    }

    const top = info.virtualIndex * itemHeight;
    const distance = Math.abs(info.virtualIndex - index);

    const scale = Math.max(0.85, 1 - distance * 0.02);
    const opacity = Math.max(0.3, 1 - distance * 0.45);

    const isReady = isTall !== null && !hide;


    return (
        <div
            className={styles.feedItem}
            style={{
                transform: `translateY(${top}px) scale(${scale})`,
                opacity,
                transition: "transform 0.25s ease-out, opacity 0.25s ease-out"
            }}
        >
            {info.type === "video" ? (
                <video
                    ref={(el) => {
                        if (el) {
                            videoRefs.current.set(info.virtualIndex, el);
                        }
                    }}
                    className={`${`
                        ${isTall ? styles.tallMedia : styles.normalMedia}
                        ${fullscreen ? styles.fullscreen : ""}
                        ${!isReady ? styles.loading : styles.ready}
                    `}`}
                    src={resolveSrc(info.src)}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                        const v = e.target;
                        const tall = v.videoHeight > v.videoWidth;
                        setIsTall(prev => prev === tall ? prev : tall);
                    }}
                    onError={() => markFailed(info.realIndex)}
                    onClick={() => toggle()}
                />
            ) : (
                <img
                    src={resolveSrc(info.src)}
                    className={`${`
                        ${isTall ? styles.tallMedia : styles.normalMedia}
                        ${fullscreen ? styles.fullscreen : ""}
                        ${!isReady ? styles.loading : styles.ready}
                    `}`}
                    alt=""
                    loading="lazy"
                    onLoad={(e) => {
                        const img = e.target;
                        const tall = img.naturalHeight > img.naturalWidth;
                        setIsTall(prev => prev === tall ? prev : tall);
                    }}
                    onError={() => markFailed(info.realIndex)}
                    onClick={() => toggle()}
                />
            )}
        </div>
    );
});



export default React.memo(PlayerBackdrop);