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

export default function App() {
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
    <div className="app no-copy">
      <PlaylistProvider>
        <PlayerProvider>
          <div className="content">
            <div className="MainBody">
              {children}
            </div>
          <Footer />
          </div>
          <Player />
        </PlayerProvider>
      </PlaylistProvider>
      <Navbar />
    </div>
  )
}