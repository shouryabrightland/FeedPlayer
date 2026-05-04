import styles from "./styles.module.css"
export function Container({title,message}){
    return(
        <div className={styles.container}>
                <h2>{title}</h2>
                <p>{message}</p>
            </div>
    )

}