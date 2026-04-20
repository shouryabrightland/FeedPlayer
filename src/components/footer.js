import styles from "./footer.module.css"
import React from "react"
export default React.memo(function Footer(){
    console.log("Rendering Footer")
    return (<footer className={styles.footer}>
        
    </footer>)
})