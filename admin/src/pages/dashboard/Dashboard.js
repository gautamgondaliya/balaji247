import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Sample stats data
  const stats = [
    { 
      label: 'Total Users', 
      value: '1,245', 
      icon: '👥', 
      iconClass: 'blue',
      change: '+5.8%',
      period: 'since last month'
    },
    { 
      label: 'Active Bets', 
      value: '386', 
      icon: '🎲', 
      iconClass: 'green',
      change: '+2.4%',
      period: 'since yesterday'
    },
    { 
      label: 'System Balance', 
      value: '₹1.25M', 
      icon: '💰', 
      iconClass: 'purple',
      change: '+12.5%',
      period: 'since last week'
    },
    { 
      label: 'Commission Paid', 
      value: '₹234.5K', 
      icon: '📊', 
      iconClass: 'orange',
      change: '+8.2%',
      period: 'since last month'
    }
  ];

  // Sample recent bets data
  const recentBets = [
    { id: 'BET-1234', user: 'User 1', game: 'Teen Patti', amount: '₹500', status: 'Win', date: '12 Jun 2023', payout: '₹950' },
    { id: 'BET-1235', user: 'User 2', game: 'Andar Bahar', amount: '₹1000', status: 'Loss', date: '12 Jun 2023', payout: '₹0' },
    { id: 'BET-1236', user: 'User 3', game: 'Rummy', amount: '₹750', status: 'Win', date: '12 Jun 2023', payout: '₹1425' },
    { id: 'BET-1237', user: 'User 4', game: 'Teen Patti', amount: '₹250', status: 'Loss', date: '12 Jun 2023', payout: '₹0' },
    { id: 'BET-1238', user: 'User 5', game: 'Poker', amount: '₹1500', status: 'Win', date: '12 Jun 2023', payout: '₹2850' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'win':
        return 'badge-success';
      case 'loss':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card stat-card">
            <div className={`stat-icon ${stat.iconClass}`}>
              {stat.icon}
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">
              {stat.change} <span className="stat-period">{stat.period}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Bets</h2>
          <button className="btn btn-primary btn-sm">View All</button>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bet ID</th>
                <th>User</th>
                <th>Game</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>
              {recentBets.map((bet, index) => (
                <tr key={index}>
                  <td>{bet.id}</td>
                  <td>{bet.user}</td>
                  <td>{bet.game}</td>
                  <td>{bet.amount}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(bet.status)}`}>
                      {bet.status}
                    </span>
                  </td>
                  <td>{bet.date}</td>
                  <td>{bet.payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="row">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Games by Bets</h2>
          </div>
          <div className="card-content chart-container">
            {/* Chart would go here - using placeholder */}
            <div className="chart-placeholder">
              <div className="chart-bar" style={{ height: '80%' }}><span>Teen Patti</span></div>
              <div className="chart-bar" style={{ height: '60%' }}><span>Andar Bahar</span></div>
              <div className="chart-bar" style={{ height: '40%' }}><span>Rummy</span></div>
              <div className="chart-bar" style={{ height: '30%' }}><span>Poker</span></div>
              <div className="chart-bar" style={{ height: '20%' }}><span>Blackjack</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 