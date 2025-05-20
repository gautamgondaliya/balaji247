import React, { useState } from 'react';
import '../styles/Header.css';
import { toast } from 'react-toastify';

const Header = ({ user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New deposit request from Abhishek', time: '2 minutes ago', read: false },
    { id: 2, message: 'Withdrawal request approved', time: '1 hour ago', read: true },
    { id: 3, message: 'New user registered', time: '3 hours ago', read: true }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode logic here
    toast.info(`${isDarkMode ? 'Light' : 'Dark'} mode enabled`, {
      position: 'bottom-right',
      autoClose: 2000,
    });
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    
    toast.info('Notification marked as read', {
      position: 'bottom-right',
      autoClose: 1000,
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    
    toast.info('All notifications marked as read', {
      position: 'bottom-right',
      autoClose: 2000,
    });
  };
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <header className="header">
      <div className="search-container">
        <input type="text" placeholder="Search..." className="search-input" />
        <button className="search-button">
          <i className="fas fa-search"></i>
        </button>
      </div>
      
      <div className="header-controls">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </button>
        
        <div className="notification-container">
          <button className="notification-button" onClick={toggleNotifications}>
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {isNotificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllAsRead}>Mark all as read</button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {!notification.read && <div className="unread-indicator"></div>}
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-container">
          <button className="profile-button" onClick={toggleProfile}>
            <i className="fas fa-user"></i>
          </button>
          
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <h3>{user?.username || 'Admin'}</h3>
                <p>{user?.email || 'fastbet@gmail.com'}</p>
              </div>
              <div className="profile-actions">
                <a href="#" className="profile-action">
                  <i className="fas fa-user-cog"></i> Settings
                </a>
                <a href="#" className="profile-action">
                  <i className="fas fa-key"></i> Change Password
                </a>
                <a href="#" className="profile-action logout" onClick={onLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 