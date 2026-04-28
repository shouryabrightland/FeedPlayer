import { useRef, lazy, Suspense, useEffect } from 'react';
import { AppState, useAppState } from './AppState.class';
import Login from './components/login/login';
import PlayerState from './components/PlayerState.class';
import Song from './components/song.class';
import Footer from './components/footer';
import './App.css';
import { handleKey , storeKey , getKey } from './key';

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
  const isValidKey = useAppState(appstate.isValidKey);
  useEffect(() => {
    const unsubscribe = appstate.KEY.onUpdate((k)=>handleKey(k,appstate));
    return unsubscribe;
  }, []);

  useEffect(()=>{
    const isvalid = appstate.isValidKey.get();
    if (isvalid == 1) return;
    else if(isvalid == 0){
      const key = getKey();
      appstate.KEY.set(key);
    }else{
      appstate.LoginNeeded.set(true);
    }
  },[isValidKey])

  return (
    <div className="app">
      {<Login appstate={appstate} />}

      <Suspense fallback={null}>
        {<Player playstate={playerstate} appstate={appstate} />}
      </Suspense>

      <div className='content'>
        <Suspense fallback={null}>
          <Playlist appstate={appstate} playstate={playerstate} />
        </Suspense>
        <Footer appstate={appstate} />
      </div>
      <Suspense fallback={null}>
        <Navbar appstate={appstate} />
      </Suspense>
    </div>
  );

}

export default App;
