import React from "react"


import styles from "./footer.module.css"
export default React.memo(function Footer(){
    return (<footer className={styles.footer}>
        <div className={styles.container}>
            “Work in progress — things might break”
            <br/>
            v0.0.2 • Still improving
            <p>
            Just building things I’d actually use.
            <br/>
            Built by TryAngles
        </p>
        </div>
        
    </footer>)
})