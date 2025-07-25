import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useGlobalGameTransport() {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleTransport = (event) => {
      const data = event.detail
      
      if (data.type === 'TRANSPORT_TO_GAME' && data.forceTransport) {
        console.log('🚀 Force transporting to game:', data.gameId)
        
        const gameId = data.gameId || data.contract_game_id
        if (gameId) {
          // Force navigation
          navigate(`/game/${gameId}`, { replace: true })
        }
      }
    }
    
    window.addEventListener('websocketMessage', handleTransport)
    
    return () => {
      window.removeEventListener('websocketMessage', handleTransport)
    }
  }, [navigate])
} 