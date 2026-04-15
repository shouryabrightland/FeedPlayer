import PlayerState from "../PlayerState.class"
import Song from "../song.class"
import "./list.css"
export default function List(prop) {
    console.log("list",prop)
    /** @type {Song[]}*/
    const list = prop.list
    /**
     * @type {PlayerState}
    */
    const playstate = prop.playstate
    return (
        <div className="list">
            {(() => {
                const cards = []
                list.forEach(song => {
                    cards.push(card(song,playstate))
                })
                return cards
            })()}
        </div>
    )
}
/**
 * @param {Song} song
 * @param {PlayerState} playstate 
*/
function card(song,playstate) {
    return (
        <div className="item" onClick={()=>{
            playstate.play(song)
        }}>
            <div className="side">
                <img src={song.thumbnail} />
            </div>
            <div className="header">
                <div className="info">
                    <div className="title">{song.title}</div>
                    <div className="desc">{song.description}</div>
                </div>
                <div className="options">
                    <svg role="img" className="icon" viewBox="0 0 24 24"><path d="M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0 15a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m0-7.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0"></path></svg>
                </div>
            </div>
        </div>
    )
}