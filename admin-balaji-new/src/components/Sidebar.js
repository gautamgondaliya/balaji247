import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/bets', icon: 'fas fa-dice', label: 'Bets' },
    { path: '/payments', icon: 'fas fa-money-bill-wave', label: 'Payments' },
    { path: '/deposits', icon: 'fas fa-arrow-circle-down', label: 'Deposits' },
    { path: '/withdrawals', icon: 'fas fa-arrow-circle-up', label: 'Withdrawals' }
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>BALAJI CRICKET</h2>
        <p>Admin Panel</p>
      </div>
      
      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`menu-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
