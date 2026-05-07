import React, { useEffect, useRef, useState, useMemo} from "react";
import { NO_IMAGE_URL } from "../const";

function isAbsolute(src) {
    return /^https?:\/\//.test(src);
}

function pickSize(width) {
    if (width <= 50) return 50;
    if (width <= 480) return 480;
    if (width <= 720) return 720;
    return 1080;
}

export const MediaImage = React.memo(function MediaImage({
    src,
    base = window.location.origin,
    alt = "",
    width,
    height,
    className = "",
    onClick,
    onLoad,
    style,
    image_style
}) {

    const ref = useRef(null);
    const [size, setSize] = useState(480);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {

        const el = ref.current;
        if (!el) return;

        const update = () => {

            const w = width
                ? width * devicePixelRatio
                : el.getBoundingClientRect().width * devicePixelRatio;

            setSize(pickSize(w || window.innerWidth));
        };

        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);

        return () => ro.disconnect();

    }, [width]);

    const tiny = useMemo(() => getImageURL(base,src,50), [base,src]);
    const main = useMemo(() => getImageURL(base,src,size), [base,src,size]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                position: "relative",
                overflow: "hidden",
                width,
                height,
                ...style
            }}
            onClick={onClick}
        >

            <img
                src={tiny}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(18px)",
                    transform: "scale(1.1)",
                    opacity: loaded ? 0 : 1,
                    transition: "opacity .25s",
                    ...image_style
                }}
                onLoad={onLoad}
            />

            <img
                src={main}
                alt={alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                onLoad={(e) =>{
                    setLoaded(true)
                    if (onLoad) onLoad(e);
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity .25s",
                    ...image_style
                }}
            />

        </div>
    );
});

export function getImageURL(base, src, sizeVal) {

    if (isAbsolute(src)) return src;
    if (!src) {
        return NO_IMAGE_URL;
    }
    const parts = src.split("/");
    const file = parts.pop();
    const folder = parts.join("/");
    const name = file.replace(/\.[^/.]+$/, "");

    return `${base}/generated/${folder}/${sizeVal}/${name}.webp`;
};



































// import React, {
//     useEffect,
//     useRef,
//     useState,
//     useMemo
// } from "react";
// import { NO_IMAGE_URL } from "../const";

// export function getImageURL(base,src, size) {

//     if (!base || !src) return NO_IMAGE_URL;

//     console.log(base,src,"getimg url")
//     const parts = src.split("/");

//     const filename = parts.pop();

//     const folder = parts.join("/");

//     const name = filename.replace(/\.[^/.]+$/, "");

//     return encodeURI(
//         `${base}/generated/${folder}/${size}/${name}.webp`
//     );
// }

// function pickSizePhoto(width) {

//     if (width <= 50) return 50;
//     if (width <= 480) return 480;
//     if (width <= 720) return 720;

//     return 1080;
// }

// export const MediaImage =  React.memo(function MediaImage({
//     src,
//     alt = "",
//     width,
//     height,
//     className = "",
//     base = window.location.origin,
//     styles = {},
//     onClick
// }) {

//     const containerRef = useRef(null);

//     const [loaded, setLoaded] = useState(false);

//     const [size, setSize] = useState(480);

//     const sizeRef = useRef(480);

// useEffect(() => {

//     const el = containerRef.current;
//     if (!el) return;

//     const update = () => {

//         let targetWidth;

//         if (width) {
//             targetWidth = width * window.devicePixelRatio;
//         } else {
//             targetWidth = el.getBoundingClientRect().width * window.devicePixelRatio;
//         }

//         if (!targetWidth) targetWidth = window.innerWidth;

//         const newSize = pickSizePhoto(targetWidth);

//         if (newSize !== sizeRef.current) {
//             sizeRef.current = newSize;
//             setSize(newSize);
//         }
//     };

//     update();

//     const ro = new ResizeObserver(update);
//     ro.observe(el);

//     return () => ro.disconnect();

// }, [width]);

//     const tiny = useMemo(
//         () => getImageURL(base,src, 50),
//         [src]
//     );

