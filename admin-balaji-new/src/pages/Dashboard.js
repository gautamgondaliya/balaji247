import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Total Users', value: '254', icon: 'users' },
    { title: 'Active Users', value: '198', icon: 'user-check' },
    { title: 'Total Bets', value: '1,254', icon: 'dice' }
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">
              <i className={`fas fa-${stat.icon}`}></i>
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <p><strong>User #123</strong> placed a bet of ₹5,000 on IPL match</p>
            <span className="activity-time">2 minutes ago</span>
          </div>
          <div className="activity-item">
            <p><strong>User #194</strong> deposited ₹10,000</p>
            <span className="activity-time">15 minutes ago</span>
          </div>
          <div className="activity-item">
            <p><strong>User #87</strong> requested withdrawal of ₹2,500</p>
            <span className="activity-time">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 