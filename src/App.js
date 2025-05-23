import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import CreateFlip from './pages/CreateFlip';
import Game from './pages/Game';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <WalletProvider>
        <GameProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateFlip />} />
              <Route path="/game/:flipAddress" element={<Game />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </GameProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;
