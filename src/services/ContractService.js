import { createPublicClient, createWalletClient, custom, http, decodeEventLog, formatEther, parseEther } from 'viem'
import { base, mainnet, bsc, avalanche, polygon } from 'viem/chains'
import { Alchemy } from 'alchemy-sdk'

// Constants
const CONTRACT_ADDRESS = "0xDA139B0285535dF163B8F59a98810af0F7655a61"
const API_URL = 'https://cryptoflipz2-production.up.railway.app'

// Common error definitions for better error handling
const COMMON_ERRORS = [
  {
    name: 'InsufficientListingFee',
    type: 'error',
    inputs: []
  },
  {
    name: 'InvalidNFTContract',
    type: 'error',
    inputs: []
  },
  {
    name: 'InvalidPriceFeed',
    type: 'error',
    inputs: []
  },
  {
    name: 'GameNotAvailable',
    type: 'error',
    inputs: []
  },
  {
    name: 'CannotJoinOwnGame',
    type: 'error',
    inputs: []
  },
  {
    name: 'GameAlreadyJoined',
    type: 'error',
    inputs: []
  },
  {
    name: 'InsufficientETH',
    type: 'error',
    inputs: []
  }
]

// Contract ABI (keeping your existing ABI)
const CONTRACT_ABI = [
  // Error definitions
  ...COMMON_ERRORS,
  // Events
  {
    name: 'GameCreated',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'gameId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'gameType', type: 'uint8' }
    ]
  },
  {
    name: 'GameJoined',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'gameId', type: 'uint256' },
      { indexed: true, name: 'joiner', type: 'address' }
    ]
  },
  {
    name: 'GameCompleted',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'gameId', type: 'uint256' },
      { indexed: true, name: 'winner', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ]
  },
  {
    name: 'GameCancelled',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'gameId', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ]
  },
  // Functions
  {
    name: 'createGame',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'priceUSD', type: 'uint256' },
      { name: 'acceptedToken', type: 'uint8' },
      { name: 'gameType', type: 'uint8' },
      { name: 'authInfo', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'joinGame',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'paymentToken', type: 'uint8' },
      { name: 'challengerNFTContract', type: 'address' },
      { name: 'challengerTokenId', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'completeGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'winner', type: 'address' }
    ],
    outputs: []
  },

  {
    name: 'cancelGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'completeGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'winner', type: 'address' }
    ],
    outputs: []
  },
  {
    name: 'withdrawRewards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'withdrawNFT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'nextGameId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'listingFeeUSD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'platformFeeReceiver',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'getPlatformFeeReceiver',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'getETHAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'usdAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'listingFeeUSD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'platformFeePercent',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getGameDetails',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [
      {
        name: 'game',
        type: 'tuple',
        components: [
          { name: 'gameId', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'joiner', type: 'address' },
          { name: 'nftContract', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'state', type: 'uint8' },
          { name: 'gameType', type: 'uint8' },
          { name: 'priceUSD', type: 'uint256' },
          { name: 'paymentToken', type: 'uint8' },
          { name: 'totalPaid', type: 'uint256' },
          { name: 'winner', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' }
        ]
      },
      {
        name: 'nftChallenge',
        type: 'tuple',
        components: [
          { name: 'challengerNFTContract', type: 'address' },
          { name: 'challengerTokenId', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'games',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'creator', type: 'address' },
      { name: 'joiner', type: 'address' },
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'state', type: 'uint8' },
      { name: 'gameType', type: 'uint8' },
      { name: 'priceUSD', type: 'uint256' },
      { name: 'paymentToken', type: 'uint8' },
      { name: 'totalPaid', type: 'uint256' },
      { name: 'winner', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'expiresAt', type: 'uint256' }
    ]
  },
  {
    name: 'nftChallenges',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [
      { name: 'challengerNFTContract', type: 'address' },
      { name: 'challengerTokenId', type: 'uint256' }
    ]
  },
  {
    name: 'unclaimedETH',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'address', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'unclaimedUSDC',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'address', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

// NFT ABI for approvals
const NFT_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'getApproved',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'address' }]
  }
]

// Alchemy API key
const ALCHEMY_API_KEY = 'hoaKpKFy40ibWtxftFZbJNUk5NQoL0R3'

