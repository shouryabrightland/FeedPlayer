import styles from "./login.module.css"
import React from "react"
export default React.memo(function Login({appstate,buildConfig}){
    console.log("Rendering Login")
    const handleChange = (e)=> {
        const key = e.target.value;
        if (key) {
            fetch(key + "index.json")
            .then(res => res.json())
            .then((data) => {
                appstate.CONFIG.set(buildConfig(data, key))
                appstate.KEY.set(key)
            })
            .catch((e)=>{
              console.log("invalid Key",e)
            })
        }
    }
    return (<div className={styles.login}>
        <div className={styles.backdrop}></div>
        <div className={styles.popout}>
            <div className={styles.header}>Enter your Key</div>
            <div className={styles.description}>(If provided by Owner)</div>
            <input type="text" id={styles.key} className={styles.checking} onChange={handleChange}/>
        </div>
    </div>)
})