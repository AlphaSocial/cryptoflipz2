import React from 'react'
import { theme } from '../styles/theme'

const PowerDisplay = ({ 
  creatorPower = 0,
  joinerPower = 0,
  currentPlayer = null,
  creator = null,
  joiner = null,
  chargingPlayer = null,
  gamePhase = null,
  isMyTurn = false,
  playerChoice = null,
  onPlayerChoice = null
}) => {
  // Calculate total power for single bar
  const totalPower = creatorPower + joinerPower
  const maxTotalPower = 20 // 10 + 10
  
  // Show choice buttons if it's choosing phase and player's turn
  const showChoiceButtons = gamePhase === 'choosing' && isMyTurn && !playerChoice && onPlayerChoice
  
  // Show power bar if choice is made or in active phase
  const showPowerBar = gamePhase === 'round_active' || playerChoice
  
  if (!showChoiceButtons && !showPowerBar) {
    return null
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(25, 20, 0, 0.8) 100%)',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: `2px solid #FFD700`,
      backdropFilter: 'blur(10px)',
      maxWidth: '450px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)'
    }}>
      
      {/* Choice Buttons - Only show during choosing phase */}
      {showChoiceButtons && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#FFD700',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            letterSpacing: '1px'
          }}>
            🎯 CHOOSE YOUR SIDE
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => onPlayerChoice('heads')}
              style={{
                flex: 1,
                padding: '1rem',
                background: `linear-gradient(45deg, ${theme.colors.neonPink}, ${theme.colors.neonPurple})`,
                border: `2px solid ${theme.colors.neonPink}`,
                borderRadius: '0.75rem',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(255, 20, 147, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 0 25px rgba(255, 20, 147, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 0 15px rgba(255, 20, 147, 0.3)'
              }}
            >
              👑 HEADS
            </button>
            
            <button
              onClick={() => onPlayerChoice('tails')}
              style={{
                flex: 1,
                padding: '1rem',
                background: `linear-gradient(45deg, ${theme.colors.neonBlue}, ${theme.colors.neonGreen})`,
                border: `2px solid ${theme.colors.neonBlue}`,
                borderRadius: '0.75rem',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(0, 191, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 0 25px rgba(0, 191, 255, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 0 15px rgba(0, 191, 255, 0.3)'
              }}
            >
              💎 TAILS
            </button>
          </div>
          
          <div style={{
            marginTop: '1rem',
            color: 'rgba(255, 215, 0, 0.8)',
            fontSize: '0.85rem'
          }}>
            Choose your side, then hold the coin to charge power!
          </div>
        </div>
      )}

      {/* Single Power Bar - Only show after choice is made */}
      {showPowerBar && (
        <div>
          <div style={{
            color: '#FFD700',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1.2rem',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            letterSpacing: '1px'
          }}>
            ⚡ COMBINED POWER LEVEL ⚡
          </div>

          {/* Single Combined Power Bar */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{
              color: '#FFD700',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              marginBottom: '0.6rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Total Power</span>
              <span style={{ 
                color: '#FFD700',
                textShadow: '0 0 5px rgba(255, 215, 0, 0.8)' 
              }}>
                {totalPower.toFixed(1)}/20
              </span>
            </div>
            
            <div style={{
              height: '24px',
              background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(40, 30, 0, 0.6) 100%)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `3px solid #FFD700`,
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                height: '100%',
                width: `${(totalPower / maxTotalPower) * 100}%`,
                background: chargingPlayer ? 
                  `linear-gradient(90deg, #FFD700 0%, #FFA500 30%, #FF6B00 60%, #FF1493 100%)` :
                  `linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)`,
                borderRadius: '9px',
                transition: 'width 0.15s ease-out',
                backgroundSize: '200% 100%',
                animation: chargingPlayer ? 'powerCharge 0.6s linear infinite' : 'none',
                boxShadow: chargingPlayer ? 
                  '0 0 15px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)' :
                  '0 0 8px rgba(255, 215, 0, 0.6)'
              }} />
              
              {/* Power level markers */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 0.5rem'
              }}>
                {[4, 8, 12, 16].map(level => (
                  <div key={level} style={{
                    width: '2px',
                    height: '70%',
                    background: 'rgba(255, 255, 255, 0.4)',
                    opacity: totalPower >= level ? 1 : 0.3
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Current Player Info */}
          <div style={{
            textAlign: 'center',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(255, 215, 0, 0.3)',
            marginTop: '0.5rem'
          }}>
            <div style={{
              color: '#FFD700',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '0.3rem',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
            }}>
              {currentPlayer === creator ? '👑 Player 1 Turn' : 
               currentPlayer === joiner ? '💎 Player 2 Turn' : 
               'Waiting...'}
            </div>
            <div style={{
              color: 'rgba(255, 215, 0, 0.7)',
              fontSize: '0.75rem'
            }}>
              Higher power = Longer, more dramatic coin flip!
            </div>
          </div>

          {/* Charging Indicator */}
          {chargingPlayer && (
            <div style={{
              marginTop: '0.8rem',
              padding: '0.6rem',
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.5)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#FFD700',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                animation: 'powerPulse 0.4s ease-in-out infinite',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
              }}>
                ⚡ {chargingPlayer === creator ? 'PLAYER 1' : 'PLAYER 2'} CHARGING POWER ⚡
              </div>
              <div style={{
                color: 'rgba(255, 215, 0, 0.8)',
                fontSize: '0.75rem',
                marginTop: '0.2rem'
              }}>
                Hold to build energy, release to flip!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PowerDisplay 