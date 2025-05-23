import React, { useEffect, useState } from 'react';
import './PlaceBet.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL ; // Adjust with your API URL

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

      let betTitle;
      // Get the selection name, checking multiple possible sources
      let selectionName = selectedBet.odd.sln || selectedBet.odd.name || selectedBet.odd.selection || selectedBet.odd.runnerName;
      
      // If runner information is available in the market data
      if (!selectionName && selectedBet.market.runnerName && selectedBet.odd.sid) {
        // Find the runner name that matches the selected sid
        const matchingRunner = selectedBet.market.runnerName.find(
          runner => runner.SID === selectedBet.odd.sid
        );
        if (matchingRunner) {
          selectionName = matchingRunner.RN;
        }
      }
      
      if (selectionName) {
        // Format: "Market Name Selection Name - BET_TYPE: odds"
        // Example: "Who Will Win The Match? Ireland - BACK: 2.9"
        betTitle = `${selectedBet.market.mn} ${selectionName} - ${selectedBet.odd.type.toUpperCase()}: ${selectedBet.odd.price}`;
      } else {
        // Fallback to original format if no selection name is available
        betTitle = `${selectedBet.market.mn} - ${selectedBet.odd.type.toUpperCase()}: ${selectedBet.odd.price}`;
      }

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
        selection_name: selectionName || selectedBet.odd.type.toUpperCase(), // Include selection name for all market types
        eventName: selectedBet.bookmakerOddData?.en || 
                  selectedBet.market?.bookmakerOddData?.en || 
                  selectedBet.match?.eventName ||
                  selectedBet.match?.fancyOddData?.en ||
                  selectedBet.fancyOddData?.en ||
                  selectedBet.eventName || 
                  selectedBet.event?.eventName || 
                  selectedBet.market?.en || 
                  selectedBet.market?.event?.eventName || 
                  '' // Prioritize bookmakerOddData.en for event name
      };

      // Add both team names if available
      // From bookmakerOddData
      if (selectedBet.bookmakerOddData?.ml && selectedBet.bookmakerOddData.ml.length > 0) {
        const bookmaker = selectedBet.bookmakerOddData.ml.find(item => item.id === Number(selectedBet.market.id));
        if (bookmaker && bookmaker.sl && bookmaker.sl.length >= 2) {
          betData.team1 = bookmaker.sl[0].sln || '';
          betData.team2 = bookmaker.sl[1].sln || '';
          // Set full match name if not already set
          if (!betData.eventName) {
            betData.eventName = `${betData.team1} v ${betData.team2}`;
          }
        }
      }
      // From matchOddData
      else if (selectedBet.matchOddData && selectedBet.matchOddData.length > 0) {
        const matchOdd = selectedBet.matchOddData.find(item => item.marketName === "Match Odds" || item.marketName === "Who Will Win The Match?");
        if (matchOdd && matchOdd.runnerName && matchOdd.runnerName.length >= 2) {
          betData.team1 = matchOdd.runnerName[0].RN || '';
          betData.team2 = matchOdd.runnerName[1].RN || '';
          // Set full match name if not already set
          if (!betData.eventName) {
            betData.eventName = `${betData.team1} v ${betData.team2}`;
          }
        }
      }
      // Extract from event name if available but team names aren't
      else if (betData.eventName && betData.eventName.includes(' v ')) {
        const teams = betData.eventName.split(' v ');
        if (teams.length >= 2) {
          betData.team1 = teams[0].trim();
          betData.team2 = teams[1].trim();
        }
      }
      
      // Always ensure eventName has the format "Team1 v Team2" if we have both teams
      if (betData.team1 && betData.team2 && (!betData.eventName || !betData.eventName.includes(betData.team1))) {
        betData.eventName = `${betData.team1} v ${betData.team2}`;
      }

      // Log for debugging
      console.log('Placing bet with data:', betData);

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