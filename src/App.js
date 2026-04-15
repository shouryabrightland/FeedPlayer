import logo from './logo.svg';
import './App.css';
import Playlist from './components/playlist/playlist';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Player from './components/player/player';
import Song from './components/song.class';
import PlayerState from './components/PlayerState.class';

import { useState, useEffect } from 'react';
import Login from './components/login/login';

function App() {
  const [KEY, setKEY] = useState("/data/");
  const [CONFIG, setCONFIG] = useState(null);
  const [playerstate] = useState(() => new PlayerState());

  useEffect(() => {
    fetch(KEY + "index.json")
      .then(res => res.json())
      .then((data) => {
        const songs = data.song_list.map(s => new Song(s,KEY));
        setCONFIG({
          ...data,
          song_list: songs
        });
      });
  }, [KEY]);

  return (
    <div className={CONFIG ? "app" : "app hide"}>
      {!CONFIG ? <Login setk={setKEY} /> : <></>}
      <Player playstate={playerstate} config={CONFIG}/>
      <div className='content'>
        <Playlist config={CONFIG} k={KEY} playstate={playerstate} />
        <Footer />
      </div>


      <Navbar />
    </div>
  );

}

export default App;
