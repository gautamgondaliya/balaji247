import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Mock user data - would come from context or state in a real app
  const user = {
    name: 'Admin User',
    role: 'Administrator',
    avatar: '👤'
  };

  const handleLogout = () => {
    // Remove tokens/user data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>Layer-Based Admin Panel</h1>
      </div>
      
      <div className="header-search">
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-input"
        />
        <button className="search-btn">🔍</button>
      </div>
      
      <div className="header-actions">
        <div className="notification-icon">
          🔔
          <span className="notification-badge">3</span>
        </div>
        
        <div className="profile-dropdown">
          <div className="profile-info" onClick={toggleProfileMenu}>
            <span className="avatar">{user.avatar}</span>
            <span className="user-name">{user.name}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {showProfileMenu && (
            <div className="profile-menu">
              <ul>
                <li>
                  <button onClick={() => navigate('/profile')}>
                    My Profile
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/settings')}>
                    Settings
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 