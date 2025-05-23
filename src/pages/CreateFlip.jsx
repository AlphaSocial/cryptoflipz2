import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../contexts/GameContext';
import { Coins, Clock } from 'lucide-react';
import Button from '../components/UI/Button';

const CreateFlip = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { createFlip } = useGame();
  const [price, setPrice] = useState('');
  const [rounds, setRounds] = useState('3');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const priceInLamports = parseFloat(price) * 1e9;
      const numRounds = parseInt(rounds);

      if (isNaN(priceInLamports) || priceInLamports <= 0) {
        throw new Error('Please enter a valid price');
      }

      if (isNaN(numRounds) || numRounds < 1 || numRounds > 10) {
        throw new Error('Please enter a valid number of rounds (1-10)');
      }

      const flipAddress = await createFlip(priceInLamports, numRounds);
      navigate(`/game/${flipAddress}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to create a flip.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Create New Flip</h2>
          <p className="text-gray-400 mt-2">
            Set the price and number of rounds for your flip game
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Price Input */}
          <div className="space-y-2">
            <label className="block text-gray-400">Price (SOL)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Coins className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Rounds Input */}
          <div className="space-y-2">
            <label className="block text-gray-400">Number of Rounds</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-sm text-gray-500">Choose between 1 and 10 rounds</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-md">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Create Flip
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateFlip; 