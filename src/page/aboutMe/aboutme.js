import { MediaImage } from "../../components/mediaImage";
import { ABOUT_ME_IMAGE } from "../../const";
import css from "./aboutMe.module.css";

export default function AboutMe() {
    return (
        <div className={css.AboutMe}>
            <div className={css.header}>FeedPlayer</div>
            <Meta />
        </div>
    );
}
function Meta() {
    return (
        <div className={css.meta}>
            <h3>TryAngles (Webonacci)</h3>

            <p className={css.tagline}>
                Just building stuff and figuring things out.
            </p>

            <div className={css.section}>
                <h4>Creator</h4>
                <div className={css.container}>
                    <p>
                        I’m exploring the intersection of AI and human psychology, 
                        currently building my foundation in programming and working 
                        toward real-world AI projects.
                    </p>
                    <MediaImage className={css.face} src={ABOUT_ME_IMAGE} alt="creator" />
                </div>
            </div>

            <div className={css.section}>
                <h4>About This App</h4>
                <p>
                    A simple idea—scroll your memories while music plays.
                     The goal is to make moments feel alive again, not just stored.
                </p>
            </div>
            <div className={css.section}>
                <h4>Tech Focus</h4>
                <p>
                    React • State Architecture
                </p>
            </div>
        </div>
    );
}