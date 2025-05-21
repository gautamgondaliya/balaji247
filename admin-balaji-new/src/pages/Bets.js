import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Cricket.css';
import '../styles/Payments.css';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const Bets = () => {
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentBetDetails, setCurrentBetDetails] = useState(null);
  const [isBetDetailsOpen, setIsBetDetailsOpen] = useState(false);
  
  // Add request interceptor to include token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login'); // Redirect to login
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      return Promise.reject(error);
    }
  );

  const fetchBets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/betting/grouped/all');
      
      // Transform the API response into the required format
      const transformedBets = response.data.data.flatMap(user => 
        user.bets.map(bet => ({
          id: bet.bet_id,
          userId: user.user_id,
          username: user.name,
          phone: user.phone,
          matchId: bet.market_id,
          match: bet.market_id, // You might want to fetch match details separately
          betType: bet.bet_type,
          selection: bet.bet_category,
          amount: parseFloat(bet.stake),
          odds: parseFloat(bet.current_bet_odds),
          potentialWin: parseFloat(bet.stake) * parseFloat(bet.current_bet_odds),
          status: bet.status.toUpperCase(),
          date: new Date(bet.created_at).toLocaleDateString(),
          time: new Date(bet.created_at).toLocaleTimeString()
        }))
      );

      setBets(transformedBets);
    } catch (err) {
      setError(err.message || 'Failed to fetch bets');
      console.error('Error fetching bets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBets();
  }, [navigate]);
  
  // Filter bets based on status and type
  const filteredBets = bets.filter(bet => {
    const statusMatch = statusFilter === 'All Status' || bet.status === statusFilter;
    const typeMatch = typeFilter === 'All Types' || bet.betType === typeFilter;
    return statusMatch && typeMatch;
  });
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };
  
  const handleTypeFilter = (type) => {
    setTypeFilter(type);
  };
  
  const viewBetDetails = (bet) => {
    setCurrentBetDetails(bet);
    setIsBetDetailsOpen(true);
  };
  
  const handleSetWin = async (betId) => {
    try {
      await api.post(`/betting/${betId}/settle`, {
        result_odds: currentBetDetails.odds,
        win: true
      });
      await fetchBets(); // Refresh bets after update
    } catch (err) {
      setError(err.message || 'Failed to set bet as won');
      console.error('Error setting bet as won:', err);
    }
  };
  
  const handleSetLoss = async (betId) => {
    try {
      await api.post(`/betting/${betId}/settle`, {
        result_odds: 0,
        win: false
      });
      await fetchBets(); // Refresh bets after update
    } catch (err) {
      setError(err.message || 'Failed to set bet as lost');
      console.error('Error setting bet as lost:', err);
    }
  };
  
  const statusClass = (status) => {
    switch(status) {
      case 'PENDING': return 'pending';
      case 'WON': return 'approved';
      case 'LOST': return 'rejected';
      default: return '';
    }
  };
  
  if (loading) {
    return (
      <div className="cricket-page">
        <div className="loading-spinner">Loading bets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cricket-page">
        <div className="error-message">
          Error: {error}
          <button onClick={fetchBets} className="retry-button">
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cricket-page">
      <div className="payment-management-header">
        <h1>
          <i className="fas fa-dice"></i> ALL BETS
        </h1>
        <button className="refresh-button" onClick={fetchBets}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      
      <div className="filters">
        <div className="dropdown">
          <button className="dropdown-btn">{statusFilter} <i className="fas fa-chevron-down"></i></button>
          <div className="dropdown-content">
            <a onClick={() => handleStatusFilter('All Status')}>All Status</a>
            <a onClick={() => handleStatusFilter('PENDING')}>PENDING</a>
            <a onClick={() => handleStatusFilter('WON')}>WON</a>
            <a onClick={() => handleStatusFilter('LOST')}>LOST</a>
          </div>
        </div>
        
        <div className="dropdown">
          <button className="dropdown-btn">{typeFilter} <i className="fas fa-chevron-down"></i></button>
          <div className="dropdown-content">
            <a onClick={() => handleTypeFilter('All Types')}>All Types</a>
            <a onClick={() => handleTypeFilter('Match Odds')}>Match Odds</a>
            <a onClick={() => handleTypeFilter('Over Market')}>Over Market</a>
          </div>
        </div>
      </div>
      
      <div className="bets-tab">
        <table className="bets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Match</th>
              <th>Bet Type</th>
              <th>Selection</th>
              <th>Amount</th>
              <th>Odds</th>
              <th>Potential Win</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBets.map(bet => (
              <tr key={bet.id}>
                <td>{bet.id}</td>
                <td>
                  <div className="user-cell">
                    <div>{bet.username}</div>
                    <div className="user-phone">{bet.phone}</div>
                  </div>
                </td>
                <td>{bet.match}</td>
                <td>{bet.betType}</td>
                <td>{bet.selection}</td>
                <td>₹ {bet.amount.toLocaleString()}</td>
                <td>{bet.odds}</td>
                <td>₹ {bet.potentialWin.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${statusClass(bet.status)}`}>
                    {bet.status}
                  </span>
                </td>
                <td>
                  <div className="date-cell">
                    <div>{bet.date}</div>
                    <div className="bet-time">{bet.time}</div>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => viewBetDetails(bet)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    
                    {bet.status === 'PENDING' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleSetWin(bet.id)}
                        >
                          <i className="fas fa-check"></i> Win
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleSetLoss(bet.id)}
                        >
                          <i className="fas fa-times"></i> Loss
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isBetDetailsOpen && currentBetDetails && (
        <div className="payment-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Bet Details</h2>
              <button 
                className="close-btn"
                onClick={() => setIsBetDetailsOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-detail">
                <span>ID:</span>
                <span>#{currentBetDetails.id}</span>
              </div>
              <div className="payment-detail">
                <span>User:</span>
                <span>{currentBetDetails.username}</span>
              </div>
              <div className="payment-detail">
                <span>Phone:</span>
                <span>{currentBetDetails.phone}</span>
              </div>
              <div className="payment-detail">
                <span>Match:</span>
                <span>{currentBetDetails.match}</span>
              </div>
              <div className="payment-detail">
                <span>Bet Type:</span>
                <span>{currentBetDetails.betType}</span>
              </div>
              <div className="payment-detail">
                <span>Selection:</span>
                <span>{currentBetDetails.selection}</span>
              </div>
              <div className="payment-detail">
                <span>Amount:</span>
                <span>₹ {currentBetDetails.amount.toLocaleString()}</span>
              </div>
              <div className="payment-detail">
                <span>Odds:</span>
                <span>{currentBetDetails.odds}</span>
              </div>
              <div className="payment-detail">
                <span>Potential Win:</span>
                <span>₹ {currentBetDetails.potentialWin.toLocaleString()}</span>
              </div>
              <div className="payment-detail">
                <span>Date & Time:</span>
                <span>{currentBetDetails.date} at {currentBetDetails.time}</span>
              </div>
              <div className="payment-detail">
                <span>Status:</span>
                <span className={`status-badge ${statusClass(currentBetDetails.status)}`}>
                  {currentBetDetails.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              {currentBetDetails.status === 'PENDING' && (
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => {
                      handleSetWin(currentBetDetails.id);
                      setIsBetDetailsOpen(false);
                    }}
                  >
                    <i className="fas fa-check"></i> Set as Win
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => {
                      handleSetLoss(currentBetDetails.id);
                      setIsBetDetailsOpen(false);
                    }}
                  >
                    <i className="fas fa-times"></i> Set as Loss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bets; 