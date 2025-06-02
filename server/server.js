const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

console.log('🚀 Starting FLIPNOSIS server...')
console.log('📁 Server directory:', __dirname)
console.log('📁 Process CWD:', process.cwd())

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

app.use(cors())
app.use(express.json())

// Database setup with Railway environment variable
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'games.db')
console.log('🗄️ Database path:', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err)
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath)
    initializeDatabase()
  }
})

// Serve static files from the built frontend
if (process.env.NODE_ENV === 'production') {
  console.log('🌍 Production mode - setting up static file serving')
  
  // In production, the server.js is in dist/server/server.js
  // So we need to go up two levels to reach the dist folder
  const distPath = path.join(__dirname, '..')
  console.log('📁 Looking for dist folder at:', distPath)
  
  if (fs.existsSync(distPath)) {
    console.log('✅ Found dist folder')
    console.log('📄 Dist contents:', fs.readdirSync(distPath))
    
    app.use(express.static(distPath))
    console.log('📁 Serving static files from:', distPath)
    
    // Handle React Router (SPA) - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      // Skip API routes and health check
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next()
      }
      
      const indexPath = path.join(distPath, 'index.html')
      console.log('📄 Serving index.html for path:', req.path)
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('❌ Error serving index.html:', err)
          res.status(500).send('Error loading application')
        }
      })
    })
  } else {
    console.error('❌ Dist folder not found at:', distPath)
    // List parent directory contents to debug
    const parentDir = path.dirname(__dirname)
    console.log('📁 Parent directory:', parentDir)
    if (fs.existsSync(parentDir)) {
      console.log('📁 Parent directory contents:', fs.readdirSync(parentDir))
    }
  }
}

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Games table
    db.run(`CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      creator TEXT NOT NULL,
      joiner TEXT,
      nft_contract TEXT NOT NULL,
      nft_token_id TEXT NOT NULL,
      nft_name TEXT,
      nft_image TEXT,
      nft_collection TEXT,
      nft_chain TEXT,
      price_usd REAL NOT NULL,
      rounds INTEGER NOT NULL,
      status TEXT DEFAULT 'waiting',
      winner TEXT,
      creator_wins INTEGER DEFAULT 0,
      joiner_wins INTEGER DEFAULT 0,
      listing_fee_eth REAL,
      listing_fee_hash TEXT,
      entry_fee_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME,
      total_spectators INTEGER DEFAULT 0
    )`)

    // Game rounds table
    db.run(`CREATE TABLE IF NOT EXISTS game_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      flip_result TEXT NOT NULL,
      flipper_address TEXT NOT NULL,
      power_used REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(game_id) REFERENCES games(id)
    )`)

    // Player statistics table
    db.run(`CREATE TABLE IF NOT EXISTS player_stats (
      address TEXT PRIMARY KEY,
      total_games INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      games_lost INTEGER DEFAULT 0,
      total_winnings_usd REAL DEFAULT 0,
      total_spent_usd REAL DEFAULT 0,
      favorite_chain TEXT,
      first_game_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_game_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)

    // Transactions table for all payments
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT,
      player_address TEXT NOT NULL,
      transaction_type TEXT NOT NULL, -- 'listing_fee', 'entry_fee', 'payout'
      amount_usd REAL NOT NULL,
      amount_eth REAL NOT NULL,
      tx_hash TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(game_id) REFERENCES games(id)
    )`)

    console.log('✅ Database tables initialized')
  })
}

