import { ABOUT_ME_IMAGE } from "../../const";
import css from "./aboutMe.module.css";

export default function AboutMe() {
    return (
        <div className={css.AboutMe}>
            <div className={css.header}>FeedPlayer</div>
            {/* <ProfileCard /> */}
            <Meta />
        </div>
    );
}

function ProfileCard() {
    return (
        <div className={css.ProfileCard}>
            <div className={css.left}>
                <Meta />
            </div>
            <div className={css.right}>
                
            </div>
        </div>
    );
}

function Meta() {
    return (
        <div className={css.meta}>
            <h3>TryAngles (Webonacci)</h3>

            <p className={css.tagline}>
                Building systems that understand people — not just code.
            </p>

            <div className={css.section}>
                <h4>Creator</h4>
                <div className={css.container}>
                    <p>
                        A student developer from India focused on AI, systems, and human
                        psychology. I don’t just write code — I try to understand behavior,
                        patterns, and emotions behind it.
                    </p>
                    <img className={css.face} src={ABOUT_ME_IMAGE} alt="creator" />
                </div>
            </div>

            <div className={css.section}>
                <h4>About This App</h4>
                <p>
                    This app is designed as an intelligent media + interaction platform.
                    It focuses on personalization, offline capability, and user-driven
                    experience.
                </p>
                <p>
                    Long term vision: combine AI with emotional intelligence to create a
                    system that adapts to users — not the other way around.
                </p>
            </div>

            <div className={css.section}>
                <h4>Tech Focus</h4>
                <p>
                    React • State Architecture • Offline-first systems • AI integration
                </p>
            </div>
        </div>
    );
}