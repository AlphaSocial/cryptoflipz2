import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import CreateFlip from './pages/CreateFlip';
import Game from './pages/Game';
import './styles/globals.css';

function App() {
  return (
    <WalletContextProvider>
      <GameProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateFlip />} />
              <Route path="/game" element={<Game />} />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </WalletContextProvider>
  );
}

export default App; 