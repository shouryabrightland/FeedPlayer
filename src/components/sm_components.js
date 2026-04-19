import { useEffect, useState } from "react";
export function Play_btn(prop) {
    /** @type {PlayerState}*/
    const state = prop.state
    const styles = prop.styles || {}
    const [isPlaying, setIsPlaying] = useState(state?.isPlaying.get())

    if (!state) {
        console.log("state not found in play_btn")
    }

    useEffect(() => {
        return state?.isPlaying.onUpdate(setIsPlaying)
    }, [state])
    if (isPlaying) return <svg className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z"></path></svg>;
    return <svg className={`icon ${styles.icon}`} viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>
}
