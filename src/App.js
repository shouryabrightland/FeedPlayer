import { useRef, lazy, Suspense } from 'react';
import { AppState, useAppState } from './AppState.class';
import Login from './components/login/login';
import PlayerState from './components/PlayerState.class';
import Song from './components/song.class';
import Footer from './components/footer';
import './App.css';

const Playlist = lazy(() => import('./components/playlist/playlist'));
const Navbar = lazy(() => import('./components/navbar'));
const Player = lazy(() => import('./components/player/player'));

function App() {
  console.log("Rendering App")

  const playerstateRef = useRef(null);
  const appstateRef = useRef(null);
  if (!playerstateRef.current) {
    playerstateRef.current = new PlayerState();
  }
  if (!appstateRef.current) {
    appstateRef.current = new AppState()
  }


  /**
   * @type {AppState}
  */
  const appstate = appstateRef.current;
  const playerstate = playerstateRef.current;
  const config = useAppState(appstate.CONFIG)

  return (
    <div className="app">
      {!config ? <Login appstate={appstate} buildConfig={buildConfig} /> : <></>}
     
      <Suspense fallback={<div></div>}>
        {config && <Player playstate={playerstate} appstate={appstate} />}
      </Suspense>

      <div className='content'>
        <Suspense fallback={<div></div>}>
          <Playlist appstate={appstate} playstate={playerstate} />
        </Suspense>
        <Footer />

      </div>
      <Suspense fallback={<></>}>
        <Navbar appstate={appstate} />
      </Suspense>
    </div>
  );

}

function buildConfig(data, KEY) {
  return {
    ...data,
    song_list: data.song_list.map(s => new Song(s, KEY)),
    _key: KEY
  }
}


export default App;
