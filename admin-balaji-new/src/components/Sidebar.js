import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ setCurrentPage, currentPage }) => {
  const admin = {
    email: 'fastbet@gmail.com',
    role: 'Admin'
  };

  // Menu items for the sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'cricket', label: 'Cricket Market', icon: 'cricket-ball' },
    { id: 'users', label: 'All Users', icon: 'users' },
    { id: 'payments', label: 'Payment Management', icon: 'money-bill' },
    { id: 'deposits', label: 'Deposits', icon: 'arrow-circle-down' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'arrow-circle-up' },
    { id: 'results', label: 'Result Declaration', icon: 'trophy' },
    { id: 'bets', label: 'All Bets', icon: 'dice' },
  
  ];

  return (
    <div className="sidebar">
      <div className="admin-profile">
        <div className="avatar-container">
          <i className="fas fa-user avatar"></i>
        </div>
        <div className="admin-info">
          <h3>{admin.email}</h3>
          <p className="admin-role">{admin.role}</p>
        </div>
      </div>
      <div className="admin-access">Admin Access</div>
      <ul className="nav-links">
        {menuItems.map((item) => (
          <li key={item.id} className={currentPage === item.id ? 'active' : ''}>
            <button 
              onClick={() => setCurrentPage(item.id)}
              className="nav-link"
            >
              <i className={`fas fa-${item.icon}`}></i> {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
