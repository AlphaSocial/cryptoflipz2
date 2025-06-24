import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Calendar, Activity, DollarSign, Users, Shield, Settings, Search, ChevronDown, ChevronUp, Wallet, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw, Send, Eye, User, Coins, Image, BarChart3, Gamepad2, Crown, Zap } from 'lucide-react'
import styled from '@emotion/styled'

// Contract ABI (simplified - you'll need to add the full ABI)
const CONTRACT_ABI = [
  "function setPlatformFeePercent(uint256 _newPercent)",
  "function setListingFee(uint256 _newFeeUSD)",
  "function emergencyWithdrawNFT(address nftContract, uint256 tokenId, address to)",
  "function emergencyWithdrawETH(address to, uint256 amount)",
  "function emergencyWithdrawToken(address token, address to, uint256 amount)",
  "function platformFeePercent() view returns (uint256)",
  "function listingFeeUSD() view returns (uint256)",
  "function getGameDetails(uint256 gameId) view returns (tuple(uint256 gameId, address creator, address joiner, address nftContract, uint256 tokenId, uint8 state, uint8 gameType, uint8 creatorRole, uint8 joinerRole, uint8 joinerChoice), tuple(uint256 priceUSD, uint8 acceptedToken, uint256 totalPaid, uint8 paymentTokenUsed, uint256 listingFeePaid, uint256 platformFeeCollected), tuple(uint256 createdAt, uint256 expiresAt, uint8 maxRounds, uint8 currentRound, uint8 creatorWins, uint8 joinerWins, address winner, uint256 lastActionTime, uint256 countdownEndTime))",
  "function unclaimedETH(address) view returns (uint256)",
  "function unclaimedUSDC(address) view returns (uint256)",
  "function getUserUnclaimedNFTs(address user, address nftContract) view returns (uint256[])"
]

// Contract addresses for different chains
const CONTRACT_ADDRESSES = {
  'base': '0xBFD8912ded5830e43E008CCCEA822A6B0174C480', // Base contract address
  'ethereum': '0x...',
  'bnb': '0x...',
  'avalanche': '0x...',
  'polygon': '0x...'
}

// Chain configurations
const CHAIN_CONFIGS = {
  'base': { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org', symbol: 'ETH', color: '#0052FF' },
  'ethereum': { id: 1, name: 'Ethereum', rpc: 'https://eth.llamarpc.com', symbol: 'ETH', color: '#627EEA' },
  'bnb': { id: 56, name: 'BNB Chain', rpc: 'https://bsc-dataseed.binance.org/', symbol: 'BNB', color: '#F3BA2F' },
  'avalanche': { id: 43114, name: 'Avalanche', rpc: 'https://api.avax.network/ext/bc/C/rpc', symbol: 'AVAX', color: '#E84142' },
  'polygon': { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com/', symbol: 'MATIC', color: '#8247E5' }
}

// Admin wallet address (update this)
const ADMIN_WALLET = '0x93277281Fd256D0601Ce86Cdb1D5c00a97b59839' // Admin wallet address

// Styled Components
const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%);
  color: #ffffff;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
  border-radius: 20px;
  border: 1px solid rgba(0, 255, 65, 0.2);
  backdrop-filter: blur(10px);
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00FF41 0%, #FF6B35 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #00FF41 0%, #39FF14 100%);
  color: #000;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 65, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 65, 0.4);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
`

const Tab = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #00FF41 0%, #39FF14 100%)' : 'transparent'};
  color: ${props => props.active ? '#000' : '#fff'};
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #00FF41 0%, #39FF14 100%)' : 'rgba(0, 255, 65, 0.1)'};
  }
`

const ContentArea = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 255, 65, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 255, 65, 0.2);
  }
`

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00FF41 0%, #39FF14 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #00FF41;
`

const StatLabel = styled.div`
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`

const SearchInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  color: #fff;
  font-size: 1rem;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    outline: none;
    border-color: #00FF41;
    box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.2);
  }
`

const GameCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
`

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const GameStatus = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch(props.status) {
      case 'active': return 'linear-gradient(135deg, #00FF41 0%, #39FF14 100%)';
      case 'completed': return 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)';
      case 'cancelled': return 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  color: ${props => props.status === 'active' || props.status === 'completed' ? '#000' : '#fff'};
`

const SettingsForm = styled.form`
  display: grid;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 600;
  color: #ccc;
`

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #00FF41;
  }
`

const Button = styled.button`
  background: linear-gradient(135deg, #00FF41 0%, #39FF14 100%);
  color: #000;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 255, 65, 0.3);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`

