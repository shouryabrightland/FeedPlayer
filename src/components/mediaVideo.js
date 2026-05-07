import React, { useEffect, useMemo, useRef, useState } from "react";

function isAbsolute(src) {
    return /^https?:\/\//.test(src);
}

function getVideoURL(base, src, size) {
    const parts = src.split("/");
    const file = parts.pop();
    const folder = parts.join("/");
    const name = file.replace(/\.[^/.]+$/, "");

    return `${base}/generated/${folder}/${size}/${name}.mp4`;
}

export const MediaVideo = React.memo(function MediaVideo({

    src,
    base = window.location.origin,

    mode = "warm", // cold | warm | hot | focus

    width,
    height,

    autoPlay = false,
    muted = true,
    loop = true,
    controls = false,

    className = "",
    onClick,
    onLoadedMetadata,

    pause

}) {

    const previewRef = useRef(null);
    const mainRef = useRef(null);

    const [loaded, setLoaded] = useState(false);

    // ---------------- URLS ----------------
    const previewURL = useMemo(() => {

        if (!src) return null;
        if (isAbsolute(src)) return src;

        return getVideoURL(base, src, "preview");

    }, [src, base]);

    const mainURL = useMemo(() => {

        if (!src) return null;
        if (mode === "cold") return null;
        if (isAbsolute(src)) return src;

        const size =
            mode === "focus" ? 1080 :
                mode === "hot" ? 720 :
                    480;

        return getVideoURL(base, src, size);

    }, [src, base, mode]);

    // ---------------- PLAY CONTROL ----------------
    useEffect(() => {

        const preview = previewRef.current;
        const main = mainRef.current;

        if(pause){
            main?.pause()
            preview.pause()
            return;
        }

        if (!preview || !main) return;
        // ---------------- MAIN READY ----------------
        if (loaded) {

            preview.pause();

            if (mode === "hot" || mode === "focus") {

                main.play().catch(() => { });

            } else {

                main.pause();
            }
        }
        // ---------------- MAIN NOT READY ----------------
        else {
            main.pause();
            preview.play().catch(() => { });
        }
    }, [mode, loaded,pause]);

    return (
        <div
            className={className}
            style={{
                width,
                height,
                position: "relative",
                overflow: "hidden",
                background: "#000"
            }}
            onClick={onClick}
        >

            {/* ---------------- PREVIEW LAYER ---------------- */}
            {previewURL && (
                <video
                    ref={previewRef}
                    src={previewURL}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scale(1.05)",
                        opacity: loaded ? 0 : 1,
                        transition: "opacity 0.3s ease"
                    }}
                    onLoadedMetadata={onLoadedMetadata}
                />
            )}

            {/* ---------------- MAIN LAYER ---------------- */}
            {mainURL && (
                <video
                    ref={mainRef}
                    src={mainURL}
                    muted={muted}
                    loop={loop}
                    controls={controls}
                    playsInline
                    preload={mode === "hot" || mode === "focus" ? "metadata" : "none"}
                    onLoadedData={() => {
                        setLoaded(true)
                        previewRef.current?.pause();
                    }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: loaded ? 1 : 0,
                        transition: "opacity 0.3s ease"
                    }}
                />
            )}

        </div>
    );
});