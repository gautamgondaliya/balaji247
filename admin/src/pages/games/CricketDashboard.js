import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CricketDashboard.css';

const CricketDashboard = () => {
  // States for different data sections
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [betStatistics, setBetStatistics] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalBetAmount: 0,
    averageBetAmount: 0,
    betDistribution: {}
  });
  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    expectedProfitLoss: {},
    houseTake: 0,
    userProfit: {
      top5Users: [],
      top5Losers: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch live matches and statistics on component mount
  useEffect(() => {
    // Simulating API calls
    fetchLiveMatches();
    if (selectedMatch) {
      fetchMatchDetails(selectedMatch.id);
    }
  }, [selectedMatch]);
  
  // Fetch live cricket matches
  const fetchLiveMatches = () => {
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockLiveMatches = [
        {
          id: 'match001',
          teams: 'India vs Australia',
          tournament: 'T20 World Cup',
          startTime: '2023-11-15T14:30:00',
          status: 'Live',
          score: 'IND: 120/4 (15.2 ov) | AUS: Yet to bat',
          odds: {
            india: 1.8,
            australia: 2.1,
            draw: 5.5
          },
          totalBets: 256,
          totalAmount: 158000
        },
        {
          id: 'match002',
          teams: 'England vs South Africa',
          tournament: 'ODI Series',
          startTime: '2023-11-15T16:00:00',
          status: 'Live',
          score: 'ENG: 86/2 (12.0 ov) | SA: Yet to bat',
          odds: {
            england: 1.6,
            southAfrica: 2.4,
            draw: 6.2
          },
          totalBets: 157,
          totalAmount: 98500
        },
        {
          id: 'match003',
          teams: 'Pakistan vs New Zealand',
          tournament: 'Test Series',
          startTime: '2023-11-16T09:30:00',
          status: 'Upcoming',
          score: 'Match yet to begin',
          odds: {
            pakistan: 2.1,
            newZealand: 1.9,
            draw: 3.8
          },
          totalBets: 89,
          totalAmount: 75200
        }
      ];
      
      setLiveMatches(mockLiveMatches);
      
      // Set first match as selected by default if none selected
      if (!selectedMatch && mockLiveMatches.length > 0) {
        setSelectedMatch(mockLiveMatches[0]);
        fetchMatchDetails(mockLiveMatches[0].id);
      } else {
        setIsLoading(false);
      }
    }, 800);
  };
  
  // Fetch detailed information for a specific match
  const fetchMatchDetails = (matchId) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      // Sample user bets for the selected match
      const mockUserBets = [
        {
          id: 'bet001',
          userId: 'USR001',
          userName: 'Rahul Sharma',
          betAmount: 5000,
          betOn: 'India',
          odds: 1.8,
          potentialWin: 9000,
          placedAt: '2023-11-15T14:35:12',
          status: 'Active'
        },
        {
          id: 'bet002',
          userId: 'USR002',
          userName: 'Priya Patel',
          betAmount: 10000,
          betOn: 'Australia',
          odds: 2.1,
          potentialWin: 21000,
          placedAt: '2023-11-15T14:40:05',
          status: 'Active'
        },
        {
          id: 'bet003',
          userId: 'USR003',
          userName: 'Vikram Singh',
          betAmount: 8500,
          betOn: 'India',
          odds: 1.8,
          potentialWin: 15300,
          placedAt: '2023-11-15T14:45:30',
          status: 'Active'
        },
        {
          id: 'bet004',
          userId: 'USR005',
          userName: 'Rajesh Kumar',
          betAmount: 3000,
          betOn: 'Draw',
          odds: 5.5,
          potentialWin: 16500,
          placedAt: '2023-11-15T14:47:10',
          status: 'Active'
        },
        {
          id: 'bet005',
          userId: 'USR006',
          userName: 'Amit Shah',
          betAmount: 2500,
          betOn: 'India',
          odds: 1.8,
          potentialWin: 4500,
          placedAt: '2023-11-15T14:52:22',
          status: 'Active'
        }
      ];
      
      // Betting statistics
      const mockBetStatistics = {
        totalUsers: 125,
        totalBets: 256,
        totalBetAmount: 158000,
        averageBetAmount: 617,
        betDistribution: {
          india: {
            count: 156,
            amount: 98000,
            percentage: 62
          },
          australia: {
            count: 87,
            amount: 54000,
            percentage: 34
          },
          draw: {
            count: 13,
            amount: 6000,
            percentage: 4
          }
        }
      };
      
      // Transaction statistics
      const mockTransactionStats = {
        totalTransactions: 256,
        totalDeposits: 185000,
        totalWithdrawals: 27000,
        expectedProfitLoss: {
          indiaWin: -42000,
          australiaWin: 78000,
          draw: 152000
        },
        houseTake: 7900, // 5% commission
        userProfit: {
          top5Users: [
            { userId: 'USR002', userName: 'Priya Patel', profit: 21000 },
            { userId: 'USR004', userName: 'Ananya Desai', profit: 15800 },
            { userId: 'USR003', userName: 'Vikram Singh', profit: 15300 },
            { userId: 'USR001', userName: 'Rahul Sharma', profit: 9000 },
            { userId: 'USR006', userName: 'Amit Shah', profit: 4500 }
          ],
          top5Losers: [
            { userId: 'USR007', userName: 'Deepak Gupta', loss: 12000 },
            { userId: 'USR008', userName: 'Neha Verma', loss: 8500 },
            { userId: 'USR010', userName: 'Kiran Rao', loss: 7500 },
            { userId: 'USR012', userName: 'Suresh Raina', loss: 6000 },
            { userId: 'USR015', userName: 'Manish Tiwari', loss: 5500 }
          ]
        }
      };
      
      setUserBets(mockUserBets);
      setBetStatistics(mockBetStatistics);
      setTransactionStats(mockTransactionStats);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle match selection
  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate time remaining or elapsed
  const getMatchTimeStatus = (startTime) => {
    const startDate = new Date(startTime);
    const now = new Date();
    const diffMs = now - startDate;
    
    if (diffMs < 0) {
      // Match hasn't started yet
      const minutes = Math.floor(Math.abs(diffMs) / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `Starts in ${hours}h ${minutes % 60}m`;
      }
      return `Starts in ${minutes}m`;
    } else {
      // Match is ongoing
      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m elapsed`;
      }
      return `${minutes}m elapsed`;
    }
  };
  
  // Loading state
  if (isLoading) {
    return <div className="loading-spinner"></div>;
  }
  
  // No live matches state
  if (liveMatches.length === 0) {
    return (
      <div className="cricket-dashboard-container">
        <div className="cricket-dashboard-header">
          <h1 className="page-title">Cricket Dashboard</h1>
          <Link to="/games" className="btn btn-secondary">Back to Games</Link>
        </div>
        
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏏</div>
            <h2>No Live Matches</h2>
            <p>There are currently no live cricket matches available.</p>
            <p>Check back later for upcoming matches!</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cricket-dashboard-container">
      <div className="cricket-dashboard-header">
        <h1 className="page-title">Cricket Dashboard</h1>
        <Link to="/games" className="btn btn-secondary">Back to Games</Link>
      </div>
      
      {/* Live Matches Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Live Cricket Matches</h2>
        </div>
        
        <div className="live-matches-container">
          {liveMatches.map(match => (
            <div
              key={match.id}
              className={`match-card ${selectedMatch && selectedMatch.id === match.id ? 'selected' : ''} ${match.status === 'Live' ? 'live' : ''}`}
              onClick={() => handleMatchSelect(match)}
            >
              <div className="match-status-badge">{match.status}</div>
              <h3 className="match-teams">{match.teams}</h3>
              <div className="match-tournament">{match.tournament}</div>
              <div className="match-time">{getMatchTimeStatus(match.startTime)}</div>
              <div className="match-score">{match.score}</div>
              <div className="match-stats">
                <div className="match-stat">
                  <div className="stat-label">Bets</div>
                  <div className="stat-value">{match.totalBets}</div>
                </div>
                <div className="match-stat">
                  <div className="stat-label">Amount</div>
                  <div className="stat-value">{formatCurrency(match.totalAmount)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedMatch && (
        <>
          {/* Match Overview Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Match Overview: {selectedMatch.teams}</h2>
            </div>
            
            <div className="match-overview">
              <div className="match-details">
                <div className="detail-row">
                  <div className="detail-label">Tournament</div>
                  <div className="detail-value">{selectedMatch.tournament}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Start Time</div>
                  <div className="detail-value">{formatDate(selectedMatch.startTime)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">{selectedMatch.status}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Current Score</div>
                  <div className="detail-value">{selectedMatch.score}</div>
                </div>
              </div>
              
              <div className="match-odds">
                <h3>Current Odds</h3>
                <div className="odds-container">
                  {Object.entries(selectedMatch.odds).map(([team, odd]) => (
                    <div key={team} className="odd-item">
                      <div className="team-name">{team.charAt(0).toUpperCase() + team.slice(1)}</div>
                      <div className="odd-value">{odd}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Betting Statistics Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Betting Statistics</h2>
            </div>
            
            <div className="betting-statistics">
              <div className="stats-summary">
                <div className="stat-box">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-number">{betStatistics.totalUsers}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">Total Bets</div>
                  <div className="stat-number">{betStatistics.totalBets}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">Total Amount</div>
                  <div className="stat-number">{formatCurrency(betStatistics.totalBetAmount)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">Average Bet</div>
                  <div className="stat-number">{formatCurrency(betStatistics.averageBetAmount)}</div>
                </div>
              </div>
              
              <div className="bet-distribution">
                <h3>Bet Distribution</h3>
                <div className="distribution-bars">
                  {Object.keys(betStatistics.betDistribution).length > 0 ? (
                    Object.entries(betStatistics.betDistribution).map(([team, data]) => (
                      <div key={team} className="distribution-item">
                        <div className="team-name">{team.charAt(0).toUpperCase() + team.slice(1)}</div>
                        <div className="distribution-bar-container">
                          <div 
                            className="distribution-bar"
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                          <span className="distribution-percentage">{data.percentage}%</span>
                        </div>
                        <div className="distribution-details">
                          <div>{data.count} bets</div>
                          <div>{formatCurrency(data.amount)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No bet distribution data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* User Bets Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent User Bets</h2>
              <button className="btn btn-primary btn-sm">View All Bets</button>
            </div>
            
            <div className="table-container">
              <table className="bets-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Bet Amount</th>
                    <th>Bet On</th>
                    <th>Odds</th>
                    <th>Potential Win</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBets.map(bet => (
                    <tr key={bet.id}>
                      <td>{bet.userName}</td>
                      <td className="amount-cell">{formatCurrency(bet.betAmount)}</td>
                      <td>{bet.betOn}</td>
                      <td>{bet.odds}</td>
                      <td className="amount-cell positive">{formatCurrency(bet.potentialWin)}</td>
                      <td>{formatDate(bet.placedAt)}</td>
                      <td>
                        <span className={`status-badge status-${bet.status.toLowerCase()}`}>
                          {bet.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Transaction Statistics Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Transaction Statistics</h2>
            </div>
            
            <div className="transaction-statistics">
              <div className="stats-summary">
                <div className="stat-box">
                  <div className="stat-title">Total Transactions</div>
                  <div className="stat-number">{transactionStats.totalTransactions}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">Total Deposits</div>
                  <div className="stat-number positive">{formatCurrency(transactionStats.totalDeposits)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">Total Withdrawals</div>
                  <div className="stat-number negative">{formatCurrency(transactionStats.totalWithdrawals)}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-title">House Commission</div>
                  <div className="stat-number positive">{formatCurrency(transactionStats.houseTake)}</div>
                </div>
              </div>
              
              <div className="profit-loss-section">
                <h3>Expected Profit/Loss Scenarios</h3>
                <div className="profit-loss-scenarios">
                  {Object.keys(transactionStats.expectedProfitLoss).length > 0 ? (
                    Object.entries(transactionStats.expectedProfitLoss).map(([outcome, amount]) => (
                      <div key={outcome} className="scenario-item">
                        <div className="scenario-name">
                          {outcome.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className={`scenario-amount ${amount >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No profit/loss scenario data available</div>
                  )}
                </div>
              </div>
              
              <div className="user-performance">
                <div className="user-winners">
                  <h3>Top 5 Potential Winners</h3>
                  <div className="user-list">
                    {transactionStats.userProfit.top5Users && transactionStats.userProfit.top5Users.length > 0 ? (
                      transactionStats.userProfit.top5Users.map((user, index) => (
                        <div key={index} className="user-item">
                          <div className="user-rank">{index + 1}</div>
                          <div className="user-name">{user.userName}</div>
                          <div className="user-amount positive">{formatCurrency(user.profit)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data-message">No winner data available</div>
                    )}
                  </div>
                </div>
                
                <div className="user-losers">
                  <h3>Top 5 Potential Losers</h3>
                  <div className="user-list">
                    {transactionStats.userProfit.top5Losers && transactionStats.userProfit.top5Losers.length > 0 ? (
                      transactionStats.userProfit.top5Losers.map((user, index) => (
                        <div key={index} className="user-item">
                          <div className="user-rank">{index + 1}</div>
                          <div className="user-name">{user.userName}</div>
                          <div className="user-amount negative">{formatCurrency(user.loss)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data-message">No loser data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CricketDashboard; 