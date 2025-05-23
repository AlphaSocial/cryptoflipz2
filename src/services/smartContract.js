import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import idl from '../idl/crypto_flipz.json';

const PROGRAM_ID = new PublicKey('CryptoFlipzProgramID1111111111111111111111111');

class SmartContractService {
  constructor() {
    this.program = null;
    this.provider = null;
  }

  async initialize(wallet, connection) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(idl, PROGRAM_ID, this.provider);
  }

  async createFlip(nftMint, price, rounds) {
    if (!this.program || !this.provider.wallet.publicKey) {
      throw new Error('Wallet not connected or program not initialized');
    }

    const creator = this.provider.wallet.publicKey;
    const priceInLamports = new BN(price * web3.LAMPORTS_PER_SOL);

    // Derive flip PDA
    const [flipPDA, flipBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('flip'),
        creator.toBuffer(),
        new PublicKey(nftMint).toBuffer(),
      ],
      PROGRAM_ID
    );

    // Get token accounts
    const creatorNftAccount = await getAssociatedTokenAddress(
      new PublicKey(nftMint),
      creator
    );

    const escrowNftAccount = await getAssociatedTokenAddress(
      new PublicKey(nftMint),
      flipPDA,
      true
    );

    const tx = await this.program.methods
      .createFlip(priceInLamports, rounds, flipBump)
      .accounts({
        flip: flipPDA,
        creator: creator,
        nftMint: new PublicKey(nftMint),
        creatorNftAccount: creatorNftAccount,
        escrowNftAccount: escrowNftAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return {
      signature: tx,
      flipAddress: flipPDA.toString(),
    };
  }

  async joinFlip(flipAddress) {
    if (!this.program || !this.provider.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const challenger = this.provider.wallet.publicKey;
    const flipPDA = new PublicKey(flipAddress);

    // Get flip data to know the price
    const flipData = await this.program.account.flip.fetch(flipPDA);

    // Create escrow account for SOL
    const escrowAccount = web3.Keypair.generate();

    const tx = await this.program.methods
      .joinFlip()
      .accounts({
        flip: flipPDA,
        challenger: challenger,
        escrowAccount: escrowAccount.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([escrowAccount])
      .rpc();

    return { signature: tx };
  }

  async performFlip(flipAddress, powerLevel, round) {
    if (!this.program || !this.provider.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const player = this.provider.wallet.publicKey;
    const flipPDA = new PublicKey(flipAddress);

    const tx = await this.program.methods
      .performFlip(powerLevel, round)
      .accounts({
        flip: flipPDA,
        player: player,
      })
      .rpc();

    return { signature: tx };
  }

  async claimWinnings(flipAddress) {
    if (!this.program || !this.provider.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const winner = this.provider.wallet.publicKey;
    const flipPDA = new PublicKey(flipAddress);
    const flipData = await this.program.account.flip.fetch(flipPDA);

    const escrowNftAccount = await getAssociatedTokenAddress(
      flipData.nftMint,
      flipPDA,
      true
    );

    const winnerNftAccount = await getAssociatedTokenAddress(
      flipData.nftMint,
      winner
    );

    const tx = await this.program.methods
      .claimWinnings()
      .accounts({
        flip: flipPDA,
        winner: winner,
        escrowAccount: flipData.escrowAccount,
        escrowNftAccount: escrowNftAccount,
        winnerNftAccount: winnerNftAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return { signature: tx };
  }

  async getAllFlips() {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    const flips = await this.program.account.flip.all();
    return flips.map(flip => ({
      address: flip.publicKey.toString(),
      ...flip.account,
    }));
  }

  async getFlip(flipAddress) {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    const flipData = await this.program.account.flip.fetch(new PublicKey(flipAddress));
    return flipData;
  }

  // Listen to flip events
  addEventListener(eventType, callback) {
    if (!this.program) return;

    return this.program.addEventListener(eventType, callback);
  }

  removeEventListener(listenerId) {
    if (!this.program) return;
    
    this.program.removeEventListener(listenerId);
  }
}

export const smartContract = new SmartContractService(); 