import React, { useEffect } from 'react';
import './PlaceBet.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlaceBet = ({ selectedBet, selectedMarketIndex, setSelectedBet, setStake, stake, setSelectedMarketIndex }) => {
  
  useEffect(() => {
    if (selectedBet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedBet]);

  const handlePlaceBet = () => {
    // Check if stake is valid
    if (!stake || Number(stake) < 100) {
      toast.error('Please enter a valid stake amount (min: 100)', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    // Show success message
    toast.success('Bet placed successfully!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    
    handleClose();
  };
  
  const handleClose = () => {
    setSelectedBet(null);
    setStake('');
    setSelectedMarketIndex(null);
  };

  const betContent = (
    <>
      <div className="bet-info-card">
        <div className={`bet-info-type ${selectedBet?.odd.type}`}>
          {selectedBet?.market.name} - {selectedBet?.odd.type.toUpperCase()}: {selectedBet?.odd.value}
        </div>
        <div className="bet-info-stake">
          {stake}
        </div>
      </div>
      
      <div className="stake-buttons-grid">
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(prev => Number(prev || 0) + 500)}
        >+ 500</button>
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(prev => Number(prev || 0) + 1000)}
        >+ 1000</button>
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(prev => Number(prev || 0) + 2000)}
        >+ 2000</button>
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(prev => Number(prev || 0) + 5000)}
        >+ 5000</button>
      </div>
      
      <div className="stake-buttons-grid">
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(prev => Number(prev || 0) + 10000)}
        >+ 10000</button>
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(prev => Number(prev || 0) + 20000)}
        >+ 20000</button>
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(9189484)}
        >+ 30000</button>
        <button
          className="place-bet-stake-btn"
          onClick={() => setStake(9189484)}
        >+ 9189484</button>
      </div>
      
      <div className="action-buttons-grid">
        <button
          className="action-btn min"
          onClick={() => setStake(100)}
        >MIN STAKE</button>
        <button
          className="action-btn max"
          onClick={() => setStake(25000)}
        >MAX STAKE</button>
        <button
          className="action-btn edit"
          onClick={() => {}}
        >EDIT STAKE</button>
        <button
          className="action-btn clear"
          onClick={() => setStake('')}
        >CLEAR</button>
      </div>
      
      <div className="bet-limits-info">
        Min Bet: 100 Max Bet: 25000
      </div>
      
      <div className="final-buttons-grid">
        <button
          className="final-btn cancel"
          onClick={handleClose}
        >
          CANCEL
        </button>
        <button
          className="final-btn place"
          onClick={handlePlaceBet}
        >
          PLACE BET
        </button>
      </div>
    </>
  );
  
  return (
    <>
      {/* Desktop version */}
      <div className="event-place-bet">
        <div className="event-place-bet-title">Place Bet</div>
        <div className="event-place-bet-content">
          {selectedBet && selectedMarketIndex !== null ? (
            <div className="place-bet-card">
              {betContent}
            </div>
          ) : (
            <div className="event-bet-placeholder">
              Select a market to place bet
            </div>
          )}
        </div>
      </div>

      {/* Mobile version */}
      {selectedBet && selectedMarketIndex !== null && (
        <>
          <div className={`mobile-bet-overlay${selectedBet ? ' show' : ''}`} onClick={handleClose} />
          <div className={`mobile-bet-container${selectedBet ? ' show' : ''}`}>
            <div className="mobile-bet-header">
              <div className="mobile-bet-title">Place Bet</div>
              <button className="mobile-bet-close" onClick={handleClose}>✕</button>
            </div>
            <div className="place-bet-card">
              {betContent}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PlaceBet; 