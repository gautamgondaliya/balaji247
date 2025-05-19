import React from 'react';
import { FaHome, FaPlayCircle, FaBullseye, FaFutbol, FaTableTennis, FaShieldAlt, FaDice, FaCrown, FaTrophy, FaVoteYea } from 'react-icons/fa';
import './BottomNavBar.css';

const navItems = [
  { label: 'HOME', icon: <FaHome />, color: '#8e44ad' },
  { label: 'IN-PLAY', icon: <FaPlayCircle />, color: '#e67e22' },
  { label: 'CRICKET', icon: <FaBullseye />, color: '#e84393' },
  { label: 'FOOTBALL', icon: <FaFutbol />, color: '#2ecc40' },
  { label: 'TENNIS', icon: <FaTableTennis />, color: '#27ae60' },
  { label: 'SPORTS BOOK', icon: <FaShieldAlt />, color: '#f1c40f' },
  { label: 'MATKA', icon: <FaBullseye />, color: '#00b894' },
  { label: 'CASINO', icon: <FaDice />, color: '#2980b9' },
  { label: 'WINNER CUP', icon: <FaCrown />, color: '#f7ca18' },
  { label: 'FIFA CUP', icon: <FaTrophy />, color: '#f4d03f' },
  { label: 'ELECTION', icon: <FaVoteYea />, color: '#e74c3c' },
  
];

const BottomNavBar = () => (
  <nav className="bottom-nav-bar">
    {navItems.map(item => (
      <div className="bottom-nav-item" key={item.label}>
        <span className="bottom-nav-icon" style={{ color: item.color }}>{React.cloneElement(item.icon, { color: item.color })}</span>
        <span className="bottom-nav-label">{item.label}</span>
      </div>
    ))}
  </nav>
);

export default BottomNavBar; 