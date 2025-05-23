import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../contexts/GameContext';
import { Trophy, Coins, Clock, Users } from 'lucide-react';
import Button from '../components/UI/Button';

const Profile = () => {
  const { publicKey } = useWallet();
  const { userStats, gameHistory } = useGame();

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            <p className="text-gray-400">{publicKey.toString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold text-white">{userStats?.wins || 0} Wins</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center space-y-2">
          <Coins className="h-8 w-8 text-purple-500 mx-auto" />
          <p className="text-gray-400">Total Winnings</p>
          <p className="text-2xl font-bold text-white">
            {userStats?.totalWinnings ? `${userStats.totalWinnings / 1e9} SOL` : '0 SOL'}
          </p>
        </div>

        <div className="card text-center space-y-2">
          <Clock className="h-8 w-8 text-purple-500 mx-auto" />
          <p className="text-gray-400">Games Played</p>
          <p className="text-2xl font-bold text-white">{userStats?.gamesPlayed || 0}</p>
        </div>

        <div className="card text-center space-y-2">
          <Users className="h-8 w-8 text-purple-500 mx-auto" />
          <p className="text-gray-400">Win Rate</p>
          <p className="text-2xl font-bold text-white">
            {userStats?.winRate ? `${userStats.winRate}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Game History */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Game History</h3>
        {gameHistory?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No games played yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gameHistory?.map((game, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-md"
              >
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    Game #{game.id}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(game.timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {game.result === 'win' ? '+' : '-'}{game.amount / 1e9} SOL
                    </p>
                    <p className={`text-sm ${game.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                      {game.result === 'win' ? 'Won' : 'Lost'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://explorer.solana.com/tx/${game.txHash}`, '_blank')}
                  >
                    View TX
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 