// Database helper functions
const dbHelpers = {
  // Create a new game
  createGame: (gameData) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO games (
        id, creator, nft_contract, nft_token_id, nft_name, nft_image, 
        nft_collection, nft_chain, price_usd, rounds, listing_fee_eth, listing_fee_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      
      const values = [
        gameData.id,
        gameData.creator,
        gameData.nft.contractAddress,
        gameData.nft.tokenId,
        gameData.nft.name,
        gameData.nft.image,
        gameData.nft.collection,
        gameData.nft.chain,
        gameData.priceUSD,
        gameData.rounds,
        gameData.listingFee?.amountETH,
        gameData.listingFee?.transactionHash
      ]
      
      db.run(sql, values, function(err) {
        if (err) {
          console.error('❌ Error creating game:', err)
          reject(err)
        } else {
          console.log('✅ Game created in database:', gameData.id)
          resolve(this.lastID)
        }
      })
    })
  },

  // Get game by ID
  getGame: (gameId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM games WHERE id = ?`
      db.get(sql, [gameId], (err, row) => {
        if (err) {
          console.error('❌ Error getting game:', err)
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },

  // Get all games (not just waiting)
  getAllGames: (limit = 50) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM games ORDER BY created_at DESC LIMIT ?`
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          console.error('❌ Error getting games:', err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  },

  // Get all waiting games
  getWaitingGames: (limit = 50) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM games WHERE status = 'waiting' ORDER BY created_at DESC LIMIT ?`
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          console.error('❌ Error getting waiting games:', err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  },

  // Update game status
  updateGame: (gameId, updates) => {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const sql = `UPDATE games SET ${setClause} WHERE id = ?`
      const values = [...Object.values(updates), gameId]
      
      db.run(sql, values, function(err) {
        if (err) {
          console.error('❌ Error updating game:', err)
          reject(err)
        } else {
          console.log('✅ Game updated:', gameId)
          resolve(this.changes)
        }
      })
    })
  },

  // Record a round result
  recordRound: (gameId, roundNumber, flipResult, flipperAddress, power) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO game_rounds (game_id, round_number, flip_result, flipper_address, power_used) 
                   VALUES (?, ?, ?, ?, ?)`
      
      db.run(sql, [gameId, roundNumber, flipResult, flipperAddress, power], function(err) {
        if (err) {
          console.error('❌ Error recording round:', err)
          reject(err)
        } else {
          console.log('✅ Round recorded:', gameId, roundNumber)
          resolve(this.lastID)
        }
      })
    })
  },

  // Record transaction
  recordTransaction: (gameId, playerAddress, type, amountUSD, amountETH, txHash) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO transactions (game_id, player_address, transaction_type, amount_usd, amount_eth, tx_hash) 
                   VALUES (?, ?, ?, ?, ?, ?)`
      
      db.run(sql, [gameId, playerAddress, type, amountUSD, amountETH, txHash], function(err) {
        if (err) {
          console.error('❌ Error recording transaction:', err)
          reject(err)
        } else {
          console.log('✅ Transaction recorded:', type, amountUSD)
          resolve(this.lastID)
        }
      })
    })
  },

  // Get monthly stats
  getMonthlyStats: (year, month) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_games,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
          SUM(price_usd) as total_value,
          COUNT(DISTINCT creator) as unique_creators,
          COUNT(DISTINCT joiner) as unique_joiners
        FROM games 
        WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?
      `
      
      db.get(sql, [year.toString(), month.toString().padStart(2, '0')], (err, row) => {
        if (err) {
          console.error('❌ Error getting monthly stats:', err)
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }
}

// Game session management (keeping existing logic)
class GameSession {
  constructor(gameId) {
    this.gameId = gameId
    this.creator = null
    this.joiner = null
    this.phase = 'waiting'
    this.currentRound = 1
    this.currentPlayer = null
    this.maxRounds = 5
    this.creatorWins = 0
    this.joinerWins = 0
    this.winner = null
    this.spectators = 0
    this.flipState = {
      creatorPower: 0,
      joinerPower: 0,
      creatorReady: false,
      joinerReady: false,
      flipResult: null,
      roundTimer: 30
    }
    this.clients = new Set()
    this.lastActionTime = Date.now()
    this.roundStartTime = null
    this.gameData = null
  }

  addClient(ws) {
    this.clients.add(ws)
    this.spectators = this.clients.size
    this.broadcast({ type: 'spectator_update', spectators: this.spectators })
    
    // Update max spectators in database
    dbHelpers.updateGame(this.gameId, { total_spectators: Math.max(this.spectators, 0) })
      .catch(err => console.error('Error updating spectator count:', err))
  }

  removeClient(ws) {
    this.clients.delete(ws)
    this.spectators = this.clients.size
    this.broadcast({ type: 'spectator_update', spectators: this.spectators })
  }

  broadcast(message) {
    const messageToSend = {
      ...message,
      state: this.getState()
    }
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageToSend))
      }
    })
  }

  getState() {
    return {
      gameId: this.gameId,
      creator: this.creator,
      joiner: this.joiner,
      phase: this.phase,
      currentRound: this.currentRound,
      currentPlayer: this.currentPlayer,
      maxRounds: this.maxRounds,
      creatorWins: this.creatorWins,
      joinerWins: this.joinerWins,
      winner: this.winner,
      spectators: this.spectators,
      flipState: this.flipState
    }
  }

  async setGameData(data) {
    this.gameData = data
    this.creator = data.creator
    this.maxRounds = data.rounds
    
    // Save to database
    try {
      await dbHelpers.createGame(data)
    } catch (error) {
      console.error('Error saving game to database:', error)
    }
  }

  async setJoiner(address, entryFeeHash) {
    this.joiner = address
    this.phase = 'ready'
    
    // Update database
    try {
      await dbHelpers.updateGame(this.gameId, { 
        joiner: address, 
        status: 'joined',
        entry_fee_hash: entryFeeHash 
      })
      
      // Record entry fee transaction
      if (this.gameData) {
        await dbHelpers.recordTransaction(
          this.gameId,
          address,
          'entry_fee',
          this.gameData.priceUSD,
          this.gameData.priceUSD / 2500, // Approximate ETH amount
          entryFeeHash
        )
      }
    } catch (error) {
      console.error('Error updating joiner in database:', error)
    }
    
    console.log('✅ Player 2 joined:', address)
    this.broadcast({ type: 'player_joined', joiner: address })
  }

  async startGame() {
    console.log('🚀 Starting game')
    this.phase = 'round_active'
    this.currentPlayer = this.creator
    this.lastActionTime = Date.now()
    this.roundStartTime = Date.now()
    this.resetFlipState()
    
    // Update database
    try {
      await dbHelpers.updateGame(this.gameId, { 
        status: 'active',
        started_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating game start in database:', error)
    }
    
    console.log('👤 Current player set to:', this.currentPlayer)
    
    this.broadcast({ 
      type: 'game_started', 
      currentPlayer: this.currentPlayer,
      round: this.currentRound
    })
    
    return true
  }

  resetFlipState() {
    this.flipState = {
      creatorPower: 0,
      joinerPower: 0,
      creatorReady: false,
      joinerReady: false,
      flipResult: null,
      roundTimer: 30
    }
  }

  updatePower(address, power) {
    if (address === this.creator) {
      this.flipState.creatorPower = power
    } else if (address === this.joiner) {
      this.flipState.joinerPower = power
    }
    
    if (this.roundStartTime) {
      const elapsed = Math.floor((Date.now() - this.roundStartTime) / 1000)
      this.flipState.roundTimer = Math.max(0, 30 - elapsed)
    }
    
    this.broadcast({ 
      type: 'power_update', 
      currentPlayer: this.currentPlayer,
      power: power,
      player: address === this.creator ? 'creator' : 'joiner'
    })
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === this.creator ? this.joiner : this.creator
    this.lastActionTime = Date.now()
    this.roundStartTime = Date.now()
    this.resetFlipState()
    
    console.log('🔄 Turn switched to:', this.currentPlayer)
    
    if (this.phase === 'round_active') {
      this.broadcast({
        type: 'turn_switch',
        currentPlayer: this.currentPlayer,
        round: this.currentRound,
        timestamp: this.lastActionTime
      })
    }
  }

  async handleFlipComplete(result, player, power) {
    console.log('🎲 Handling flip from player:', player, 'result:', result, 'power:', power)
    
    const playerAddress = player === 'creator' ? this.creator : this.joiner
    if (playerAddress !== this.currentPlayer) {
      console.log('❌ Invalid turn - current player is:', this.currentPlayer)
      return false
    }

    // Record round in database
    try {
      await dbHelpers.recordRound(this.gameId, this.currentRound, result, playerAddress, power)
    } catch (error) {
      console.error('Error recording round:', error)
    }

    // Update scores
    if (result === 'heads') {
      this.creatorWins++
    } else if (result === 'tails') {
      this.joinerWins++
    }

    this.flipState.flipResult = result

    // Check win condition
    const winsNeeded = Math.ceil(this.maxRounds / 2)
    if (this.creatorWins >= winsNeeded || this.joinerWins >= winsNeeded) {
      this.phase = 'game_complete'
      this.winner = this.creatorWins > this.joinerWins ? this.creator : this.joiner
      
      // Update database with completion
      try {
        await dbHelpers.updateGame(this.gameId, { 
          status: 'completed',
          winner: this.winner,
          creator_wins: this.creatorWins,
          joiner_wins: this.joinerWins,
          completed_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error updating game completion:', error)
      }
      
      console.log('🏆 Game complete! Winner:', this.winner)
      
      this.broadcast({
        type: 'game_complete',
        winner: this.winner,
        finalScores: {
          creator: this.creatorWins,
          joiner: this.joinerWins
        },
        result: result
      })
      
      return true
    }

    // Continue game - switch turns
    this.switchTurn()

    this.broadcast({
      type: 'flip_complete',
      result: result,
      scorer: result === 'heads' ? 'creator' : 'joiner',
      currentPlayer: this.currentPlayer,
      round: this.currentRound,
      scores: {
        creator: this.creatorWins,
        joiner: this.joinerWins
      }
    })

    return true
  }
}

const activeSessions = new Map()

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection')
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message)
      await handleMessage(ws, data)
    } catch (error) {
      console.error('❌ Error parsing message:', error)
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }))
    }
  })
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected')
    activeSessions.forEach(session => {
      session.removeClient(ws)
    })
  })

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error)
  })
})

