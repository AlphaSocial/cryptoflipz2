import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../contexts/GameContext';
import { Coins, Clock, Users } from 'lucide-react';
import Button from '../components/UI/Button';

const Home = () => {
  const { connected } = useWallet();
  const { flips, joinFlip } = useGame();

  const handleJoinFlip = async (flipAddress) => {
    try {
      await joinFlip(flipAddress);
    } catch (error) {
      console.error('Error joining flip:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Welcome to Crypto Flipz
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Flip NFTs with other collectors and win big! Create your own flip or join an existing one.
        </p>
        {connected && (
          <div className="mt-6">
            <Link to="/create">
              <Button variant="primary" size="lg">
                Create New Flip
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Active Flips Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Active Flips</h2>
        {flips.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Coins className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No active flips at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flips.map((flip) => (
              <div
                key={flip.address}
                className="bg-gray-800 rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">
                      {new Date(flip.createdAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">
                      {flip.rounds} Rounds
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-400">Price</p>
                  <p className="text-2xl font-bold text-white">
                    {flip.price / 1e9} SOL
                  </p>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleJoinFlip(flip.address)}
                >
                  Join Flip
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 