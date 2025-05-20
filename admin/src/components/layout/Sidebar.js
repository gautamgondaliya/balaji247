import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Menu items based on API categories from the layer-based admin panel
  const menuItems = [
    { 
      title: 'Dashboard', 
      path: '/dashboard', 
      icon: '📊' 
    },
    { 
      title: 'User Management', 
      path: '/users', 
      icon: '🧑',
      subItems: [
        { title: 'All Users', path: '/users' },
        { title: 'User Hierarchy', path: '/users/hierarchy' },
        { title: 'User Commissions', path: '/users/commissions' },
      ]
    },
    { 
      title: 'Wallet Management', 
      path: '/wallet', 
      icon: '💰',
      subItems: [
        { title: 'Balances', path: '/wallet/balances' },
        { title: 'Transactions', path: '/wallet/transactions' }
      ]
    },
    {
      title: 'Deposit Management',
      path: '/deposits',
      icon: '💳',
      subItems: [
        { title: 'All Deposits', path: '/deposits' },
        { title: 'Pending Requests', path: '/deposits/pending' },
        { title: 'Approved Deposits', path: '/deposits/approved' },
      ]
    },
    {
      title: 'Withdrawal Management',
      path: '/withdrawals',
      icon: '💸',
      subItems: [
        { title: 'All Withdrawals', path: '/withdrawals' },
        { title: 'Pending Requests', path: '/withdrawals/pending' },
        { title: 'Approved Withdrawals', path: '/withdrawals/approved' },
      ]
    },
    { 
      title: 'Game Management', 
      path: '/games', 
      icon: '🎲',
      subItems: [
        { title: 'All Games', path: '/games' }
      ]
    },
    { 
      title: 'Betting Management', 
      path: '/bets', 
      icon: '🧾',
      subItems: [
        { title: 'All Bets', path: '/bets' },
        { title: 'Betting Data', path: '/bets/data' },
      ]
    },
    { 
      title: 'Commission Management', 
      path: '/commission', 
      icon: '📊',
      subItems: [
        { title: 'Commission Structure', path: '/commission/structure' },
      ]
    },
    { 
      title: 'Settings', 
      path: '/settings', 
      icon: '⚙️' 
    },
  ];

  // Track expanded menu sections
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'AP' : 'Admin Panel'}</h2>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <ul className="menu">
          {menuItems.map((item, index) => (
            <li key={index} className={`menu-item ${isActive(item.path) ? 'active' : ''}`}>
              {item.subItems ? (
                <>
                  <div 
                    className="menu-item-header" 
                    onClick={() => toggleSection(item.title)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="menu-title">{item.title}</span>
                        <span className="dropdown-icon">
                          {expandedSections[item.title] ? '▼' : '▶'}
                        </span>
                      </>
                    )}
                  </div>
                  {!collapsed && expandedSections[item.title] && (
                    <ul className="submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <li 
                          key={subIndex} 
                          className={`submenu-item ${isActive(subItem.path) ? 'active' : ''}`}
                        >
                          <Link to={subItem.path}>{subItem.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={item.path} className="menu-link">
                  <span className="menu-icon">{item.icon}</span>
                  {!collapsed && <span className="menu-title">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sidebar-footer">
        {!collapsed && <p>Layer-Based Admin Panel</p>}
      </div>
    </div>
  );
};

export default Sidebar; 