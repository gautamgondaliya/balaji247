import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import Logo_Reddy_book from "../assets/Images/logo.png"

const categories = [
  { label: 'Multi Market', icon: '🔔' },
  { label: 'Cricket', icon: '🏏' },
  { label: 'Football', icon: '⚽' },
  { label: 'Tennis', icon: '🎾' },
  { label: 'Sports Book', icon: '🛡️' },
  { label: 'Matka', icon: '🎯' },
  { label: 'Cricket Fight', icon: '🏏' },
  { label: 'Casino', icon: '🎰' },
  { label: 'Evolution', icon: '🏛️' },
  { label: 'FIFA CUP WINNER', icon: '🏆' },
  { label: 'WINNER CUP', icon: '🥇' },
];

const Sidebar = ({ onCategorySelect }) => {
  const [active, setActive] = useState('Multi Market');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="rb-sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`rb-sidebar-overlay${isOpen ? ' open' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`rb-sidebar${isOpen ? ' open' : ''}`}>
        <div className="rb-sidebar-header">
          <img src={Logo_Reddy_book} alt="Reddy Book" className="rb-sidebar-logo" />
          <button className="rb-sidebar-close" onClick={toggleSidebar}>✕</button>
        </div>
        <ul className="rb-sidebar-list">
          {categories.map(cat => (
            <li
              key={cat.label}
              className={`rb-sidebar-item${active === cat.label ? ' active' : ''}`}
              onClick={() => {
                setActive(cat.label);
                if (onCategorySelect) onCategorySelect(cat.label);
                navigate('/');
                if (window.innerWidth < 1000) {
                  setIsOpen(false);
                }
              }}
            >
              <span className="rb-sidebar-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar; 