// Chain configurations with Alchemy endpoints for better reliability
const CHAIN_CONFIGS = {
  base: {
    chain: base,
    contractAddress: '0xDA139B0285535dF163B8F59a98810af0F7655a61',
    rpcUrls: [
      `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, // Primary Alchemy endpoint
      'https://mainnet.base.org', // Secondary public endpoint
      'https://base.blockpi.network/v1/rpc/public' // Tertiary fallback
    ]
  },
  mainnet: {
    chain: mainnet,
    contractAddress: '0x0000000000000000000000000000000000000000', // Update with mainnet address
    rpcUrls: [
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      'https://cloudflare-eth.com',
      'https://eth.public-rpc.com'
    ]
  },
  polygon: {
    chain: polygon,
    contractAddress: '0x0000000000000000000000000000000000000000', // Update with polygon address
    rpcUrls: [
      `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network'
    ]
  },
  bsc: {
    chain: bsc,
    contractAddress: '0x0000000000000000000000000000000000000000', // Update with BSC address
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io'
    ]
  },
  avalanche: {
    chain: avalanche,
    contractAddress: '0x0000000000000000000000000000000000000000', // Update with Avalanche address
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche-c-chain.publicnode.com',
      'https://rpc.ankr.com/avalanche'
    ]
  }
}

class ContractService {
  constructor() {
    this.contract = null
    this.publicClient = null
    this.walletClient = null
    this.lastRequestTime = {} // FIX: Changed from number to object
    this.minRequestInterval = 1000 // 1 second between requests
    this.contractAddress = CONTRACT_ADDRESS
    this.contractABI = CONTRACT_ABI
    this.chainId = null
    this.alchemy = null
  }

  // Initialize contract with clients
  async initializeClients(chainId, walletClient) {
    console.log('🔧 Initializing contract service with:', {
      chainId,
      hasWalletClient: !!walletClient,
      walletClientType: typeof walletClient,
      walletClientKeys: walletClient ? Object.keys(walletClient) : 'null'
    })
    
    if (!walletClient) {
      throw new Error('Wallet client is required')
    }
    
    // Validate wallet client has required properties
    if (!walletClient.account || !walletClient.account.address) {
      console.error('❌ Wallet client validation failed:', {
        hasAccount: !!walletClient.account,
        accountKeys: walletClient.account ? Object.keys(walletClient.account) : 'null'
      })
      throw new Error('Wallet client is not properly initialized')
    }
    
    // For Base network, use the working contract address
    if (chainId === 8453) {
      this.contractAddress = CONTRACT_ADDRESS
    } else {
      throw new Error(`Unsupported chain: ${chainId}`)
    }

    this.chainId = chainId
    this.walletClient = walletClient

    // Create public client for Base using Alchemy with fallbacks
    this.publicClient = createPublicClient({
      chain: base,
      transport: http('https://base-mainnet.g.alchemy.com/v2/hoaKpKFy40ibWtxftFZbJNUk5NQoL0R3', {
        retryCount: 3,
        retryDelay: 1000
      })
    })

    console.log('✅ Contract service initialized with working pattern', {
      contractAddress: this.contractAddress,
      chainId: this.chainId,
      walletAddress: this.walletClient.account.address
    })

    // Initialize Alchemy
    this.alchemy = new Alchemy({ 
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || 'hoaKpKFy40ibWtxftFZbJNUk5NQoL0R3',
      network: 'base-mainnet'
    })
  }

  // Get current clients
  getCurrentClients() {
    console.log('🔍 ContractService state check:', {
      hasWalletClient: !!this.walletClient,
      hasPublicClient: !!this.publicClient,
      walletClientType: typeof this.walletClient,
      walletClientKeys: this.walletClient ? Object.keys(this.walletClient) : 'null',
      hasAccount: !!this.walletClient?.account,
      accountKeys: this.walletClient?.account ? Object.keys(this.walletClient.account) : 'null',
      accountAddress: this.walletClient?.account?.address
    })
    
    if (!this.walletClient) {
      throw new Error('Wallet client not available. Please connect your wallet.')
    }
    
    // Additional validation to ensure wallet client is properly initialized
    if (!this.walletClient.account || !this.walletClient.account.address) {
      console.error('❌ Wallet client account validation failed:', {
        hasAccount: !!this.walletClient.account,
        accountType: typeof this.walletClient.account,
        accountKeys: this.walletClient.account ? Object.keys(this.walletClient.account) : 'null',
        accountAddress: this.walletClient.account?.address
      })
      throw new Error('Wallet client is not properly initialized. Please reconnect your wallet.')
    }
    
    return {
      walletClient: this.walletClient,
      public: this.publicClient
    }
  }

  // Check if service is initialized
  isInitialized() {
    const hasWalletClient = !!this.walletClient
    const hasPublicClient = !!this.publicClient
    const hasValidAccount = this.walletClient?.account?.address
    
    console.log('🔍 Service initialization check:', {
      hasWalletClient,
      hasPublicClient,
      hasValidAccount,
      walletAddress: this.walletClient?.account?.address
    })
    
    return hasWalletClient && hasPublicClient && hasValidAccount
  }

  // Get current chain
  get currentChain() {
    return this.chainId
  }

