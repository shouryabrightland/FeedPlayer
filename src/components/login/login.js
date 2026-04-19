import styles from "./login.module.css"
export default function Login(prop){
    const setKey = prop.setk
    const handleChange = (e)=> setKey(e.target.value)

    return (<div className={styles.login}>
        <div className={styles.backdrop}></div>
        <div className={styles.popout}>
            <div className={styles.header}>Enter your Key</div>
            <div className={styles.description}>(If provided by Owner)</div>
            <input type="text" id={styles.key} className={styles.checking} onChange={handleChange}/>
        </div>
    </div>)
}