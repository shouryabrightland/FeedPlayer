import './App.css';
import Playlist from './components/playlist/playlist';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Player from './components/player/player';
import Song from './components/song.class';
import PlayerState from './components/PlayerState.class';

import { useState, useEffect, useRef } from 'react';
import Login from './components/login/login';

function App() {
  const [KEY, setKEY] = useState(null);
  const [CONFIG, setCONFIG] = useState(null);
  const playerstateRef = useRef(null);
  if (!playerstateRef.current) {
    playerstateRef.current = new PlayerState();
  }
  const playerstate = playerstateRef.current;

  useEffect(() => {
    if(KEY){
      fetch(KEY + "index.json")
      .then(res => res.json())
      .then((data) => setCONFIG(buildConfig(data, KEY)));
    }
  }, [KEY]);

  return (
    <div className="app">
      {!CONFIG ? <Login setk={setKEY} /> : <></>}
      {CONFIG && <Player playstate={playerstate} config={CONFIG} />}
      <div className='content'>
        <Playlist config={CONFIG} k={KEY} playstate={playerstate} />
        <Footer />
      </div>
      <Navbar key={KEY} />
    </div>
  );

}

function buildConfig(data, KEY) {
  return {
    ...data,
    song_list: data.song_list.map(s => new Song(s, KEY))
  }
}


export default App;
