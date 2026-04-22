import { useAppState } from "../AppState.class"
import styles from "./footer.module.css"
import React from "react"
export default React.memo(function Footer({appstate}){
    const config = useAppState(appstate.CONFIG)
    if (!config) return


    console.log("Rendering Footer")
    return (<footer className={styles.footer}>
        
    </footer>)
})