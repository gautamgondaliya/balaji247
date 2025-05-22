import React, { useEffect, useState } from 'react';
import './PlaceBet.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://backbalaji.dynexbet.com/api'; // Adjust with your API URL

// Setup axios with authentication interceptor
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const PlaceBet = ({ selectedBet, selectedMarketIndex, setSelectedBet, setStake, stake, setSelectedMarketIndex }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Fetch wallet details on component mount
  useEffect(() => {
    fetchWalletDetails();
  }, []);

  // Fetch wallet details from backend
  const fetchWalletDetails = async () => {
    try {
      // Get user info from localStorage
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('User not logged in', {
          position: "top-right",
          autoClose: 3000
        });
        return;
      }
      
      const user = JSON.parse(userString);
      const userId = user.user_id;
      
      if (!userId) {
        toast.error('User ID not found', {
          position: "top-right",
          autoClose: 3000
        });
        return;
      }
      
      const response = await axios.get(`${BASE_URL}/wallet/details/${userId}`, getAuthHeaders());
      
      if (response.data.success) {
        setWalletDetails(response.data.data.wallet);
      } else {
        toast.error(response.data.message || 'Failed to fetch wallet details', {
          position: "top-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again', {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.error('Failed to fetch wallet details', {
          position: "top-right", 
          autoClose: 3000
        });
      }
    }
  };

  const handlePlaceBet = async () => {
    // Check if stake is valid
    if (!stake || Number(stake) < 100) {
      toast.error('Please enter a valid stake amount (min: 100)', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    if (!selectedBet) {
      toast.error('No bet selected', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setLoading(true);

    try {
      // Get user info from localStorage
      const userString = localStorage.getItem('user');
      
      if (!userString) {
        toast.error('User not logged in', {
          position: "top-right",
          autoClose: 3000
        });
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userString);
      const userId = user.user_id;
      
      if (!userId) {
        toast.error('User ID not found', {
          position: "top-right",
          autoClose: 3000
        });
        setLoading(false);
        return;
      }

      // Construct bet title
      const betTitle = `${selectedBet.market.mn} - ${selectedBet.odd.type.toUpperCase()}: ${selectedBet.odd.price}`;

      // Prepare bet data
      const betData = {
        user_id: userId,
        amount: Number(stake),
        bet_type: selectedBet.odd.type, // 'back', 'lay', 'yes', or 'no'
        odds: selectedBet.odd.price,
        market_id: selectedBet.market.id || selectedBet.market.mn,
        bet_category: selectedBet.market.category || 'cricket',
        yes_run: selectedBet.market.ry || 0,
        yes_odd: selectedBet.market.oy || 0,
        no_run: selectedBet.market.rn || 0,
        no_odd: selectedBet.market.on || 0,
        bet_title: betTitle, // Add bet title to payload
        market_name: selectedBet.market.mn || '', // Add market name
        selection_name: selectedBet.odd.type.toUpperCase() // Add selection name
      };

      // Send request to place bet with auth headers
      const response = await axios.post(`${BASE_URL}/betting/place`, betData, getAuthHeaders());
      
      if (response.data.success) {
        toast.success(response.data.message || 'Bet placed successfully!', {
          position: "top-right",
          autoClose: 3000
        });
        
        // Update wallet details
        if (response.data.data && response.data.data.wallet) {
          setWalletDetails(prevState => ({
            ...prevState,
            current_balance: response.data.data.wallet.current_balance,
            current_exposure: response.data.data.wallet.current_exposure
          }));
        } else {
          // Fetch fresh wallet details
          await fetchWalletDetails();
        }
        
        handleClose();
      } else {
        toast.error(response.data.message || 'Failed to place bet', {
          position: "top-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again', {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to place bet', {
          position: "top-right",
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
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
      
      {walletDetails && (
        <div className="wallet-info">
          <div className="wallet-balance">Balance: {walletDetails.current_balance}</div>
          <div className="wallet-exposure">Exposure: {walletDetails.current_exposure}</div>
        </div>
      )}
      
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
          onClick={() => setStake(walletDetails?.current_balance || 9189484)}
        >MAX</button>
      </div>
      
      <div className="action-buttons-grid">
        <button
          className="action-btn min"
          onClick={() => setStake(100)}
        >MIN STAKE</button>
        <button
          className="action-btn max"
          onClick={() => setStake(Math.min(25000, walletDetails?.current_balance || 25000))}
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
          disabled={loading}
        >
          {loading ? 'PLACING...' : 'PLACE BET'}
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