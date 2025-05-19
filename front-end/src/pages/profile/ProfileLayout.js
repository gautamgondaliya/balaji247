import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { FaUser, FaHistory, FaChartBar, FaFileAlt, FaCog, FaBell, FaLanguage, FaKey, FaChartLine } from 'react-icons/fa';
import './ProfileLayout.css';

const menuItems = [
  { label: 'Overview', icon: <FaUser />, path: '/profile/overview' },
  { label: 'Unsettled Bets', icon: <FaChartBar />, path: '/profile/unsettled' },
  { label: 'Bet History', icon: <FaHistory />, path: '/profile/history' },
  { label: 'Profit & Loss', icon: <FaChartLine />, path: '/profile/profit-loss' },
  { label: 'Account Statement', icon: <FaFileAlt />, path: '/profile/statement' },
  { label: 'Stake Settings', icon: <FaCog />, path: '/profile/settings' },
  { label: 'Notifications', icon: <FaBell />, path: '/profile/notifications' },
  { label: 'Language', icon: <FaLanguage />, path: '/profile/language' },
  { label: 'Change Password', icon: <FaKey />, path: '/profile/change-password' },
];

const ProfileLayout = () => {
  const location = useLocation();

  return (
    <div className="profile-layout">
      <div className="profile-sidebar">
        <div className="profile-menu">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`profile-menu-item${location.pathname === item.path ? ' active' : ''}`}
            >
              <span className="profile-menu-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout; 