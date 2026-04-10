import logo from './logo.svg';
import './App.css';
import Playlist from './components/playlist/playlist';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Player from './components/player/player';


function App() {
  return (
    <div className="app">
      <Player/>
      <div className='content'>
        <Playlist />
        <Footer/>
      </div>

      
      <Navbar/>
    </div>
  );

}



// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
