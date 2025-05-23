import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { storage } from '../services/storage';
import { generateId, sleep } from '../utils/helpers';
import { FLIP_TYPES, GAME_STATUS } from '../utils/constants';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { publicKey } = useWallet();
  
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
  const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [roundHistory, setRoundHistory] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastFlipResult, setLastFlipResult] = useState(null);

  const startGame = useCallback((flip) => {
    const game = {
      id: generateId(),
      flipId: flip.id,
      player1: flip.creator,
      player2: publicKey?.toString(),
      nft: flip.nft,
      price: flip.price,
      rounds: flip.rounds,
      status: GAME_STATUS.ACTIVE,
      createdAt: Date.now()
    };

    setCurrentGame(game);
    setGameStatus(GAME_STATUS.ACTIVE);
    setPlayerScores({ player1: 0, player2: 0 });
    setCurrentRound(1);
    setCurrentPlayer(1);
    setRoundHistory([]);
    setLastFlipResult(null);
  }, [publicKey]);

  const performFlip = useCallback(async (powerLevel) => {
    if (!currentGame || isFlipping) return;

    setIsFlipping(true);
    setLastFlipResult(null);

    // Simulate coin flip with power level affecting duration
    const flipDuration = powerLevel * 200; // 200ms per power level
    await sleep(flipDuration);

    // Calculate result (simplified - 50/50 chance)
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const winner = result === 'heads' ? 1 : 2;
    
    setLastFlipResult(result);

    // Update scores
    const newScores = { ...playerScores };
    if (winner === 1) {
      newScores.player1++;
    } else {
      newScores.player2++;
    }
    setPlayerScores(newScores);

    // Add to history
    setRoundHistory(prev => [...prev, { round: currentRound, winner, result, powerLevel }]);

    // Check if game is complete
    const maxRounds = currentGame.rounds;
    const halfRounds = Math.ceil(maxRounds / 2);
    
    if (newScores.player1 === halfRounds || newScores.player2 === halfRounds) {
      // Game over
      setGameStatus(GAME_STATUS.COMPLETED);
      const gameWinner = newScores.player1 > newScores.player2 ? 1 : 2;
      
      // Update flip status in storage
      storage.updateFlip(currentGame.flipId, {
        status: 'completed',
        winner: gameWinner,
        finalScores: newScores,
        completedAt: Date.now()
      });
    } else {
      // Next round
      if (currentRound < maxRounds) {
        setCurrentRound(prev => prev + 1);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
    }

    setIsFlipping(false);
  }, [currentGame, currentPlayer, currentRound, playerScores, isFlipping]);

  const endGame = useCallback(() => {
    setCurrentGame(null);
    setGameStatus(GAME_STATUS.WAITING);
    setPlayerScores({ player1: 0, player2: 0 });
    setCurrentRound(1);
    setCurrentPlayer(1);
    setRoundHistory([]);
    setLastFlipResult(null);
  }, []);

  const value = {
    currentGame,
    gameStatus,
    playerScores,
    currentRound,
    currentPlayer,
    roundHistory,
    isFlipping,
    lastFlipResult,
    startGame,
    performFlip,
    endGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 