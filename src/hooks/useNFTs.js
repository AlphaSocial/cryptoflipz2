import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { nftService } from '../services/nft';

export const useNFTs = () => {
  const { publicKey, connected } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNfts = async () => {
    if (!connected || !publicKey) {
      setNfts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userNfts = await nftService.getUserNFTs(publicKey.toString());
      setNfts(userNfts);
    } catch (err) {
      setError(err.message);
      console.error('Error loading NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNfts();
  }, [connected, publicKey]);

  return {
    nfts,
    loading,
    error,
    refetch: loadNfts
  };
}; 