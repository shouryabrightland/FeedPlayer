import { AppState, useAppState } from "../../AppState.class"
import { decodeKey } from "../../core/key"
import styles from "./login.module.css"
import React from "react"
/**
 * @param {{ appstate: AppState, buildConfig: Function }} props
*/
function Login({appstate,buildConfig}){

    const loginNeed = useAppState(appstate.LoginNeeded)
    const validKey = useAppState(appstate.isValidKey)
    if (!loginNeed) return

    console.log("Rendering Login")

    const handleChange = (e)=> {
        const key = e.target.value;
        if (key) appstate.KEY.set(decodeKey(key))
    }

    return (<div className={`${styles.login} ${validKey==1?styles.correct:""} ${validKey==-1?styles.invalid:""}`}>
        <div className={styles.backdrop}></div>
        <div className={styles.popout}>
            <div className={styles.header}>Enter your Key</div>
            <div className={styles.description}>(If provided by Owner)</div>
            <input type="text" id={styles.key} className={styles.checking} onChange={handleChange}/>
            <span className={styles.msgSpan}>Invalid Key</span>
        </div>
    </div>)
}

export default React.memo(Login)