  // Refresh wallet client (call this if wallet client becomes stale)
  async refreshWalletClient(newWalletClient) {
    if (!newWalletClient || !newWalletClient.account || !newWalletClient.account.address) {
      throw new Error('Invalid wallet client provided for refresh')
    }
    
    console.log('🔄 Refreshing wallet client:', {
      oldAddress: this.walletClient?.account?.address,
      newAddress: newWalletClient.account.address
    })
    
    this.walletClient = newWalletClient
    
    console.log('✅ Wallet client refreshed successfully')
  }

  // Rate limit protection with exponential backoff - FIXED
  async rateLimit(key) {
    const now = Date.now()
    const lastRequest = this.lastRequestTime[key] || 0
    const timeSinceLastRequest = now - lastRequest
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before ${key}`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime[key] = Date.now()
  }

  // Retry with exponential backoff
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
          console.log(`⚠️ Rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${i + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          throw error
        }
      }
    }
    
    throw lastError
  }

  // Create a new game
  async createGame(params) {
    try {
      console.log('🎮 Creating game with params:', params)
      
      if (!this.isInitialized()) {
        throw new Error('Contract service not initialized. Please connect your wallet.')
      }

      // Get the next game ID before creating the game
      const nextGameId = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.contractABI,
        functionName: 'nextGameId'
      })
      
      console.log('📊 Next game ID:', nextGameId.toString())

      // Get listing fee from contract
      const listingFeeUSD = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.contractABI,
        functionName: 'listingFeeUSD'
      })

      console.log('💵 Listing fee from contract:', listingFeeUSD.toString(), '(in 6 decimals)')

      // Get ETH amount for listing fee from contract
      let listingFeeETH
      try {
        listingFeeETH = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.contractABI,
          functionName: 'getETHAmount',
          args: [listingFeeUSD]
        })
        console.log('💵 Listing fee in ETH from contract:', formatEther(listingFeeETH))
      } catch (error) {
        console.warn('⚠️ Contract getETHAmount failed, using fallback calculation:', error)
        // Fallback for local testing - use a fixed ETH price
        const ethPrice = 3000 // $3000 per ETH
        const listingFeeUSDDecimal = Number(listingFeeUSD) / 1000000 // Convert from 6 decimals
        const listingFeeInEth = listingFeeUSDDecimal / ethPrice
        // Convert to Wei ensuring no decimals by using parseEther
        listingFeeETH = parseEther(listingFeeInEth.toFixed(18))
        console.log('💵 Fallback listing fee:', formatEther(listingFeeETH), 'ETH')
      }

      // Check user's ETH balance
      const balance = await this.publicClient.getBalance({
        address: this.walletClient.account.address
      })
      
      console.log('💰 User ETH balance:', formatEther(balance))
      console.log('💵 Required listing fee:', formatEther(listingFeeETH))
      
      if (balance < listingFeeETH) {
        throw new Error(`Insufficient ETH balance. You have ${formatEther(balance)} ETH but need ${formatEther(listingFeeETH)} ETH for the listing fee.`)
      }

      // Check NFT approval before creating game
      console.log('🔍 Checking NFT approval...')
      const currentApproval = await this.publicClient.readContract({
        address: params.nftContract,
        abi: NFT_ABI,
        functionName: 'getApproved',
        args: [BigInt(params.tokenId)]
      })

      if (currentApproval?.toLowerCase() !== this.contractAddress.toLowerCase()) {
        throw new Error('NFT is not approved for the contract. Please approve the NFT first.')
      }

      // Prepare game creation parameters
      const gameParams = {
        nftContract: params.nftContract,
        tokenId: BigInt(params.tokenId),
        priceUSD: BigInt(Math.floor(params.priceUSD * 1000000)), // Convert to 6 decimals
        acceptedToken: params.acceptedToken || 0,
        gameType: params.gameType || 0,
        authInfo: JSON.stringify({
          creator: this.walletClient.account.address,
          coinDesign: params.coin || null,
          timestamp: new Date().toISOString()
        })
      }

      console.log('📝 Formatted game params:', gameParams)
      console.log('💰 Sending ETH value:', formatEther(listingFeeETH))

      // Simulate the transaction first
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: this.contractABI,
        functionName: 'createGame',
        args: [
          gameParams.nftContract,
          gameParams.tokenId,
          gameParams.priceUSD,
          gameParams.acceptedToken,
          gameParams.gameType,
          gameParams.authInfo
        ],
        account: this.walletClient.account,
        value: listingFeeETH // This is now guaranteed to be a BigInt
      })

      // Execute the transaction
      const hash = await this.walletClient.writeContract(request)
      
      console.log('🎯 Game creation transaction sent:', hash)

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 1 
      })

      console.log('✅ Game creation confirmed:', receipt)

      // The game ID is the nextGameId we read before creating the game
      const gameId = nextGameId.toString()
      
      console.log('🎮 Game created with ID:', gameId)

      // Save to database
      const API_URL = 'https://cryptoflipz2-production.up.railway.app'
      const dbParams = {
        id: gameId,
        contract_game_id: gameId,
        creator: this.walletClient.account.address,
        nft_contract: params.nftContract,
        nft_token_id: params.tokenId.toString(),
        price_usd: params.priceUSD,
        game_type: params.gameType === 1 ? 'nft-vs-nft' : 'nft-vs-crypto',
        coin: params.coin,
        transaction_hash: hash,
        nft_chain: this.currentChain || 'base',
        listing_fee_usd: Number(listingFeeUSD) / 1000000
      }

      const response = await fetch(`${API_URL}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbParams)
      })

      if (!response.ok) {
        console.warn('Failed to save game to database:', await response.text())
      } else {
        console.log('✅ Game saved to database')
      }

      return {
        success: true,
        gameId,
        transactionHash: hash,
        receipt
      }

    } catch (error) {
      console.error('❌ Error creating game:', error)
      
      // Better error messages
      let errorMessage = error.message || 'Failed to create game'
      
      if (error.message.includes('Invalid price feed')) {
        errorMessage = 'The price feed is not available. This often happens on localhost. Please try on a testnet or mainnet.'
      } else if (error.message.includes('Insufficient listing fee')) {
        errorMessage = 'Insufficient ETH sent for listing fee. This usually means the price feed is not working correctly.'
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Approve NFT
  async approveNFT(nftContract, tokenId) {
    try {
      await this.rateLimit('approveNFT')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      const account = walletClient.account.address

      // Check if already approved
      const currentApproval = await this.retryWithBackoff(async () => {
        await this.rateLimit('checkApproval')
        return await publicClient.readContract({
          address: nftContract,
          abi: NFT_ABI,
          functionName: 'getApproved',
          args: [BigInt(tokenId)]
        })
      })

      if (currentApproval?.toLowerCase() === this.contractAddress.toLowerCase()) {
        console.log('✅ NFT already approved')
        return { success: true, alreadyApproved: true }
      }

      // Check ownership
      const owner = await this.retryWithBackoff(async () => {
        await this.rateLimit('checkOwnership')
        return await publicClient.readContract({
          address: nftContract,
          abi: NFT_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)]
        })
      })

      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error(`You don't own this NFT. Owner: ${owner}, Your address: ${account}`)
      }

      // Estimate gas for approval
      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateApprovalGas')
        return await publicClient.estimateContractGas({
          address: nftContract,
          abi: NFT_ABI,
          functionName: 'approve',
          args: [this.contractAddress, BigInt(tokenId)],
          account
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      // Approve NFT
      console.log('🔐 Approving NFT...')
      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('approveTx')
        return await walletClient.writeContract({
          address: nftContract,
          abi: NFT_ABI,
          functionName: 'approve',
          args: [this.contractAddress, BigInt(tokenId)],
          account,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 1
      })

      console.log('✅ NFT approved successfully')
      return {
        success: true,
        transactionHash: hash,
        receipt
      }
    } catch (error) {
      console.error('Error approving NFT:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get game details
  async getGameDetails(gameId) {
    try {
      await this.rateLimit('getGameDetails')
      
      const { public: publicClient } = this.getCurrentClients()

      const result = await this.retryWithBackoff(async () => {
        return await publicClient.readContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'getGameDetails',
          args: [BigInt(gameId)]
        })
      })

      // Convert price from 6 decimals (e.g., 400000 = $0.40)
      const priceUSDInDecimals = Number(result[0].priceUSD)
      const actualPriceUSD = priceUSDInDecimals / 1000000 // Convert from 6 decimals
      
      // Get the ETH amount for the game price
      const ethAmount = await this.getETHAmount(actualPriceUSD)
      
      return {
        success: true,
        data: {
          game: result[0],
          nftChallenge: result[1],
          payment: {
            priceUSD: actualPriceUSD,
            priceETH: ethAmount.ethAmount
          }
        }
      }
    } catch (error) {
      console.error('Error getting game details:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Join game
  async joinGame(params) {
    try {
      console.log('🎮 Joining game with params:', params)
      
      if (!this.isInitialized()) {
        throw new Error('Contract service not initialized. Please connect your wallet.')
      }

      // Get game details first
      const gameDetails = await this.getGameDetails(params.gameId)
      if (!gameDetails.success) {
        throw new Error('Failed to get game details: ' + gameDetails.error)
      }

      // Use the actual price from the game details
      const priceInWei = parseEther(gameDetails.data.payment.priceETH)
      
      console.log('💰 Game price from contract:', gameDetails.data.payment.priceUSD, 'USD')
      console.log('💰 Price in ETH:', gameDetails.data.payment.priceETH, 'ETH')
      console.log('💰 Price in Wei:', priceInWei.toString())

      // Simulate the transaction with payment
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: this.contractABI,
        functionName: 'joinGame',
        args: [
          BigInt(params.gameId),
          0, // paymentToken (0 = ETH)
          '0x0000000000000000000000000000000000000000', // challengerNFTContract (none)
          0 // challengerTokenId (none)
        ],
        value: priceInWei,
        account: this.walletClient.account
      })

      // Execute the transaction
      const hash = await this.walletClient.writeContract(request)
      
      console.log('🎯 Join game transaction sent:', hash)

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 1 
      })

      console.log('✅ Join game confirmed:', receipt)

      // Update database
      try {
        const API_URL = 'https://cryptoflipz2-production.up.railway.app'
        const response = await fetch(`${API_URL}/api/games/${params.gameId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            joinerAddress: this.walletClient.account.address,
            paymentTxHash: hash,
            paymentAmount: gameDetails.data.payment.priceUSD
          })
        })

        if (!response.ok) {
          console.warn('Failed to update database after join:', await response.text())
        }
      } catch (dbError) {
        console.error('Database update error:', dbError)
      }

      return {
        success: true,
        transactionHash: hash,
        receipt
      }

  } catch (error) {
    console.error('❌ Error joining game:', error)
    
    // Better error handling
    let errorMessage = error.message || 'Failed to join game'
    
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds to join game'
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction cancelled'
    } else if (error.message.includes('already joined')) {
      errorMessage = 'This game already has a second player'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
  }

  // Get optimized gas prices for Base
  async getGasPrices() {
    try {
      const { public: publicClient } = this.getCurrentClients()
      
      // Get current gas prices from the network
      const block = await publicClient.getBlock({ blockTag: 'latest' })
      const baseFee = block.baseFeePerGas || 0n
      
      // Base network typically has low gas prices
      // Set minimum values to ensure transaction goes through
      const minBaseFee = 100000000n // 0.1 gwei
      const minPriorityFee = 100000000n // 0.1 gwei
      
      // Calculate max fees with some buffer
      const maxPriorityFeePerGas = minPriorityFee
      const maxFeePerGas = (baseFee * 2n) + maxPriorityFeePerGas
      
      // Ensure minimum values
      const finalMaxFee = maxFeePerGas > minBaseFee ? maxFeePerGas : minBaseFee
      const finalPriorityFee = maxPriorityFeePerGas > minPriorityFee ? maxPriorityFeePerGas : minPriorityFee
      
      console.log('⛽ Gas prices:', {
        baseFee: baseFee.toString(),
        maxFeePerGas: finalMaxFee.toString(),
        maxPriorityFeePerGas: finalPriorityFee.toString()
      })
      
      return {
        maxFeePerGas: finalMaxFee,
        maxPriorityFeePerGas: finalPriorityFee
      }
    } catch (error) {
      console.error('Error getting gas prices:', error)
      // Return default values on error
      return {
        maxFeePerGas: 1000000000n, // 1 gwei
        maxPriorityFeePerGas: 100000000n // 0.1 gwei
      }
    }
  }

  // Get current ETH price from server
  async getCurrentEthPrice() {
    // For localhost testing, use a reasonable ETH price
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🏠 Localhost detected, using ETH price: $3000')
      return 3000
    }
    
    try {
      const response = await fetch('https://cryptoflipz2-production.up.railway.app/api/eth-price')
      const data = await response.json()
      return data.price || 3000 // fallback to $3000
    } catch (error) {
      console.error('Error getting ETH price:', error)
      return 3000 // fallback
    }
  }

  // Convert USD to ETH using current price
  async convertUSDToETH(priceUSD) {
    const ethPrice = await this.getCurrentEthPrice()
    return priceUSD / ethPrice
  }

  // Get ETH amount for USD price
  async getETHAmount(priceUSD) {
    try {
      if (!this.publicClient || !this.contractAddress) {
        throw new Error('Contract service not initialized')
      }

      // Convert USD to 6 decimals as expected by contract
      const usdAmount = BigInt(Math.floor(priceUSD * 1000000))
      
      try {
        // Try to get from contract first
        const ethAmount = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.contractABI,
          functionName: 'getETHAmount',
          args: [usdAmount]
        })
        
        return {
          success: true,
          ethAmount: formatEther(ethAmount),
          ethAmountWei: ethAmount
        }
      } catch (contractError) {
        console.warn('⚠️ Contract getETHAmount failed:', contractError)
        
        // Fallback calculation for local testing
        const ethPrice = 3000 // Fixed price for testing
        const ethAmount = priceUSD / ethPrice
        const ethAmountWei = parseEther(ethAmount.toFixed(18))
        
        return {
          success: true,
          ethAmount: formatEther(ethAmountWei),
          ethAmountWei: ethAmountWei,
          fallback: true
        }
      }
    } catch (error) {
      console.error('Error getting ETH amount:', error)
      throw error
    }
  }



  // Get NFT metadata (helper function)
  async getNFTMetadata(nftContract, tokenId) {
    try {
      console.log(`🔍 Fetching metadata for ${nftContract}:${tokenId}`)
      
      // Try to get metadata from Alchemy first
      if (this.alchemy) {
        try {
          const nft = await this.alchemy.nft.getNftMetadata(nftContract, tokenId.toString())
          console.log(`✅ Alchemy metadata for ${nftContract}:${tokenId}:`, nft)
          console.log(`🔍 Alchemy media array:`, nft.media)
          console.log(`🔍 Alchemy raw metadata:`, nft.rawMetadata)
          
          // Try multiple image sources from Alchemy response
          let imageUrl = ''
          if (nft.media && nft.media.length > 0) {
            imageUrl = nft.media[0].gateway || nft.media[0].raw || nft.media[0].thumbnail || ''
          }
          
          // Fallback to raw metadata if media is empty
          if (!imageUrl && nft.rawMetadata) {
            imageUrl = nft.rawMetadata.image || nft.rawMetadata.image_url || nft.rawMetadata.imageUrl || ''
          }
          
          return {
            name: nft.title || nft.name || `NFT #${tokenId}`,
            image: imageUrl,
            description: nft.description || '',
            attributes: nft.rawMetadata?.attributes || []
          }
        } catch (alchemyError) {
          console.warn(`Alchemy failed for ${nftContract}:${tokenId}:`, alchemyError)
        }
      }
      
      // Fallback: Try direct contract calls
      const { public: publicClient } = this.getCurrentClients()
      
      try {
        // Try to get tokenURI
        const tokenURI = await publicClient.readContract({
          address: nftContract,
          abi: [
            {
              inputs: [{ name: 'tokenId', type: 'uint256' }],
              name: 'tokenURI',
              outputs: [{ name: '', type: 'string' }],
              stateMutability: 'view',
              type: 'function'
            }
          ],
          functionName: 'tokenURI',
          args: [BigInt(tokenId)]
        })
        
        console.log(`📋 TokenURI for ${nftContract}:${tokenId}:`, tokenURI)
        
        if (tokenURI && tokenURI !== '') {
          // Fetch metadata from URI
          const response = await fetch(tokenURI)
          const metadata = await response.json()
          
          console.log(`📊 Raw metadata for ${nftContract}:${tokenId}:`, metadata)
          
          // Handle different image field formats and IPFS URLs
          let imageUrl = metadata.image || metadata.image_url || metadata.imageUrl || ''
          
          // Convert IPFS URLs to gateway URLs if needed
          if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
          }
          
          return {
            name: metadata.name || metadata.title || `NFT #${tokenId}`,
            image: imageUrl,
            description: metadata.description || '',
            attributes: metadata.attributes || []
          }
        }
      } catch (contractError) {
        console.warn(`Contract call failed for ${nftContract}:${tokenId}:`, contractError)
      }
      
      // Final fallback
      console.log(`⚠️ Using fallback metadata for ${nftContract}:${tokenId}`)
      return {
        name: `NFT #${tokenId}`,
        image: '',
        description: 'Metadata not available',
        attributes: []
      }
      
    } catch (error) {
      console.error(`❌ Error fetching NFT metadata for ${nftContract}:${tokenId}:`, error)
      return {
        name: `NFT #${tokenId}`,
        image: '',
        description: 'Error loading metadata',
        attributes: []
      }
    }
  }

  // Get game (for FlipGame component)
  async getGame(gameId) {
    try {
      const result = await this.getGameDetails(gameId)
      return {
        success: result.success,
        game: result.data?.game
      }
    } catch (error) {
      console.error('Error getting game:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Complete game
  async completeGame(gameId, winner) {
    try {
      await this.rateLimit('completeGame')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }

      console.log('🏆 Completing game:', { gameId, winner })

      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateCompleteGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'completeGame',
          args: [BigInt(gameId), winner],
          account: walletClient.account.address
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('completeGameTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'completeGame',
          args: [BigInt(gameId), winner],
          account: walletClient.account.address,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })
      
      return {
        success: true,
        transactionHash: hash,
        receipt
      }
    } catch (error) {
      console.error('Error completing game:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }



  // Cancel game
  async cancelGame(gameId) {
    try {
      await this.rateLimit('cancelGame')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }

      console.log('❌ Cancelling game:', gameId)

      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateCancelGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'cancelGame',
          args: [BigInt(gameId)],
          account: walletClient.account.address
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('cancelGameTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'cancelGame',
          args: [BigInt(gameId)],
          account: walletClient.account.address,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })
      
      return {
        success: true,
        transactionHash: hash
      }
    } catch (error) {
      console.error('Error cancelling game:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Check unclaimed rewards
  async getUnclaimedRewards(address) {
    try {
      await this.rateLimit('getUnclaimedRewards')
      
      const { public: publicClient } = this.getCurrentClients()

      const [unclaimedETH, unclaimedUSDC] = await this.retryWithBackoff(async () => {
        await this.rateLimit('unclaimedETH')
        const eth = await publicClient.readContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'unclaimedETH',
          args: [address]
        })
        
        await this.rateLimit('unclaimedUSDC')
        const usdc = await publicClient.readContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'unclaimedUSDC',
          args: [address]
        })
        
        return [eth, usdc]
      })

      return {
        success: true,
        eth: formatEther(unclaimedETH),
        usdc: Number(unclaimedUSDC) / 1000000, // Convert from 6 decimals
        hasRewards: unclaimedETH > 0n || unclaimedUSDC > 0n
      }
    } catch (error) {
      console.error('Error checking unclaimed rewards:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Withdraw rewards
  async withdrawRewards() {
    try {
      await this.rateLimit('withdrawRewards')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }
      
      const account = walletClient.account.address

      console.log('🏆 Withdrawing rewards...')
      
      // Estimate gas
      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateWithdrawGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'withdrawRewards',
          account
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('withdrawTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'withdrawRewards',
          account,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })

      return {
        success: true,
        transactionHash: hash,
        receipt
      }
    } catch (error) {
      console.error('Error withdrawing rewards:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Withdraw platform fees (for platform fee receiver only)
  async withdrawPlatformFees() {
    try {
      await this.rateLimit('withdrawPlatformFees')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }
      
      const account = walletClient.account.address

      // Check if caller is platform fee receiver
      const feeReceiver = await this.retryWithBackoff(async () => {
        await this.rateLimit('getPlatformFeeReceiver')
        return await publicClient.readContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'platformFeeReceiver'
        })
      })
      
      if (account.toLowerCase() !== feeReceiver.toLowerCase()) {
        throw new Error('Only platform fee receiver can withdraw fees')
      }

      console.log('💰 Withdrawing platform fees...')
      
      // Call withdrawRewards to get accumulated fees
      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateWithdrawPlatformFeesGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'withdrawRewards',
          account
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('withdrawPlatformFeesTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'withdrawRewards',
          account,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })

      return {
        success: true,
        transactionHash: hash,
        receipt
      }
    } catch (error) {
      console.error('Error withdrawing platform fees:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get user's active games
  async getUserActiveGames(address) {
    try {
      console.log('📊 Getting active games for:', address)
      return {
        success: true,
        games: [] // Return empty array to prevent "not iterable" error
      }
    } catch (error) {
      console.error('Error getting user games:', error)
      return {
        success: false,
        error: error.message,
        games: []
      }
    }
  }

  // Update platform fee
  async updatePlatformFee(newFeePercent) {
    try {
      await this.rateLimit('updatePlatformFee')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }

      console.log('💰 Updating platform fee to:', newFeePercent, 'basis points')

      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateUpdatePlatformFeeGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'setPlatformFee',
          args: [BigInt(newFeePercent)],
          account: walletClient.account.address
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('updatePlatformFeeTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'setPlatformFee',
          args: [BigInt(newFeePercent)],
          account: walletClient.account.address,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })

      return {
        success: true,
        transactionHash: hash,
        receipt
      }
    } catch (error) {
      console.error('Error updating platform fee:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update listing fee
  async updateListingFee(newFeeUSD) {
    try {
      await this.rateLimit('updateListingFee')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }

      console.log('💰 Updating listing fee to:', newFeeUSD, 'USD (6 decimals)')

      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateUpdateListingFeeGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'setListingFee',
          args: [BigInt(newFeeUSD)],
          account: walletClient.account.address
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('updateListingFeeTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'setListingFee',
          args: [BigInt(newFeeUSD)],
          account: walletClient.account.address,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })

      return {
        success: true,
        transactionHash: hash,
        receipt
      }
    } catch (error) {
      console.error('Error updating listing fee:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get listing fee from contract
  async getListingFee() {
    try {
      if (!this.isInitialized()) {
        throw new Error('Contract service not initialized. Please connect your wallet.')
      }

      const listingFeeUSD = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.contractABI,
        functionName: 'listingFeeUSD'
      })

      // Try to get the ETH equivalent
      let listingFeeETH = null
      let ethError = null
      
      try {
        listingFeeETH = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.contractABI,
          functionName: 'getETHAmount',
          args: [listingFeeUSD]
        })
      } catch (error) {
        ethError = error.message
        console.warn('⚠️ Could not get ETH equivalent, using fallback:', error.message)
        
        // Fallback calculation
        const ethPrice = 3000
        const listingFeeUSDDecimal = Number(listingFeeUSD) / 1000000
        const listingFeeInEth = listingFeeUSDDecimal / ethPrice
        listingFeeETH = parseEther(listingFeeInEth.toFixed(18))
      }

      return {
        success: true,
        listingFeeUSD: listingFeeUSD.toString(),
        listingFeeUSDDecimal: Number(listingFeeUSD) / 1000000,
        listingFeeETH: listingFeeETH,
        listingFeeETHFormatted: formatEther(listingFeeETH),
        ethError
      }
    } catch (error) {
      console.error('❌ Error getting listing fee:', error)
      return {
        success: false,
        error: error.message || 'Failed to get listing fee'
      }
    }
  }

  // Get platform fee from contract
  async getPlatformFee() {
    try {
      if (!this.publicClient || !this.contractAddress) {
        throw new Error('Contract service not initialized')
      }

      const feePercent = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.contractABI,
        functionName: 'platformFeePercent'
      })

      // Convert from basis points (e.g., 350 = 3.5%)
      const feePercentage = Number(feePercent) / 100
      
      return {
        success: true,
        feePercent: Number(feePercent),
        feePercentage
      }
    } catch (error) {
      console.error('❌ Error getting platform fee:', error)
      return {
        success: false,
        error: error.message,
        feePercent: 350, // Default to 3.5%
        feePercentage: 3.5
      }
    }
  }



  // Debug method to test contract connectivity
  async debugContract() {
    try {
      if (!this.isInitialized()) {
        return {
          success: false,
          error: 'Contract service not initialized'
        }
      }

      const results = {}

      // Test 1: Get listing fee USD
      try {
        const listingFeeUSD = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.contractABI,
          functionName: 'listingFeeUSD'
        })
        results.listingFeeUSD = listingFeeUSD.toString()
        results.listingFeeUSDDecimal = Number(listingFeeUSD) / 1000000
      } catch (error) {
        results.listingFeeUSDError = error.message
      }

      // Test 2: Get ETH amount (price feed)
      try {
        const testUSD = 200000n // $0.20
        const ethAmount = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.contractABI,
          functionName: 'getETHAmount',
          args: [testUSD]
        })
        results.ethAmount = formatEther(ethAmount)
        results.priceFeedWorking = true
      } catch (error) {
        results.priceFeedError = error.message
        results.priceFeedWorking = false
      }

      // Test 3: Get user balance
      try {
        const balance = await this.publicClient.getBalance({
          address: this.walletClient.account.address
        })
        results.userBalance = formatEther(balance)
      } catch (error) {
        results.balanceError = error.message
      }

      // Test 4: Get next game ID
      try {
        const nextGameId = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: this.contractABI,
          functionName: 'nextGameId'
        })
        results.nextGameId = nextGameId.toString()
      } catch (error) {
        results.nextGameIdError = error.message
      }

      return {
        success: true,
        results,
        isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Withdraw NFT
  async withdrawNFT(nftContract, tokenId) {
    try {
      await this.rateLimit('withdrawNFT')
      
      const { walletClient, public: publicClient } = this.getCurrentClients()
      
      if (!walletClient) {
        throw new Error('Wallet client not available. Please connect your wallet.')
      }

      console.log('🏆 Withdrawing NFT:', { nftContract, tokenId })

      const gasEstimate = await this.retryWithBackoff(async () => {
        await this.rateLimit('estimateWithdrawNFTGas')
        return await publicClient.estimateContractGas({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'withdrawNFT',
          args: [nftContract, BigInt(tokenId)],
          account: walletClient.account.address
        })
      })

      const gasLimit = gasEstimate * 120n / 100n
      const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrices()

      const hash = await this.retryWithBackoff(async () => {
        await this.rateLimit('withdrawNFTTx')
        return await walletClient.writeContract({
          address: this.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'withdrawNFT',
          args: [nftContract, BigInt(tokenId)],
          account: walletClient.account.address,
          gas: gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas
        })
      })

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 2
      })
      
      return {
        success: true,
        transactionHash: hash
      }
    } catch (error) {
      console.error('Error withdrawing NFT:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default new ContractService() 