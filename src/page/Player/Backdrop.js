import React, { useRef, useEffect, useMemo, useState } from "react";
import styles from "./player.module.css";

function PlayerBackdrop({ player, isVisible, minimize, bgcolor }) {
    const containerRef = useRef(null);
    const videoRefs = useRef({});
    const itemHeightRef = useRef(window.innerHeight);
    const scrollTimeout = useRef(null);
    const isUserActiveRef = useRef(false);
    const idleTimeoutRef = useRef(null);

    const [index, setIndex] = useState(0);

    const isPlaying = player.isPlaying;
    const mediaRaw = player.current?.media || [];

    // ✅ shuffle once per song
    const media = useMemo(() => {
        const arr = [...mediaRaw];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [mediaRaw]);

    // ✅ resize
    useEffect(() => {
        const onResize = () => {
            itemHeightRef.current = window.innerHeight;
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // ✅ scroll → index (controlled)
    useEffect(() => {
        if (!isVisible) return;

        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => {
            clearTimeout(scrollTimeout.current);

            scrollTimeout.current = setTimeout(() => {
                const h = itemHeightRef.current;
                const newIndex = Math.round(container.scrollTop / h);

                setIndex(newIndex); // 🔥 ONLY ON SCROLL END
            }, 120); // sweet spot (100–150ms)
        };

        container.addEventListener("scroll", onScroll);

        return () => {
            container.removeEventListener("scroll", onScroll);
            clearTimeout(scrollTimeout.current);
        };
    }, [isVisible]);

    // ✅ initial infinite position
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !media.length) return;

        const h = itemHeightRef.current;
        const startIndex = media.length * 100;

        container.scrollTop = startIndex * h;
        setIndex(startIndex);
    }, [media]);

    // ✅ virtualization (ONLY 5 ITEMS)
    const visibleItems = useMemo(() => {
        if (media.length == 0) return [];
        const buffer = 2;
        const items = [];

        for (let i = index - buffer; i <= index + buffer; i++) {
            const realIndex =
                ((i % media.length) + media.length) % media.length;

            items.push({
                ...media[realIndex],
                virtualIndex: i
            });
        }
        return items;
    }, [index, media]);

    // ✅ VIDEO CONTROL (FIXED)
    useEffect(() => {
        Object.entries(videoRefs.current).forEach(([key, video]) => {
            const vIndex = Number(key);
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

    useEffect(() => {
        if (!isVisible) return;

        const container = containerRef.current;
        if (!container) return;

        const markActive = () => {
            isUserActiveRef.current = true;

            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = setTimeout(() => {
                isUserActiveRef.current = false;
            }, 20000); // 🔥 cooldown (tune this)
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

    useEffect(() => {
        if (!isVisible || !isPlaying || !media.length) return;

        const container = containerRef.current;
        if (!container) return;

        let timer;

        const loop = () => {
            // ❌ user interacting → skip
            if (isUserActiveRef.current) {
                timer = setTimeout(loop, 1000);
                return;
            }

            const h = itemHeightRef.current;

            const currentIndex = Math.round(container.scrollTop / h);
            const next = currentIndex + 1;

            container.scrollTo({
                top: next * h,
                behavior: "smooth"
            });

            timer = setTimeout(loop, 4000);
        };

        timer = setTimeout(loop, 2000);

        return () => clearTimeout(timer);
    }, [isVisible, isPlaying, media]);

    const resolveSrc = (src) => {
        if (!src) return "";
        if (src.startsWith("http")) return src;
        return (player.current?.path || "") + src;
    };

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
                {visibleItems.map((item) => {
                    const top = item.virtualIndex * itemHeightRef.current;

                    const distance = Math.abs(item.virtualIndex - index);

                    // 🎯 effects (cheap + smooth)
                    const scale = Math.max(0.85, 1 - distance * 0.08);
                    const opacity = Math.max(0.3, 1 - distance * 0.25);

                    return (
                        <div
                            key={item.virtualIndex}
                            className={styles.feedItem}
                            style={{
                                transform: `translateY(${top}px) scale(${scale})`,
                                opacity,
                                transition: "transform 0.25s ease-out, opacity 0.25s ease-out"
                            }}
                        >
                            {item.type === "video" ? (
                                <video
                                    ref={(el) => {
                                        if (el) videoRefs.current[item.virtualIndex] = el;
                                        else delete videoRefs.current[item.virtualIndex];
                                    }}
                                    src={resolveSrc(item.src)}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                />
                            ) : (
                                <img src={resolveSrc(item.src)} alt="" loading="lazy" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// function PlayerBackdrop({ player, isVisible, minimize, bgcolor }) {
//     console.log("r")
// }


export default React.memo(PlayerBackdrop);