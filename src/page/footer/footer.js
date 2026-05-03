import React from "react"


import styles from "./footer.module.css"
export default React.memo(function Footer(){
    console.log("Rendering Footer")
    return (<footer className={styles.footer}></footer>)
})