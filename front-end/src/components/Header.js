import React, { useState, useRef, useEffect } from 'react';
import LoginModal from './LoginModal';
import AccountDropdown from './AccountDropdown';
import "./Header.css";
import Logo_reddy_book from "../assets/Images/logo.png"
import { CiUser } from "react-icons/ci";
// You can replace these with react-icons or SVGs later
const navItems = [
  { label: 'HOME' },
  { label: 'IN-PLAY' },
  { label: 'CRICKET' },
  { label: 'FOOTBALL' },
  { label: 'TENNIS' },
  { label: 'SPORTS BOOK' },
  { label: 'MATKA' },
  { label: 'CRICKET FIGHT' },
  { label: 'CASINO' },
  { label: 'EVOLUTION' },
  { label: 'FIFA CUP WINNER' },
  { label: 'WINNER CUP' },
  { label: 'ELECTION' },
];

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const userRef = useRef();

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    // Set the localStorage flag to indicate user interaction
    localStorage.setItem('modalShouldBeOpen', 'true');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowAccount(false);
      }
    };
    if (showAccount) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccount]);

  return (
    <>
    
    <header className="rb-header">
    <div className="rb-header-main">

    <div className="rb-header-left">
      {/* Logo */}
      <div className="rb-header-logo">
        {/* <img src={Logo_reddy_book} alt="logo" /> */}
        <h1 className="rb-header-logo-main-txt">Balaji 247</h1>
      </div>
      {/* Search Bar */}
      <div className="rb-header-search">
        <input type="text" placeholder="Search Events" />
        <span className="rb-header-search-icon">&#128269;</span>
      </div>
      </div>
      {/* Right Side: BAL, EXP, User or Login Button */}
      <div className="rb-header-right">
        {isLoggedIn ? (
          <>
            <div className="rd-badge-continer">
            <div className="rb-header-badge">
              <div className="rd-title-badge">BAL</div>
             
            </div>
             <div className="rd-balance-badge">500.84</div>
             </div>
             <div className="rd-badge-continer">
            <div className="rb-header-badge">
              <div className="rd-title-badge">EXP</div>
              
            </div>
            <div className="rd-balance-badge">500</div>
            </div>
            <div style={{ position: 'relative' }} ref={userRef}>
              <div className="rb-header-user" onClick={() => setShowAccount(v => !v)} style={{ cursor: 'pointer' }}>
                DEMO746 <span style={{fontSize: 18}}>&#129333;</span>
              </div>
              {showAccount && (
                <AccountDropdown
                  onClose={() => setShowAccount(false)}
                  onSignOut={() => {
                    setIsLoggedIn(false);
                    setShowAccount(false);
                  }}
                />
              )}
            </div>
           
          </>
        ) : (
          <button
           className="login-main-btn-all-app"
            onClick={handleLoginClick}
          >
            LOGIN
          </button>
        )}
      </div>
      </div>
     
    </header>
    <LoginModal
      open={showLogin}
      onClose={() => {
        setShowLogin(false);
        localStorage.setItem('modalShouldBeOpen', 'false');
      }}
      onLogin={handleLogin}
    />
    </>
  );
};

export default Header; 