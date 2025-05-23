import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Image, DollarSign, Coins } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import NFTSelector from '../components/Flip/NFTSelector';
import Button from '../components/UI/Button';
import { storage } from '../services/storage';
import { generateId } from '../utils/helpers';
import { FLIP_TYPES, FLIP_STATUS } from '../utils/constants';

const CreateFlip = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [price, setPrice] = useState('');
  const [rounds, setRounds] = useState(FLIP_TYPES.THREE_ROUNDS);
  const [showNFTSelector, setShowNFTSelector] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectNFT = (nft) => {
    setSelectedNFT(nft);
    setShowNFTSelector(false);
  };

  const handleCreateFlip = async (e) => {
    e.preventDefault();
    
    if (!connected || !selectedNFT || !price) {
      return;
    }

    try {
      setIsCreating(true);

      const flip = {
        id: generateId(),
        creator: publicKey.toString(),
        nft: selectedNFT,
        price: parseFloat(price),
        rounds,
        status: FLIP_STATUS.ACTIVE,
        createdAt: Date.now()
      };

      storage.saveFlip(flip);
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error creating flip:', error);
      alert('Error creating flip. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!connected) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-6xl mb-6">🔗</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-xl text-white/70 mb-8">
              You need to connect your Phantom wallet to create a flip.
            </p>
            <div className="text-white/60">
              Click the "Connect Wallet" button in the header to get started.
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create New Flip
          </h1>
          <p className="text-xl text-white/70">
            Select your NFT, set the stakes, and challenge other players
          </p>
        </div>

        <form onSubmit={handleCreateFlip} className="space-y-8">
          {/* NFT Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Select NFT</h2>
              <Button
                type="button"
                onClick={() => setShowNFTSelector(true)}
                variant="outline"
                size="sm"
              >
                Browse NFTs
              </Button>
            </div>
            
            {selectedNFT ? (
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.name}
                    className="w-full h-64 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=NFT';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Button
                      type="button"
                      onClick={() => setShowNFTSelector(true)}
                      variant="outline"
                    >
                      Change NFT
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedNFT.name}</h3>
                  <p className="text-white/60">{selectedNFT.description}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <Image className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <div className="text-white/60 mb-4">
                  Select an NFT from your collection
                </div>
                <Button
                  type="button"
                  onClick={() => setShowNFTSelector(true)}
                  variant="outline"
                >
                  Browse NFTs
                </Button>
              </div>
            )}
          </div>

          {/* Price Setting */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Set Price</h2>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="input w-full pl-12"
                required
                min="0"
                step="0.01"
                max="10000"
              />
            </div>
            <div className="text-sm text-white/60 mt-2">
              Amount the challenger needs to match (in USD)
            </div>
          </div>

          {/* Rounds Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Game Format</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRounds(FLIP_TYPES.THREE_ROUNDS)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  rounds === FLIP_TYPES.THREE_ROUNDS
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-center space-y-2">
                  <Coins className="w-8 h-8 text-primary mx-auto" />
                  <div className="text-lg font-semibold text-white">Best of 3</div>
                  <div className="text-sm text-white/60">Quick game • First to 2 wins</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setRounds(FLIP_TYPES.FIVE_ROUNDS)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  rounds === FLIP_TYPES.FIVE_ROUNDS
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-center space-y-2">
                  <Coins className="w-8 h-8 text-secondary mx-auto" />
                  <div className="text-lg font-semibold text-white">Best of 5</div>
                  <div className="text-sm text-white/60">Extended game • First to 3 wins</div>
                </div>
              </button>
            </div>
          </div>

          {/* Create Button */}
          <Button
            type="submit"
            disabled={!selectedNFT || !price || isCreating}
            loading={isCreating}
            size="lg"
            className="w-full"
          >
            Create Flip
          </Button>
        </form>

        {/* NFT Selector Modal */}
        <NFTSelector
          isOpen={showNFTSelector}
          onClose={() => setShowNFTSelector(false)}
          onSelect={handleSelectNFT}
          selectedNFT={selectedNFT}
        />
      </div>
    </Layout>
  );
};

export default CreateFlip; 