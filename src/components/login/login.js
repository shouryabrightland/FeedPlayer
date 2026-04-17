import "./login.css"
export default function Login(prop){
    const setKey = prop.setk
    const handleChange = (e)=> setKey(e.target.value)

    return (<div className="login">
        <div className="backdrop"></div>
        <div className="popout">
            <div className="header">Enter your Key</div>
            <div className="description">(If provided by Owner)</div>
            <input type="text" id="key" className="checking" onChange={handleChange}/>
        </div>
    </div>)
}