async function handleMessage(ws, data) {
  const { type, gameId } = data

  console.log('📡 Received message:', type, 'for game:', gameId)

  let session = activeSessions.get(gameId)
  if (!session && type === 'join_game') {
    session = new GameSession(gameId)
    activeSessions.set(gameId, session)
    console.log('🎮 Created new game session:', gameId)
  }

  if (!session) {
    console.error('❌ No session found for game:', gameId)
    ws.send(JSON.stringify({ type: 'error', error: 'Game session not found' }))
    return
  }

  session.addClient(ws)

  switch (type) {
    case 'create_game':
      await session.setGameData(data.gameData)
      console.log('🎮 Game created and stored:', gameId)
      break

    case 'join_game':
      if (data.role === 'creator') {
        session.creator = data.address
        session.maxRounds = data.gameConfig?.maxRounds || 5
        console.log('👑 Creator joined:', data.address)
      } else if (data.role === 'joiner') {
        await session.setJoiner(data.address, data.entryFeeHash)
      } else {
        console.log('👀 Spectator joined:', data.address)
      }
      
      // Send current state to new client
      ws.send(JSON.stringify({
        type: 'game_state',
        state: session.getState()
      }))
      break

    case 'player_joined':
      if (data.joinerAddress && data.startGame) {
        await session.setJoiner(data.joinerAddress, data.entryFeeHash)
        setTimeout(() => {
          session.startGame()
        }, 1000)
      }
      break

    case 'start_game':
      if (session.creator && session.joiner) {
        await session.startGame()
      } else {
        ws.send(JSON.stringify({ 
          type: 'error', 
          error: 'Cannot start game - missing players' 
        }))
      }
      break

    case 'charge_power':
      session.updatePower(data.address, data.power)
      break

    case 'flip_complete':
      console.log('🎲 Processing flip_complete from:', data.player)
      const success = await session.handleFlipComplete(data.result, data.player, data.power)
      if (!success) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          error: 'Invalid flip attempt' 
        }))
      }
      break

    case 'get_game_data':
      try {
        const gameData = await dbHelpers.getGame(gameId)
        if (gameData) {
          ws.send(JSON.stringify({
            type: 'game_data_response',
            gameData: gameData
          }))
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Game not found in database'
          }))
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Database error'
        }))
      }
      break

    default:
      console.warn('⚠️ Unknown message type:', type)
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Unknown message type' 
      }))
      break
  }
}

