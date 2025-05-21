import React from 'react';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          <span className="welcome-text">Welcome,</span>
          <span className="user-name">{user.name || 'Admin'}</span>
          <span className="user-role">{user.role || 'Administrator'}</span>
        </div>
        
        <div className="header-actions">
          <button className="logout-button" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 