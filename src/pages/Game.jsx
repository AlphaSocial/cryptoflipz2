import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../contexts/GameContext';
import { Coins, Clock, Users } from 'lucide-react';
import Button from '../components/UI/Button';

const Game = () => {
  const { flipAddress } = useParams();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const {
    currentGame,
    gameStatus,
    playerScores,
    currentRound,
    currentPlayer,
    roundHistory,
    isFlipping,
    lastFlipResult,
    performFlip,
    claimWinnings,
    endGame
  } = useGame();

  useEffect(() => {
    if (!currentGame) {
      navigate('/');
    }
  }, [currentGame, navigate]);

  const isPlayerTurn = () => {
    if (!currentGame || !publicKey) return false;
    const isPlayer1 = currentGame.player1 === publicKey.toString();
    return (isPlayer1 && currentPlayer === 1) || (!isPlayer1 && currentPlayer === 2);
  };

  const handleFlip = async (powerLevel) => {
    try {
      await performFlip(powerLevel);
    } catch (error) {
      console.error('Error performing flip:', error);
    }
  };

  const handleClaimWinnings = async () => {
    try {
      await claimWinnings();
      endGame();
      navigate('/');
    } catch (error) {
      console.error('Error claiming winnings:', error);
    }
  };

  if (!currentGame) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Game Info */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Round {currentRound} of {currentGame.rounds}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">
              {playerScores.player1} - {playerScores.player2}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-400">Stake</p>
          <p className="text-2xl font-bold text-white">
            {currentGame.price / 1e9} SOL
          </p>
        </div>
      </div>

      {/* Game Status */}
      {gameStatus === 'completed' ? (
        <div className="card text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Game Complete!</h2>
          <p className="text-xl text-gray-400">
            {playerScores.player1 > playerScores.player2 ? 'Player 1' : 'Player 2'} wins!
          </p>
          {publicKey && (
            <Button
              variant="primary"
              onClick={handleClaimWinnings}
            >
              Claim Winnings
            </Button>
          )}
        </div>
      ) : (
        <div className="card space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isFlipping ? 'Flipping...' : isPlayerTurn() ? 'Your Turn!' : 'Waiting for opponent...'}
            </h2>
            {lastFlipResult && (
              <p className="text-xl text-gray-400">
                Last flip: {lastFlipResult}
              </p>
            )}
          </div>

          {isPlayerTurn() && !isFlipping && (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((power) => (
                <Button
                  key={power}
                  variant="secondary"
                  onClick={() => handleFlip(power)}
                  disabled={isFlipping}
                >
                  Power {power}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Round History */}
      {roundHistory.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Round History</h3>
          <div className="space-y-2">
            {roundHistory.map((round, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-md"
              >
                <span className="text-gray-400">Round {round.round}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Power: {round.powerLevel}</span>
                  <span className="text-gray-400">Result: {round.result}</span>
                  <span className="text-white">Winner: Player {round.winner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game; 