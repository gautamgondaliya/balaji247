import React, { useEffect, useState } from 'react';
import './PlaceBet.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlaceBet = ({ selectedBet, selectedMarketIndex, setSelectedBet, setStake, stake, setSelectedMarketIndex }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  // Check for mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (selectedBet && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedBet, isMobile]);

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

  // Get bet label based on the type
  const getBetTypeLabel = () => {
    if (!selectedBet) return '';
    
    const { odd } = selectedBet;
    if (odd.type === 'yes') return '- YES:';
    if (odd.type === 'no') return '- NO:';
    if (odd.type === 'back') return '- BACK:';
    if (odd.type === 'lay') return '- LAY:';
    return `- ${odd.type.toUpperCase()}:`;
  };

  // Get the market name to display
  const getMarketName = () => {
    if (!selectedBet) return '';
    return selectedBet.market.mn || selectedBet.market.name || '';
  };

  // Get the selected price to display
  const getSelectedPrice = () => {
    if (!selectedBet) return '';
    return selectedBet.odd.price || '-';
  };

  const betContent = (
    <>
      <div className="bet-info-card">
        <div className={`bet-info-type ${selectedBet?.odd.type}`}>
          {getMarketName()} {getBetTypeLabel()} {getSelectedPrice()}
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
          onClick={() => setStake(prev => Number(prev || 0) + 30000)}
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