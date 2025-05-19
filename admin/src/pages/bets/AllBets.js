import React, { useState, useEffect } from 'react';
import './AllBets.css';

const AllBets = () => {
  // State for bets data
  const [bets, setBets] = useState([]);
  const [filteredBets, setFilteredBets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Filter states
  const [filters, setFilters] = useState({
    gameType: 'All Games',
    status: 'All',
    dateFrom: '',
    dateTo: '',
    userId: '',
    betId: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Sample game types for filter
  const gameTypes = [
    'All Games',
    'Cricket',
    'Football',
    'Tennis',
    'Casino',
    'Multi Market',
    'Sports Book',
    'Matka'
  ];
  
  // Sample bet statuses
  const betStatuses = [
    'All',
    'Active',
    'Settled',
    'Won',
    'Lost',
    'Cancelled',
    'Void'
  ];
  
  // Sample bets data - would be fetched from API in real app
  const sampleBets = [
    {
      id: 'BET00001',
      userId: 'USR001',
      userName: 'Rahul Sharma',
      userRole: 'Client',
      gameType: 'Cricket',
      event: 'India vs Australia - T20 World Cup',
      selection: 'India',
      odds: 1.85,
      stake: 5000,
      potentialWin: 9250,
      result: null, // null means bet is still active
      status: 'Active',
      placedDate: '2023-11-15T14:35:12',
      settledDate: null
    },
    {
      id: 'BET00002',
      userId: 'USR002',
      userName: 'Priya Patel',
      userRole: 'Client',
      gameType: 'Football',
      event: 'Manchester City vs Chelsea - Premier League',
      selection: 'Manchester City',
      odds: 2.1,
      stake: 3000,
      potentialWin: 6300,
      result: 'Won', 
      status: 'Settled',
      placedDate: '2023-11-15T12:40:05',
      settledDate: '2023-11-15T14:45:10'
    },
    {
      id: 'BET00003',
      userId: 'USR003',
      userName: 'Vikram Singh',
      userRole: 'Client',
      gameType: 'Cricket',
      event: 'India vs Australia - T20 World Cup',
      selection: 'Australia',
      odds: 2.1,
      stake: 8500,
      potentialWin: 17850,
      result: null,
      status: 'Active',
      placedDate: '2023-11-15T15:05:30',
      settledDate: null
    },
    {
      id: 'BET00004',
      userId: 'USR004',
      userName: 'Ananya Desai',
      userRole: 'Client',
      gameType: 'Tennis',
      event: 'Novak Djokovic vs Rafael Nadal - ATP Finals',
      selection: 'Novak Djokovic',
      odds: 1.75,
      stake: 10000,
      potentialWin: 17500,
      result: 'Lost',
      status: 'Settled',
      placedDate: '2023-11-14T16:30:00',
      settledDate: '2023-11-14T19:15:22'
    },
    {
      id: 'BET00005',
      userId: 'USR005',
      userName: 'Rajesh Kumar',
      userRole: 'Client',
      gameType: 'Casino',
      event: 'Roulette',
      selection: 'Red',
      odds: 2.0,
      stake: 2000,
      potentialWin: 4000,
      result: 'Won',
      status: 'Settled',
      placedDate: '2023-11-15T13:25:45',
      settledDate: '2023-11-15T13:26:10'
    },
    {
      id: 'BET00006',
      userId: 'USR006',
      userName: 'Amit Shah',
      userRole: 'Client',
      gameType: 'Multi Market',
      event: 'IPL Special - Top Batsman',
      selection: 'Virat Kohli',
      odds: 3.5,
      stake: 1500,
      potentialWin: 5250,
      result: null,
      status: 'Active',
      placedDate: '2023-11-15T11:05:30',
      settledDate: null
    },
    {
      id: 'BET00007',
      userId: 'USR007',
      userName: 'Neha Sharma',
      userRole: 'Client',
      gameType: 'Football',
      event: 'Liverpool vs Arsenal - Premier League',
      selection: 'Draw',
      odds: 3.2,
      stake: 2000,
      potentialWin: 6400,
      result: 'Lost',
      status: 'Settled',
      placedDate: '2023-11-14T20:15:00',
      settledDate: '2023-11-14T22:10:12'
    },
    {
      id: 'BET00008',
      userId: 'USR008',
      userName: 'Ravi Patel',
      userRole: 'Client',
      gameType: 'Cricket',
      event: 'England vs South Africa - ODI Series',
      selection: 'England',
      odds: 1.65,
      stake: 4000,
      potentialWin: 6600,
      result: null,
      status: 'Active',
      placedDate: '2023-11-15T09:45:22',
      settledDate: null
    },
    {
      id: 'BET00009',
      userId: 'USR009',
      userName: 'Kiran Rao',
      userRole: 'Client',
      gameType: 'Sports Book',
      event: 'NBA - LA Lakers vs Chicago Bulls',
      selection: 'LA Lakers (-5.5)',
      odds: 1.9,
      stake: 3500,
      potentialWin: 6650,
      result: 'Won',
      status: 'Settled',
      placedDate: '2023-11-14T08:30:40',
      settledDate: '2023-11-14T11:20:15'
    },
    {
      id: 'BET00010',
      userId: 'USR010',
      userName: 'Arjun Kapoor',
      userRole: 'Client',
      gameType: 'Matka',
      event: 'Kalyan Matka',
      selection: '245-1',
      odds: 90.0,
      stake: 100,
      potentialWin: 9000,
      result: 'Lost',
      status: 'Settled',
      placedDate: '2023-11-15T14:00:10',
      settledDate: '2023-11-15T14:30:00'
    },
    {
      id: 'BET00011',
      userId: 'USR001',
      userName: 'Rahul Sharma',
      userRole: 'Client',
      gameType: 'Cricket',
      event: 'Pakistan vs New Zealand - Test Series',
      selection: 'Draw',
      odds: 3.8,
      stake: 2000,
      potentialWin: 7600,
      result: null,
      status: 'Active',
      placedDate: '2023-11-15T16:10:00',
      settledDate: null
    },
    {
      id: 'BET00012',
      userId: 'USR002',
      userName: 'Priya Patel',
      userRole: 'Client',
      gameType: 'Tennis',
      event: 'Serena Williams vs Naomi Osaka - Grand Slam',
      selection: 'Naomi Osaka',
      odds: 2.2,
      stake: 4500,
      potentialWin: 9900,
      result: 'Void', 
      status: 'Cancelled',
      placedDate: '2023-11-14T16:50:30',
      settledDate: '2023-11-14T17:30:00'
    }
  ];
  
  // Load bets on component mount
  useEffect(() => {
    fetchBets();
  }, []);
  
  // Apply filters when filters or bets change
  useEffect(() => {
    applyFilters();
  }, [filters, bets]);
  
  // Fetch bets (simulated API call)
  const fetchBets = () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      setBets(sampleBets);
      setLastRefresh(new Date());
      setIsLoading(false);
    }, 800);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      gameType: 'All Games',
      status: 'All',
      dateFrom: '',
      dateTo: '',
      userId: '',
      betId: '',
      minAmount: '',
      maxAmount: ''
    });
  };
  
  // Apply filters to bets
  const applyFilters = () => {
    let filtered = [...bets];
    
    // Filter by game type
    if (filters.gameType !== 'All Games') {
      filtered = filtered.filter(bet => bet.gameType === filters.gameType);
    }
    
    // Filter by status
    if (filters.status !== 'All') {
      filtered = filtered.filter(bet => bet.status === filters.status);
    }
    
    // Filter by user ID or name
    if (filters.userId) {
      const term = filters.userId.toLowerCase();
      filtered = filtered.filter(
        bet => bet.userId.toLowerCase().includes(term) || 
               bet.userName.toLowerCase().includes(term)
      );
    }
    
    // Filter by bet ID
    if (filters.betId) {
      filtered = filtered.filter(bet => bet.id.toLowerCase().includes(filters.betId.toLowerCase()));
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom + 'T00:00:00');
      filtered = filtered.filter(bet => new Date(bet.placedDate) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo + 'T23:59:59');
      filtered = filtered.filter(bet => new Date(bet.placedDate) <= toDate);
    }
    
    // Filter by amount range
    if (filters.minAmount) {
      filtered = filtered.filter(bet => bet.stake >= parseFloat(filters.minAmount));
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(bet => bet.stake <= parseFloat(filters.maxAmount));
    }
    
    setFilteredBets(filtered);
  };
  
  // Handle refresh click
  const handleRefresh = () => {
    fetchBets();
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate bet statistics
  const betStatistics = {
    total: filteredBets.length,
    active: filteredBets.filter(bet => bet.status === 'Active').length,
    settled: filteredBets.filter(bet => bet.status === 'Settled').length,
    won: filteredBets.filter(bet => bet.result === 'Won').length,
    lost: filteredBets.filter(bet => bet.result === 'Lost').length,
    cancelled: filteredBets.filter(bet => bet.status === 'Cancelled').length,
    totalStake: filteredBets.reduce((sum, bet) => sum + bet.stake, 0),
    potentialLiability: filteredBets
      .filter(bet => bet.status === 'Active')
      .reduce((sum, bet) => sum + (bet.potentialWin - bet.stake), 0)
  };
  
  return (
    <div className="all-bets-container">
      <div className="all-bets-header">
        <h1 className="page-title">All Bets</h1>
        <button className="btn btn-primary refresh-btn" onClick={handleRefresh}>
          <span className="refresh-icon">↻</span> Refresh
        </button>
      </div>
      
      {/* Bet Statistics */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Bet Statistics</h2>
          <div className="last-refresh">
            Last refreshed: {formatDate(lastRefresh)}
          </div>
        </div>
        
        <div className="bet-statistics">
          <div className="stat-item total">
            <div className="stat-value">{betStatistics.total}</div>
            <div className="stat-label">Total Bets</div>
          </div>
          <div className="stat-item active">
            <div className="stat-value">{betStatistics.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-item settled">
            <div className="stat-value">{betStatistics.settled}</div>
            <div className="stat-label">Settled</div>
          </div>
          <div className="stat-item won">
            <div className="stat-value">{betStatistics.won}</div>
            <div className="stat-label">Won</div>
          </div>
          <div className="stat-item lost">
            <div className="stat-value">{betStatistics.lost}</div>
            <div className="stat-label">Lost</div>
          </div>
          <div className="stat-item cancelled">
            <div className="stat-value">{betStatistics.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
          <div className="stat-item stake">
            <div className="stat-value">{formatCurrency(betStatistics.totalStake)}</div>
            <div className="stat-label">Total Stake</div>
          </div>
          <div className="stat-item liability">
            <div className="stat-value">{formatCurrency(betStatistics.potentialLiability)}</div>
            <div className="stat-label">Potential Liability</div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Filters</h2>
          <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
        </div>
        
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Game Type</label>
              <select
                name="gameType"
                value={filters.gameType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {gameTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {betStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Bet ID</label>
              <input
                type="text"
                name="betId"
                value={filters.betId}
                onChange={handleFilterChange}
                placeholder="Search by ID..."
                className="filter-input"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>User ID/Name</label>
              <input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Search user..."
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Amount</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="Min stake..."
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Max Amount</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="Max stake..."
                className="filter-input"
              />
            </div>
            
            <div className="filter-actions">
              <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
              <button className="btn btn-secondary" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bets Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Bet List</h2>
          <div className="table-actions">
            <button className="btn btn-secondary">Export CSV</button>
            <button className="btn btn-secondary">Print</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="table-container">
            {filteredBets.length > 0 ? (
              <table className="bets-table">
                <thead>
                  <tr>
                    <th>Bet ID</th>
                    <th>User</th>
                    <th>Game</th>
                    <th>Event</th>
                    <th>Selection</th>
                    <th>Odds</th>
                    <th>Stake</th>
                    <th>Potential Win</th>
                    <th>Placed Time</th>
                    <th>Status</th>
                    <th>Result</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBets.map(bet => (
                    <tr key={bet.id} className={bet.status.toLowerCase()}>
                      <td>{bet.id}</td>
                      <td>{bet.userName}</td>
                      <td>{bet.gameType}</td>
                      <td className="event-cell">
                        <div className="event-name">{bet.event}</div>
                      </td>
                      <td>{bet.selection}</td>
                      <td>{bet.odds}</td>
                      <td className="amount-cell">{formatCurrency(bet.stake)}</td>
                      <td className="amount-cell">{formatCurrency(bet.potentialWin)}</td>
                      <td>{formatDate(bet.placedDate)}</td>
                      <td>
                        <span className={`status-badge status-${bet.status.toLowerCase()}`}>
                          {bet.status}
                        </span>
                      </td>
                      <td>
                        {bet.result ? (
                          <span className={`result-badge result-${bet.result.toLowerCase()}`}>
                            {bet.result}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="actions-cell">
                        <button className="btn btn-primary btn-sm">View</button>
                        {bet.status === 'Active' && (
                          <button className="btn btn-danger btn-sm">Void</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎫</div>
                <h3>No bets found</h3>
                <p>Try adjusting your filters or refresh to see the latest bets.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBets; 