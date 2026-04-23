import { useEffect, useState } from "react";
import { usePlayerValue } from "./state.class";
import PlayerState from "./PlayerState.class";
export function Play_btn(prop) {
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
                    <stop offset="0" stop-color="#888888"></stop>
                    <stop offset=".3" stop-color="#888888" stop-opacity=".9"></stop>
                    <stop offset=".6" stop-color="#888888" stop-opacity=".6"></stop>
                    <stop offset=".8" stop-color="#888888" stop-opacity=".3"></stop>
                    <stop offset="1" stop-color="#888888" stop-opacity="0"></stop>
                </radialGradient>
                <circle transform-origin="center" fill="none" stroke="url(#a3)" stroke-width="15" stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100" r="70">
                    <animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.5" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform>
                </circle>
                <circle transform-origin="center" fill="none" opacity=".2" stroke="#888888" stroke-width="15" stroke-linecap="round" cx="100" cy="100" r="70"></circle>
            </svg >
        )
    }
    else if (isPlaying) return <svg className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z"></path></svg>;
    return <svg className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>
}
