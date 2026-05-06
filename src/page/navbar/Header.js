import { APP_NAME } from "../../const"
import HeaderStyles from "./Hearder.module.css"

export function Header(){
    return(
        <div className={`${HeaderStyles.header} no-copy`}>{APP_NAME}</div>
    )
}