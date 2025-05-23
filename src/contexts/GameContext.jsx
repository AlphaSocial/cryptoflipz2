import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { smartContract } from '../services/smartContract';
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
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
  const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [roundHistory, setRoundHistory] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastFlipResult, setLastFlipResult] = useState(null);
  const [flips, setFlips] = useState([]);

  // Initialize smart contract when wallet connects
  useEffect(() => {
    if (connected && publicKey && connection) {
      smartContract.initialize({ publicKey }, connection);
      loadAllFlips();
    }
  }, [connected, publicKey, connection]);

  const loadAllFlips = useCallback(async () => {
    try {
      const allFlips = await smartContract.getAllFlips();
      const activeFlips = allFlips.filter(flip => 
        flip.status.active && !flip.challenger
      );
      setFlips(activeFlips);
    } catch (error) {
      console.error('Error loading flips:', error);
    }
  }, []);

  const createFlip = useCallback(async (nftMint, price, rounds) => {
    try {
      const result = await smartContract.createFlip(nftMint, price, rounds);
      await loadAllFlips(); // Refresh flip list
      return result;
    } catch (error) {
      console.error('Error creating flip:', error);
      throw error;
    }
  }, [loadAllFlips]);

  const joinFlip = useCallback(async (flipAddress) => {
    try {
      const result = await smartContract.joinFlip(flipAddress);
      
      // Set up game state
      const flipData = await smartContract.getFlip(flipAddress);
      const game = {
        flipAddress,
        player1: flipData.creator.toString(),
        player2: publicKey.toString(),
        nft: flipData.nftMint.toString(),
        price: flipData.price.toNumber(),
        rounds: flipData.rounds,
        status: GAME_STATUS.ACTIVE,
      };

      setCurrentGame(game);
      setGameStatus(GAME_STATUS.ACTIVE);
      setPlayerScores({ player1: 0, player2: 0 });
      setCurrentRound(1);
      setCurrentPlayer(1);
      setRoundHistory([]);

      return result;
    } catch (error) {
      console.error('Error joining flip:', error);
      throw error;
    }
  }, [publicKey]);

  const performFlip = useCallback(async (powerLevel) => {
    if (!currentGame || isFlipping) return;

    try {
      setIsFlipping(true);
      setLastFlipResult(null);

      // Submit flip to smart contract
      const result = await smartContract.performFlip(
        currentGame.flipAddress, 
        powerLevel, 
        currentRound
      );

      // Get updated flip data
      const flipData = await smartContract.getFlip(currentGame.flipAddress);
      
      // Determine result from blockchain
      const latestResult = flipData.roundResults[currentRound - 1];
      const flipResult = latestResult.heads ? 'heads' : 'tails';
      
      setLastFlipResult(flipResult);

      // Update local state
      const winner = currentPlayer;
      const newScores = { ...playerScores };
      if (winner === 1) {
        newScores.player1++;
      } else {
        newScores.player2++;
      }
      setPlayerScores(newScores);

      setRoundHistory(prev => [...prev, { 
        round: currentRound, 
        winner, 
        result: flipResult, 
        powerLevel 
      }]);

      // Check if game is complete
      const maxRounds = currentGame.rounds;
      const halfRounds = Math.ceil(maxRounds / 2);
      
      if (newScores.player1 >= halfRounds || newScores.player2 >= halfRounds) {
        setGameStatus(GAME_STATUS.COMPLETED);
      } else {
        setCurrentRound(prev => prev + 1);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }

    } catch (error) {
      console.error('Error performing flip:', error);
      throw error;
    } finally {
      setIsFlipping(false);
    }
  }, [currentGame, currentPlayer, currentRound, playerScores, isFlipping]);

  const claimWinnings = useCallback(async () => {
    if (!currentGame) return;

    try {
      const result = await smartContract.claimWinnings(currentGame.flipAddress);
      return result;
    } catch (error) {
      console.error('Error claiming winnings:', error);
      throw error;
    }
  }, [currentGame]);

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
    // Game state
    currentGame,
    gameStatus,
    playerScores,
    currentRound,
    currentPlayer,
    roundHistory,
    isFlipping,
    lastFlipResult,
    flips,
    
    // Actions
    createFlip,
    joinFlip,
    performFlip,
    claimWinnings,
    endGame,
    loadAllFlips
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 