const Notification = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  
  ${props => props.type === 'success' && `
    background: linear-gradient(135deg, #00FF41 0%, #39FF14 100%);
    color: #000;
  `}
  
  ${props => props.type === 'error' && `
    background: linear-gradient(135deg, #FF4444 0%, #CC0000 100%);
  `}
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`

export default function AdminPanel() {
  // State
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChain, setSelectedChain] = useState('base')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Contract state
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  
  // Data state
  const [stats, setStats] = useState({
    totalGames: 0,
    activeGames: 0,
    totalVolume: 0,
    platformFees: 0,
    monthlyFees: 0,
    totalNFTsInContract: 0,
    totalETHInContract: 0,
    totalUSDCInContract: 0
  })
  
  const [games, setGames] = useState([])
  const [filteredGames, setFilteredGames] = useState([])
  const [players, setPlayers] = useState([])
  const [settings, setSettings] = useState({
    platformFeePercent: 3.5,
    listingFeeUSD: 0.20
  })
  
  const [expandedGame, setExpandedGame] = useState(null)
  const [notifications, setNotifications] = useState([])
  
  // API URL
  const API_URL = 'https://cryptoflipz2-production.up.railway.app'
  
  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!')
        return
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      
      if (address.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
        alert('Unauthorized wallet. Admin access only.')
        return
      }
      
      setWalletAddress(address)
      setIsAdmin(true)
      setIsConnected(true)
      
      // Setup provider and contract
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contractAddress = CONTRACT_ADDRESSES[selectedChain]
      
      if (contractAddress && contractAddress !== '0x...') {
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
        setProvider(provider)
        setSigner(signer)
        setContract(contract)
      }
      
      // Load initial data
      await loadData()
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect wallet')
    }
  }
  
  // Load data from database and blockchain
  const loadData = async () => {
    setLoading(true)
    try {
      // Load games from database
      const gamesResponse = await fetch(`${API_URL}/api/admin/games`)
      const gamesData = await gamesResponse.json()
      setGames(gamesData.games || [])
      
      // Load blockchain data if contract is available
      if (contract) {
        const [platformFee, listingFee] = await Promise.all([
          contract.platformFeePercent(),
          contract.listingFeeUSD()
        ])
        
        setSettings({
          platformFeePercent: platformFee.toNumber() / 100,
          listingFeeUSD: listingFee.toNumber() / 1000000
        })
      }
      
      // Calculate stats
      calculateStats(gamesData.games || [])
      
      // Load player data
      await loadPlayerData(gamesData.games || [])
      
    } catch (error) {
      console.error('Error loading data:', error)
      addNotification('error', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate statistics
  const calculateStats = (gamesData) => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    let totalVolume = 0
    let monthlyVolume = 0
    let activeCount = 0
    
    gamesData.forEach(game => {
      if (game.status === 'active' || game.status === 'joined') {
        activeCount++
      }
      
      if (game.price_usd) {
        totalVolume += game.price_usd
        
        const gameDate = new Date(game.created_at)
        if (gameDate >= monthStart) {
          monthlyVolume += game.price_usd
        }
      }
    })
    
    setStats({
      totalGames: gamesData.length,
      activeGames: activeCount,
      totalVolume: totalVolume,
      platformFees: totalVolume * (settings.platformFeePercent / 100),
      monthlyFees: monthlyVolume * (settings.platformFeePercent / 100),
      totalNFTsInContract: activeCount, // Approximate
      totalETHInContract: 0, // Would need blockchain query
      totalUSDCInContract: 0 // Would need blockchain query
    })
  }
  
  // Load player data
  const loadPlayerData = async (gamesData) => {
    const playerMap = new Map()
    
    gamesData.forEach(game => {
      // Process creator
      if (!playerMap.has(game.creator)) {
        playerMap.set(game.creator, {
          address: game.creator,
          gamesCreated: 0,
          gamesWon: 0,
          totalVolume: 0
        })
      }
      const creator = playerMap.get(game.creator)
      creator.gamesCreated++
      creator.totalVolume += game.price_usd || 0
      
      // Process joiner
      if (game.joiner && !playerMap.has(game.joiner)) {
        playerMap.set(game.joiner, {
          address: game.joiner,
          gamesCreated: 0,
          gamesWon: 0,
          totalVolume: 0
        })
      }
      if (game.joiner) {
        const joiner = playerMap.get(game.joiner)
        joiner.totalVolume += game.price_usd || 0
      }
    })
    
    setPlayers(Array.from(playerMap.values()))
  }
  
  // Update platform fee
  const updatePlatformFee = async () => {
    if (!contract) return
    
    try {
      const newFee = Math.round(settings.platformFeePercent * 100) // Convert to basis points
      const tx = await contract.setPlatformFeePercent(newFee)
      await tx.wait()
      
      addNotification('success', 'Platform fee updated successfully!')
      await loadData()
    } catch (error) {
      console.error('Error updating platform fee:', error)
      addNotification('error', 'Failed to update platform fee')
    }
  }
  
  // Update listing fee
  const updateListingFee = async () => {
    if (!contract) return
    
    try {
      const newFee = Math.round(settings.listingFeeUSD * 1000000) // Convert to 6 decimals
      const tx = await contract.setListingFee(newFee)
      await tx.wait()
      
      addNotification('success', 'Listing fee updated successfully!')
      await loadData()
    } catch (error) {
      console.error('Error updating listing fee:', error)
      addNotification('error', 'Failed to update listing fee')
    }
  }
  
  // Emergency withdraw NFT
  const emergencyWithdrawNFT = async (nftContract, tokenId, toAddress) => {
    if (!contract) return
    
    try {
      const tx = await contract.emergencyWithdrawNFT(nftContract, tokenId, toAddress)
      await tx.wait()
      
      addNotification('success', 'NFT withdrawn successfully!')
      await loadData()
    } catch (error) {
      console.error('Error withdrawing NFT:', error)
      addNotification('error', 'Failed to withdraw NFT')
    }
  }
  
  // Emergency withdraw ETH
  const emergencyWithdrawETH = async (amount, toAddress) => {
    if (!contract) return
    
    try {
      const tx = await contract.emergencyWithdrawETH(toAddress, ethers.utils.parseEther(amount))
      await tx.wait()
      
      addNotification('success', 'ETH withdrawn successfully!')
      await loadData()
    } catch (error) {
      console.error('Error withdrawing ETH:', error)
      addNotification('error', 'Failed to withdraw ETH')
    }
  }
  
  // Cancel game in database
  const cancelGameInDB = async (gameId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/games/${gameId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        addNotification('success', 'Game cancelled successfully!')
        await loadData()
      } else {
        addNotification('error', 'Failed to cancel game')
      }
    } catch (error) {
      console.error('Error cancelling game:', error)
      addNotification('error', 'Failed to cancel game')
    }
  }
  
  // Add notification
  const addNotification = (type, message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }
  
  // Format address
  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#00FF41'
      case 'completed': return '#FF6B35'
      case 'cancelled': return '#FF4444'
      default: return '#666'
    }
  }
  
  // Filter games
  useEffect(() => {
    const filtered = games.filter(game => 
      game.id.toString().includes(searchQuery) ||
      game.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.joiner && game.joiner.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredGames(filtered)
  }, [games, searchQuery])
  
  // Chain selector component
  const ChainSelector = () => (
    <select 
      value={selectedChain} 
      onChange={(e) => setSelectedChain(e.target.value)}
      style={{ marginLeft: '1rem' }}
    >
      {Object.keys(CHAIN_CONFIGS).map(chain => (
        <option key={chain} value={chain}>
          {CHAIN_CONFIGS[chain].name}
        </option>
      ))}
    </select>
  )
  
  return (
    <AdminContainer>
      <Header>
        <Title>Admin Dashboard</Title>
        {!isConnected ? (
          <ConnectButton onClick={connectWallet}>
            Connect Admin Wallet
          </ConnectButton>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Connected: {formatAddress(walletAddress)}</span>
            <ChainSelector />
          </div>
        )}
      </Header>

      {!isConnected ? (
        <ContentArea>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Connect your admin wallet to access the dashboard</h2>
            <p>Only authorized wallets can access this panel</p>
          </div>
        </ContentArea>
      ) : (
        <>
          <TabContainer>
            <Tab 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={20} />
              Overview
            </Tab>
            <Tab 
              active={activeTab === 'games'} 
              onClick={() => setActiveTab('games')}
            >
              <Gamepad2 size={20} />
              Games
            </Tab>
            <Tab 
              active={activeTab === 'players'} 
              onClick={() => setActiveTab('players')}
            >
              <Users size={20} />
              Players
            </Tab>
            <Tab 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              Settings
            </Tab>
            <Tab 
              active={activeTab === 'emergency'} 
              onClick={() => setActiveTab('emergency')}
            >
              <Shield size={20} />
              Emergency
            </Tab>
          </TabContainer>

          <ContentArea>
            {activeTab === 'overview' && (
              <div>
                <StatsGrid>
                  <StatCard>
                    <StatHeader>
                      <StatIcon>
                        <Gamepad2 size={24} />
                      </StatIcon>
                      <div>
                        <StatValue>{stats.totalGames}</StatValue>
                        <StatLabel>Total Games</StatLabel>
                      </div>
                    </StatHeader>
                  </StatCard>
                  
                  <StatCard>
                    <StatHeader>
                      <StatIcon>
                        <Activity size={24} />
                      </StatIcon>
                      <div>
                        <StatValue>{stats.activeGames}</StatValue>
                        <StatLabel>Active Games</StatLabel>
                      </div>
                    </StatHeader>
                  </StatCard>
                  
                  <StatCard>
                    <StatHeader>
                      <StatIcon>
                        <DollarSign size={24} />
                      </StatIcon>
                      <div>
                        <StatValue>${stats.totalVolume.toFixed(2)}</StatValue>
                        <StatLabel>Total Volume</StatLabel>
                      </div>
                    </StatHeader>
                  </StatCard>
                  
                  <StatCard>
                    <StatHeader>
                      <StatIcon>
                        <Crown size={24} />
                      </StatIcon>
                      <div>
                        <StatValue>${stats.platformFees.toFixed(2)}</StatValue>
                        <StatLabel>Platform Fees</StatLabel>
                      </div>
                    </StatHeader>
                  </StatCard>
                </StatsGrid>
                
                <div style={{ marginTop: '2rem' }}>
                  <h3>Recent Activity</h3>
                  {games.slice(0, 5).map(game => (
                    <GameCard key={game.id}>
                      <GameHeader>
                        <div>
                          <strong>Game #{game.id}</strong>
                          <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                            Created by {formatAddress(game.creator)}
                          </div>
                        </div>
                        <GameStatus status={game.status}>
                          {game.status}
                        </GameStatus>
                      </GameHeader>
                    </GameCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'games' && (
              <div>
                <SearchBar>
                  <SearchInput
                    type="text"
                    placeholder="Search games by ID, creator, or joiner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </SearchBar>
                
                {filteredGames.map(game => (
                  <GameCard key={game.id}>
                    <GameHeader>
                      <div>
                        <strong>Game #{game.id}</strong>
                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                          Creator: {formatAddress(game.creator)}
                          {game.joiner && ` | Joiner: ${formatAddress(game.joiner)}`}
                        </div>
                      </div>
                      <GameStatus status={game.status}>
                        {game.status}
                      </GameStatus>
                    </GameHeader>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong>Price:</strong> ${game.price_usd || 0}
                      </div>
                      <div>
                        <strong>Created:</strong> {formatDate(game.created_at)}
                      </div>
                    </div>
                  </GameCard>
                ))}
              </div>
            )}

            {activeTab === 'players' && (
              <div>
                <h3>Player Statistics</h3>
                {players.map(player => (
                  <GameCard key={player.address}>
                    <GameHeader>
                      <div>
                        <strong>{formatAddress(player.address)}</strong>
                      </div>
                    </GameHeader>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div>
                        <strong>Games Created:</strong> {player.gamesCreated}
                      </div>
                      <div>
                        <strong>Games Won:</strong> {player.gamesWon}
                      </div>
                      <div>
                        <strong>Total Volume:</strong> ${player.totalVolume.toFixed(2)}
                      </div>
                    </div>
                  </GameCard>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3>Platform Settings</h3>
                <SettingsForm>
                  <FormGroup>
                    <Label>Platform Fee Percentage</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.platformFeePercent}
                      onChange={(e) => setSettings(prev => ({ ...prev, platformFeePercent: parseFloat(e.target.value) }))}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Listing Fee (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.listingFeeUSD}
                      onChange={(e) => setSettings(prev => ({ ...prev, listingFeeUSD: parseFloat(e.target.value) }))}
                    />
                  </FormGroup>
                  
                  <Button onClick={updatePlatformFee} disabled={!contract}>
                    Update Platform Fee
                  </Button>
                  
                  <Button onClick={updateListingFee} disabled={!contract}>
                    Update Listing Fee
                  </Button>
                </SettingsForm>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div>
                <h3>Emergency Functions</h3>
                <p style={{ color: '#ccc', marginBottom: '2rem' }}>
                  Use these functions only in emergency situations
                </p>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <Button 
                    onClick={() => emergencyWithdrawETH('0.1', walletAddress)}
                    disabled={!contract}
                    style={{ background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)' }}
                  >
                    Emergency Withdraw ETH
                  </Button>
                  
                  <Button 
                    onClick={() => alert('NFT withdrawal requires contract address and token ID')}
                    disabled={!contract}
                    style={{ background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)' }}
                  >
                    Emergency Withdraw NFT
                  </Button>
                </div>
              </div>
            )}
          </ContentArea>
        </>
      )}

      {/* Notifications */}
      {notifications.map(notification => (
        <Notification key={notification.id} type={notification.type}>
          {notification.message}
        </Notification>
      ))}
    </AdminContainer>
  )
} 