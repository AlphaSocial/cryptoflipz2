import { Connection, PublicKey } from '@solana/web3.js';
import { solanaService } from './solana';

class NFTService {
  constructor() {
    this.connection = solanaService.connection;
  }

  async getUserNFTs(walletAddress) {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get all token accounts for the wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        }
      );

      const nfts = [];
      
      // Process token accounts to find NFTs (tokens with supply of 1)
      for (const account of tokenAccounts.value) {
        const tokenInfo = account.account.data.parsed.info;
        
        if (tokenInfo.tokenAmount.uiAmount === 1) {
          const nft = await this.getTokenMetadata(tokenInfo.mint);
          if (nft) {
            nfts.push({
              mint: tokenInfo.mint,
              address: account.pubkey.toBase58(),
              ...nft
            });
          }
        }
      }

      // Add demo NFTs for testing
      const demoNFTs = this.getDemoNFTs();
      return [...nfts, ...demoNFTs];
      
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      // Return demo NFTs as fallback
      return this.getDemoNFTs();
    }
  }

  async getTokenMetadata(mintAddress) {
    try {
      // In a real implementation, you would fetch metadata from Metaplex
      // For now, we'll return mock data
      return {
        name: `NFT ${mintAddress.slice(0, 8)}...`,
        image: `https://picsum.photos/400/400?random=${Math.random()}`,
        description: `Token: ${mintAddress}`,
        attributes: []
      };
    } catch (error) {
      console.error('Error getting token metadata:', error);
      return null;
    }
  }

  getDemoNFTs() {
    return [
      {
        mint: 'demo-mint-1',
        address: 'demo-address-1',
        name: 'Cool Ape #123',
        image: 'https://picsum.photos/400/400?random=1',
        description: 'A rare digital ape from the famous collection',
        attributes: [
          { trait_type: 'Background', value: 'Blue' },
          { trait_type: 'Eyes', value: 'Laser' }
        ]
      },
      {
        mint: 'demo-mint-2',
        address: 'demo-address-2',
        name: 'Pixel Punk #456',
        image: 'https://picsum.photos/400/400?random=2',
        description: 'Retro pixel art character with rare traits',
        attributes: [
          { trait_type: 'Type', value: 'Punk' },
          { trait_type: 'Rarity', value: 'Legendary' }
        ]
      },
      {
        mint: 'demo-mint-3',
        address: 'demo-address-3',
        name: 'Space Cat #789',
        image: 'https://picsum.photos/400/400?random=3',
        description: 'Cosmic feline explorer from distant galaxies',
        attributes: [
          { trait_type: 'Planet', value: 'Mars' },
          { trait_type: 'Suit', value: 'Silver' }
        ]
      },
      {
        mint: 'demo-mint-4',
        address: 'demo-address-4',
        name: 'Cyber Dragon #101',
        image: 'https://picsum.photos/400/400?random=4',
        description: 'Futuristic dragon with neon scales',
        attributes: [
          { trait_type: 'Element', value: 'Electric' },
          { trait_type: 'Power', value: '9000' }
        ]
      }
    ];
  }
}

export const nftService = new NFTService(); 