import React from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css"

import Home from "./page/Home"
import PlayListPage from "./page/Playlist";
import { PlayerProvider } from "./core/PlayerProvider";
import { PlaylistProvider } from "./core/PlaylistProvider";


import Player from "./page/Player/Player";
import Navbar from "./page/navbar/navbar";
import Footer from "./page/footer/footer";
import AboutMe from "./page/aboutMe/aboutme";
import NotFound from "./page/others/404";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playlist" element={<PlayListPage />} />
        <Route path="/aboutme" element={<AboutMe />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  )
}

function AppLayout({ children }) {
  return (
    <div className="app">
      <PlayerProvider>
        <PlaylistProvider>
          <div className="content">
            {children}
            <Footer />
          </div>
          <Player />
        </PlaylistProvider>
      </PlayerProvider>
      <Navbar />
    </div>
  )
}











// import './App.css';
// import { useRef, lazy, Suspense, useEffect } from 'react';
// import { AppState, useAppState } from './core/AppState.class';
// import { Home } from './page/Home';
// import { Route, Router, Routes } from 'react-router-dom';
// import PlaylistPage from './page/Playlist';



// function App() {
//   console.log("Rendering App")
//   // const playerstateRef = useRef(null);
//   const appstateRef = useRef(null);
//   // if (!playerstateRef.current) {
//   // playerstateRef.current = new PlayerState();
//   // }
//   if (!appstateRef.current) {
//     appstateRef.current = new AppState()
//   }

//   /**
//    * @type {AppState}
//   */
//   const appstate = appstateRef.current;
//   // const playerstate = playerstateRef.current;

//   useEffect(() => {
//     (async () => {
//       await appstate.init()
//       console.log(appstate)
//       return () => { }
//     })()
//   }, [])

//   return (
//     <div className="app">
//       <Routes>
//         <Route path="/" element={<Home appstate={appstate} />} />
//         <Route path="/playlist" element={<PlaylistPage />}/>
//       </Routes>
//       {/* <Player playstate={playerstate} appstate={appstate} /> */}
//       {/* {<Login appstate={appstate} />}

//       <Suspense fallback={null}>
//         {}
//       </Suspense>

//       <div className='content'>
//         <Suspense fallback={null}>
//           <Playlist appstate={appstate} playstate={playerstate} />
//         </Suspense>
//         <Footer appstate={appstate} />
//       </div>
//       <Suspense fallback={null}>
//          <Navbar appstate={appstate} /> 
//       </Suspense> 
//       */}
//     </div>
//   );

// }

export default App;