// REST API endpoints for analytics
app.get('/api/games', async (req, res) => {
  try {
    const games = await dbHelpers.getAllGames(100)
    res.json(games)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/games/:gameId', async (req, res) => {
  try {
    const game = await dbHelpers.getGame(req.params.gameId)
    if (game) {
      res.json(game)
    } else {
      res.status(404).json({ error: 'Game not found' })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/stats/monthly/:year/:month', async (req, res) => {
  try {
    const stats = await dbHelpers.getMonthlyStats(req.params.year, req.params.month)
    res.json(stats)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeSessions: activeSessions.size,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// Cleanup inactive sessions
setInterval(() => {
  const now = Date.now()
  const timeout = 5 * 60 * 1000

  activeSessions.forEach((session, gameId) => {
    if (now - session.lastActionTime > timeout && session.clients.size === 0) {
      console.log('🧹 Cleaning up inactive session:', gameId)
      activeSessions.delete(gameId)
    }
  })
}, 60000)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...')
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err)
    } else {
      console.log('✅ Database closed')
    }
    process.exit(0)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server with SQLite running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🎮 Games API: http://localhost:${PORT}/api/games`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🚀 Production server ready at https://cryptoflipz2-production.up.railway.app`)
    console.log(`📄 Frontend served from static files`)
  }
}) 