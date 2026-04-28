import { usePlayerValue } from "./state.class";
import { AppState } from "../AppState.class";
export function PlayBtn(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const styles = prop.styles || {}
    const isPlaying = usePlayerValue(state.isPlaying)
    const isLoading = usePlayerValue(state.isLoading)

    if (!state) {
        console.log("state not found in play_btn")
    }

    if (isLoading) {
        return (
            < svg className="icon" viewBox="0 0 200 200" >
                <radialGradient id="a3" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
                    <stop offset="0" stopColor="#888888"></stop>
                    <stop offset=".3" stopColor="#888888" stopOpacity=".9"></stop>
                    <stop offset=".6" stopColor="#888888" stopOpacity=".6"></stop>
                    <stop offset=".8" stopColor="#888888" stopOpacity=".3"></stop>
                    <stop offset="1" stopColor="#888888" stopOpacity="0"></stop>
                </radialGradient>
                <circle transformOrigin="center" fill="none" stroke="url(#a3)" strokeWidth="15" strokeLinecap="round" strokeDasharray="200 1000" strokeDashoffset="0" cx="100" cy="100" r="70">
                    <animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.5" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform>
                </circle>
                <circle transformOrigin="center" fill="none" opacity=".2" stroke="#888888" strokeWidth="15" strokeLinecap="round" cx="100" cy="100" r="70"></circle>
            </svg >
        )
    }
    else if (isPlaying) return <svg className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z"></path></svg>;
    return <svg className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>
}

export function getAverageColor(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // ⚠️ needed if external images

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // 🔥 downscale for performance
            const size = 50;
            canvas.width = size;
            canvas.height = size;

            ctx.drawImage(img, 0, 0, size, size);

            const data = ctx.getImageData(0, 0, size, size).data;

            let r = 0, g = 0, b = 0;
            const total = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            r = Math.floor(r / total);
            g = Math.floor(g / total);
            b = Math.floor(b / total);

            [r,g,b] = enhanceColor(r,g,b)

            resolve(`rgb(${r}, ${g}, ${b})`);
        };

        img.src = src;
    });
}
function enhanceColor(r, g, b) {
    const factor = 1.2; // boost vibrance
    return [
        Math.min(255, r * factor),
        Math.min(255, g * factor),
        Math.min(255, b * factor)
    ];
}