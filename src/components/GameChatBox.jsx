import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useProfile } from '../contexts/ProfileContext'
import { useToast } from '../contexts/ToastContext'
import { theme } from '../styles/theme'
import ProfilePicture from './ProfilePicture'
import styled from '@emotion/styled'

const ChatContainer = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  height: 300px;
  display: flex;
  flex-direction: column;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`

const Message = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.isCurrentUser ? 'rgba(255, 20, 147, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.isCurrentUser ? 'rgba(255, 20, 147, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: ${props => props.isCurrentUser ? '#FF1493' : '#00BFFF'};
`

const MessageContent = styled.div`
  color: #fff;
  word-break: break-word;
`

const InputContainer = styled.form`
  display: flex;
  gap: 0.5rem;
`

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #fff;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: rgba(255, 20, 147, 0.5);
    box-shadow: 0 0 10px rgba(255, 20, 147, 0.2);
  }
`

const SendButton = styled.button`
  background: linear-gradient(45deg, #FF1493, #FF69B4);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 20, 147, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const GameChatBox = ({ gameId, socket, connected }) => {
  const { address, isConnected } = useWallet()
  const { getPlayerName, setPlayerName } = useProfile()
  const { showError } = useToast()
  
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [tempName, setTempName] = useState('')
  const [playerName, setPlayerNameState] = useState('')
  const [playerNames, setPlayerNames] = useState({})
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  // Load player name on mount
  useEffect(() => {
    if (address && isConnected) {
      const loadName = async () => {
        const name = await getPlayerName(address)
        setPlayerNameState(name || '')
      }
      loadName()
    }
  }, [address, isConnected, getPlayerName])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for chat messages from socket
  useEffect(() => {
    if (!socket) return
    
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'chat_message') {
          console.log('📩 Received chat message:', data)
          setMessages(prev => [...prev, {
            address: data.from || data.address,
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString()
          }])
        }
      } catch (error) {
        console.error('Error parsing chat message:', error)
      }
    }
    
    socket.addEventListener('message', handleMessage)
    
    return () => {
      socket.removeEventListener('message', handleMessage)
    }
  }, [socket])

  // Load player names for messages
  useEffect(() => {
    const loadPlayerNames = async () => {
      const names = {}
      const uniqueAddresses = [...new Set(messages.map(m => m.address).filter(Boolean))]
      
      for (const addr of uniqueAddresses) {
        if (!names[addr] && addr) {
          const name = await getPlayerName(addr)
          names[addr] = name || `${addr.slice(0, 6)}...${addr.slice(-4)}`
        }
      }
      setPlayerNames(names)
    }

    if (messages.length > 0) {
      loadPlayerNames()
    }
  }, [messages, getPlayerName])

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!currentMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN || !address) {
      if (!address) showError('Please connect your wallet')
      else if (!socket || socket.readyState !== WebSocket.OPEN) showError('Not connected to game')
      return
    }

    // Check if user has set a name
    if (!playerName) {
      setIsNameModalOpen(true)
      return
    }

    try {
      const chatMessage = {
        type: 'chat_message',
        gameId,
        message: currentMessage.trim()
      }

      console.log('📤 Sending chat message:', chatMessage)
      socket.send(JSON.stringify(chatMessage))
      setCurrentMessage('')
      
      // Focus back to input
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error sending chat message:', error)
      showError('Failed to send message')
    }
  }

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      showError('Please enter a valid name')
      return
    }

    try {
      await setPlayerName(address, tempName.trim())
      setPlayerNameState(tempName.trim())
      setIsNameModalOpen(false)
      setTempName('')
    } catch (error) {
      console.error('Error saving name:', error)
      showError('Failed to save name')
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDisplayName = (addr) => {
    if (!addr) return 'Unknown'
    return playerNames[addr] || `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ color: theme.colors.textSecondary }}>
          Connect your wallet to join the chat
        </div>
      </div>
    )
  }

  return (
    <ChatContainer>
      {/* Chat Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <div style={{
          color: '#FFD700',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💬 Chat
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: connected ? '#00FF00' : '#FF0000',
            animation: connected ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ 
            color: theme.colors.textSecondary, 
            fontSize: '0.8rem' 
          }}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <MessagesContainer>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.colors.textSecondary,
            padding: '2rem'
          }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.address === address
            const displayName = getDisplayName(msg.address)
            
            return (
              <Message key={index} isCurrentUser={isCurrentUser}>
                <MessageHeader isCurrentUser={isCurrentUser}>
                  <span>{displayName}</span>
                  <span>{formatTimestamp(msg.timestamp)}</span>
                </MessageHeader>
                <MessageContent>{msg.message}</MessageContent>
              </Message>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Message Input */}
      <InputContainer onSubmit={sendMessage}>
        <Input
          ref={inputRef}
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!connected}
        />
        <SendButton
          type="submit"
          disabled={!connected || !currentMessage.trim()}
        >
          Send
        </SendButton>
      </InputContainer>

      {/* Name Modal */}
      {isNameModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(25, 20, 0, 0.9) 100%)',
            border: '2px solid #FFD700',
            borderRadius: '1rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '400px',
            position: 'relative'
          }}>
            <h3 style={{
              color: '#FFD700',
              marginBottom: '1rem',
              fontSize: '1.2rem'
            }}>
              {playerName ? 'Change Your Name' : 'Set Your Name'}
            </h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setIsNameModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 0, 0, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveName}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </ChatContainer>
  )
}

export default GameChatBox