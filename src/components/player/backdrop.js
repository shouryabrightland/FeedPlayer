import React from "react";
import { useRef, useState, useEffect , useMemo} from "react";
import { usePlayerValue } from "../../core/state.class";
import styles from "./player.module.css"
function PlayerBackdrop({ state, isMini,bgcolor }) {
    const containerRef = useRef(null);
    const itemHeightRef = useRef(window.innerHeight);
    const videoRefs = useRef({});
    const isUserActiveRef = useRef(false);
    const idleTimeoutRef = useRef(null);
    const isAutoScrollingRef = useRef(false);
    
    const [index, setIndex] = useState(0);
    
    const isPlaying = usePlayerValue(state.isPlaying);
    const coverArtMinimize = usePlayerValue(state.coverArtMinimize);
    
    
    const song = usePlayerValue(state.song);
    const media = useMemo(()=> song?.media || [],[song])
    
    
    // ✅ resize safe
    useEffect(() => {
        const update = () => {
            itemHeightRef.current = window.innerHeight;
        };
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    
    // ✅ scroll → index (disabled in mini)
    useEffect(() => {
        if (isMini) return;
        
        const container = containerRef.current;
        if (!container) return;
        
        let ticking = false;
        
        const onScroll = () => {
            if (ticking) return;
            
            requestAnimationFrame(() => {
                const h = itemHeightRef.current;
                const i = Math.round(container.scrollTop / h);
                setIndex(i);
                ticking = false;
            });
            
            ticking = true;
        };
        
        container.addEventListener("scroll", onScroll);
        return () => container.removeEventListener("scroll", onScroll);
    }, [isMini]);
    
    // ✅ initial position (only once)
    useEffect(() => {
        if (index !== 0) return;
        
        const container = containerRef.current;
        if (!container || !media.length) return;
        
        const h = itemHeightRef.current;
        const startIndex = media.length * 100;
        
        container.scrollTop = startIndex * h;
        setIndex(startIndex);
    }, [media]);
    
    // ✅ virtualization
    const visibleItems = useMemo(() => {
        const buffer = 2;
        const items = [];
        
        for (let i = index - buffer; i <= index + buffer; i++) {
            const realIndex =
            ((i % media.length) + media.length) % media.length;
            
            items.push({
                ...media[realIndex],
                virtualIndex: i,
                realIndex
            });
        }
        
        return items;
    }, [index, media]);
    
    // 🎯 VIDEO CONTROL (STRICT SYNC WITH AUDIO)
    useEffect(() => {
        Object.entries(videoRefs.current).forEach(([key, video]) => {
            const vIndex = Number(key);
            const distance = Math.abs(vIndex - index);
            
            if (!video) return;
            
            // ❌ GLOBAL PAUSE (mini OR audio paused)
            if (isMini || !isPlaying) {
                video.pause();
                return;
            }
            
            // 🎯 CURRENT
            if (distance === 0) {
                video.preload = "auto";
                video.currentTime = 0; // optional: keep fresh sync feel
                video.play().catch(() => { });
            }
            
            // 🎯 NEIGHBOR
            else if (distance === 1) {
                video.preload = "metadata";
                video.pause();
            }
            
            // ❌ FAR
            else {
                video.pause();
                video.removeAttribute("src");
                video.load();
            }
        });
    }, [index, isPlaying, isMini]);
    
    // 🎯 USER ACTIVITY TRACK
    useEffect(() => {
        if (isMini) return;
        
        const container = containerRef.current;
        if (!container) return;
        
        const markActive = () => {
            if (isAutoScrollingRef.current) return;
            isUserActiveRef.current = true;
            
            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = setTimeout(() => {
                isUserActiveRef.current = false;
            }, 20000); // 20s idle
        };
        
        container.addEventListener("pointerdown", markActive);
        container.addEventListener("touchstart", markActive);
        container.addEventListener("wheel", markActive);
        
        return () => {
            container.removeEventListener("pointerdown", markActive);
            container.removeEventListener("touchstart", markActive);
            container.removeEventListener("wheel", markActive);
        };
    }, [isMini]);
    
    // 🎯 SMART AUTO SCROLL
    useEffect(() => {
        if (isMini) return;
        if (!media.length) return;
        if (!isPlaying) return;
        
        const container = containerRef.current;
        if (!container) return;
        
        const interval = setInterval(() => {
            // ❌ user interacting → stop immediately
            if (isUserActiveRef.current) return;
            
            // ✅ allow in BOTH modes (you wanted that hint UX)
            const h = itemHeightRef.current;
            const nextIndex = index + 1;
            
            container.scrollTo({
                top: nextIndex * h,
                behavior: "smooth"
            });
            isAutoScrollingRef.current = true;
            setTimeout(() => {
                isAutoScrollingRef.current = false;
            }, 500);
            
            setIndex(nextIndex);
        }, 2000);
        
        return () => clearInterval(interval);
    }, [index, isMini, media]);
    
    return (
        <div
        ref={containerRef}
        className={`${styles.backdropFeed} ${coverArtMinimize ? "" : styles.blur}`}
        style={{
            overflowY: isMini ? "hidden" : "scroll",
            height: "100vh",
            backgroundColor: bgcolor
        }}
        >
            <div
                style={{
                    height: `${media.length * 1000 * itemHeightRef.current}px`,
                    position: "relative"
                }}
                >
                {visibleItems.map((item) => {
                    const distance = Math.abs(item.virtualIndex - index);
                    const top = item.virtualIndex * itemHeightRef.current;
                    
                    // 🎯 freeze visuals in mini
                    const scale = isMini ? 1 : Math.max(0.9, 1 - distance * 0.1);
                    const opacity = isMini ? 1 : Math.max(0.3, 1 - distance * 0.4);
                    
                    const isNear = distance <= 1;
                    
                    return (
                        <div
                        key={item.virtualIndex}
                        className={styles.feedItem}
                        style={{
                            position: "absolute",
                            transform: `translateY(${top}px)`,
                            height: "100vh",
                            width: "100%"
                        }}
                        >
                            {item.type === "video" ? (
                                isNear && (
                                    <video
                                    ref={(el) => {
                                        if (el) videoRefs.current[item.virtualIndex] = el;
                                        else delete videoRefs.current[item.virtualIndex];
                                    }}
                                    src={item.src}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    style={{
                                        transform: `scale(${scale})`,
                                        opacity,
                                        transition: isMini
                                        ? "none"
                                        : "transform 0.2s ease-out, opacity 0.2s ease-out"
                                    }}
                                    />
                                )
                            ) : (
                                <img
                                src={item.src}
                                alt=""
                                loading="lazy"
                                style={{
                                    transform: `scale(${scale})`,
                                    opacity,
                                    transition: isMini
                                    ? "none"
                                    : "transform 0.2s ease-out, opacity 0.2s ease-out"
                                }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default React.memo(PlayerBackdrop);