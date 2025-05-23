import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_NETWORK, SOLANA_RPC_URL } from '../utils/constants';

class SolanaService {
  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  async getConnection() {
    return this.connection;
  }

  async getBalance(publicKey) {
    try {
      const balance = await this.connection.getBalance(new PublicKey(publicKey));
      return balance / 1000000000; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async validateAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

export const solanaService = new SolanaService(); 