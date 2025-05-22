import React, { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './BetHistory.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://backbalaji.dynexbet.com/api';

const BetHistory = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sportType, setSportType] = useState('Cricket');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userData, setUserData] = useState(null);

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
  
  // Get user data when component mounts
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserData(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Game types from Sidebar.js
  const gameTypes = [
    'Cricket',
    'Football',
    'Tennis',
    'Sports Book',
    'Matka',
    'Cricket Fight',
    'Casino',
    'Evolution',
    'FIFA CUP WINNER',
    'WINNER CUP',
  ];

  const handleGetStatement = async () => {
    // Get the most up-to-date user data directly from localStorage
    const userString = localStorage.getItem('user');
    let currentUser = null;
    
    if (userString) {
      try {
        currentUser = JSON.parse(userString);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Check if we have valid user information
    if (!currentUser) {
      console.log('No user data found in localStorage');
      toast.error('Please login to view your bet history', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    // Hard-code the userId if needed for testing (remove in production)
    // const testUserId = 'UN10';
    const userId = currentUser.user_id || currentUser.userId;
    
    if (!userId) {
      console.error('User ID not found in user data:', currentUser);
      toast.error('User ID not found. Please login again.', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    console.log(`Fetching betting history for user: ${userId}, sport type: ${sportType}`);
    setLoading(true);
    setSearched(true);
    
    try {
      // Construct the API endpoint
      const endpoint = `${BASE_URL}/betting/user/${userId}`;
      console.log('API Endpoint:', endpoint);
      
      // Make the API request
      console.log('Making API request with headers:', getAuthHeaders());
      const response = await axios.get(endpoint, getAuthHeaders());
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Get all betting data from the response
        const allBets = response.data.data || [];
        console.log('Received data items:', allBets.length);
        
        // For now, just show all bets without filtering by sport type
        // since the API response doesn't include a sport_type field
        setData(allBets);
        
        if (allBets.length === 0) {
          toast.info('No betting history found', {
            position: "top-right",
            autoClose: 3000
          });
        }
      } else {
        console.error('API returned error:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch betting history', {
          position: "top-right",
          autoClose: 3000
        });
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching betting history:', error);
      console.error('Error details:', error.response || error.message);
      toast.error(error.response?.data?.message || 'Error fetching betting history', {
        position: "top-right",
        autoClose: 3000
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bet-history-page">
      <div className="bet-history-header">
        <h2>BET HISTORY</h2>
      </div>
      
      <div className="bet-history-content">
        <div className="search-filters">
          <div className="date-filters">
            {/* <div className="date-input-group">
              <label>From Date</label>
              <div className="date-input">
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div> */}
            
            {/* <div className="date-input-group">
              <label>To Date</label>
              <div className="date-input">
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div> */}
          </div>
        </div>

        <div className="bet-history-btn-type">
          <div className="type-filter">
            <label>Type</label>
            <select value={sportType} onChange={(e) => setSportType(e.target.value)}>
              {gameTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <button className="get-statement-btn" onClick={handleGetStatement}>
            GET STATEMENT
          </button>
        </div>
        
        <div className="bet-history-results">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : searched ? (
            data.length === 0 ? (
              <div className="no-data">No Data Found</div>
            ) : (
              <table className="bet-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Market ID</th>
                    <th>Amount</th>
                    <th>Bet Type</th>
                    <th>Runs</th>
                    <th>Odd Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((bet, index) => (
                    <tr key={bet.id || index}>
                      <td>
                        {new Date(bet.created_at).toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td>{bet.market_id}</td>
                      <td>₹{parseFloat(bet.amount).toLocaleString()}</td>
                      <td>{bet.bet_type}</td>
                      <td>{bet.runs}</td>
                      <td>{bet.odd_type}</td>
                      <td>
                        <span className={`status-${bet.settlement_status}`}>
                          {bet.settlement_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BetHistory; 