//     const main = useMemo(
//         () => getImageURL(base,src, size),
//         [src, size]
//     );

//     return (
//         <div
//             ref={containerRef}
//             className={className}
//             style={{
//                 position: "relative",
//                 overflow: "hidden",
//                 width,
//                 height,
//                 ...styles
//             }}
//         >

//             <img
//                 src={tiny}
//                 alt=""
//                 aria-hidden="true"
//                 draggable={false}
//                 onClick={onClick}
//                 style={{
//                     position: "absolute",
//                     inset: 0,
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                     filter: "blur(20px)",
//                     transform: "scale(1.1)",
//                     opacity: loaded ? 0 : 1,
//                     transition: "opacity .3s"
//                 }}
//             />

//             <img
//                 src={main}
//                 alt={alt}
//                 loading="lazy"
//                 decoding="async"
//                 onClick={onClick}
//                 draggable={false}
//                 onLoad={() => setLoaded(true)}
//                 style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                     opacity: loaded ? 1 : 0,
//                     transition: "opacity .3s"
//                 }}
//             />

//         </div>
//     );
// })

// function getVideoURL(base,src, size) {

//     const parts = src.split("/");
//     const filename = parts.pop();
//     const folder = parts.join("/");
//     const name = filename.replace(/\.[^/.]+$/, "");

//     return encodeURI(`${base}/generated/${folder}/${size}/${name}.mp4`);
// }

// function pickSizeVideo(width) {

//     if (width <= 480) return 480;
//     if (width <= 720) return 720;
//     return 1080;
// }

// export function MediaVideo({
//     src,
//     base,
//     width,
//     height,
//     className = "",
//     autoPlay = false,
//     controls = false,
//     muted = true,
//     loop = true
// }) {

//     const containerRef = useRef(null);
//     const videoRef = useRef(null);

//     const [inView, setInView] = useState(false);
//     const sizeRef = useRef(480);

//     // SIZE
//     useEffect(() => {

//         const el = containerRef.current;
//         if (!el) return;

//         const update = () => {

//             let targetWidth = width;

//             if (!targetWidth) {
//                 targetWidth = el.getBoundingClientRect().width;
//             }

//             if (!targetWidth) targetWidth = window.innerWidth;

//             targetWidth *= window.devicePixelRatio;

//             const newSize = pickSizeVideo(targetWidth);

//             if (newSize !== sizeRef.current) {
//                 sizeRef.current = newSize;
//             }
//         };

//         update();

//         const ro = new ResizeObserver(update);
//         ro.observe(el);

//         return () => ro.disconnect();

//     }, [width]);

//     // VISIBILITY
//     useEffect(() => {

//         const el = containerRef.current;
//         if (!el) return;

//         const observer = new IntersectionObserver(
//             ([entry]) => {
//                 setInView(entry.isIntersecting);
//             },
//             {
//                 threshold: 0.25,
//                 rootMargin: "250px"
//             }
//         );

//         observer.observe(el);

//         return () => observer.disconnect();

//     }, []);

//     // STABLE VIDEO SOURCE (IMPORTANT FIX)
//     const videoSrc = useMemo(() => {
//         return getVideoURL(base,src, sizeRef.current);
//     }, [src]);

//     // PLAY CONTROL ONLY
//     useEffect(() => {

//         const video = videoRef.current;
//         if (!video) return;

//         if (inView && autoPlay) {
//             video.play().catch(() => {});
//         } else {
//             video.pause();
//         }

//     }, [inView, autoPlay]);

//     return (
//         <div
//             ref={containerRef}
//             className={className}
//             style={{
//                 width,
//                 height,
//                 overflow: "hidden",
//                 position: "relative"
//             }}
//         >

//             <video
//                 ref={videoRef}
//                 src={videoSrc}

//                 preload={inView ? "metadata" : "none"}

//                 playsInline
//                 muted={muted}
//                 loop={loop}
//                 controls={controls}

//                 style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                     background: "#000"
//                 }}
//             />

//         </div>
//     );
// }