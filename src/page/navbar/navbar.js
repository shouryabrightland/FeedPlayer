import { useLocation, useNavigate } from "react-router-dom";
import { HomeIcon, PlayListIcon } from "../../icons";
import NavStyles from "./navbar.module.css";
import { ABOUT_ME_IMAGE } from "../../const";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    return (
        <div className={NavStyles.navbar}>
            
            <div
                className={`${NavStyles.item} ${isActive("/") ? NavStyles.active : ""}`}
                onClick={() => navigate("/")}
            >
                <HomeIcon styles={NavStyles}/>
                Home
            </div>

            <div
                className={`${NavStyles.item} ${isActive("/playlist") ? NavStyles.active : ""}`}
                onClick={() => navigate("/playlist")}
            >
                <PlayListIcon styles={NavStyles}/>
                Playlist
            </div>

            <div
                className={`${NavStyles.item} ${isActive("/aboutMe") ? NavStyles.active : ""}`}
                onClick={() => navigate("/aboutme")}
            >
                <img className="icon" src={ABOUT_ME_IMAGE} style={{borderRadius:"50%"}}/>
                About me
            </div>

        </div>
    );
}