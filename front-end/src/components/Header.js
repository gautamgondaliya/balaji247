import React, { useState, useRef, useEffect } from 'react';
import LoginModal from './LoginModal';
import AccountDropdown from './AccountDropdown';
import "./Header.css";
import Logo_reddy_book from "../assets/Images/logo.png"
import { CiUser } from "react-icons/ci";
import axios from 'axios';
import { toast } from 'react-toastify';
import account_icon from "../assets/Images/account.png";
import Search_btn from "../assets/Images/magnify.png";

const BASE_URL = process.env.REACT_APP_API_URL || 'https://backbalaji.dynexbet.com/api';

// Setup axios with authentication interceptor
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

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
  const [walletDetails, setWalletDetails] = useState({
    current_balance: 0,
    current_exposure: 0
  });
  const [userData, setUserData] = useState(null);
  const userRef = useRef();

  // Check if user is logged in on component mount
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userString && token) {
      const user = JSON.parse(userString);
      setUserData(user);
      setIsLoggedIn(true);
      fetchWalletDetails(user.user_id);
    }
  }, []);

  // Setup periodic wallet refresh
  useEffect(() => {
    let intervalId;
    
    if (isLoggedIn && userData) {
      // Fetch immediately
      fetchWalletDetails(userData.user_id);
      
      // Then setup interval (every 1 second)
      intervalId = setInterval(() => {
        fetchWalletDetails(userData.user_id);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn, userData]);

  const fetchWalletDetails = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/wallet/details/${userId}`, getAuthHeaders());
      
      if (response.data.success) {
        setWalletDetails({
          current_balance: response.data.data.wallet.current_balance || 0,
          current_exposure: response.data.data.wallet.current_exposure || 0
        });
      } else {
        console.error('Failed to fetch wallet details:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      if (error.response?.status === 401) {
        // Handle token expiration
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000
        });
        handleSignOut();
      }
    }
  };

  const handleLogin = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserData(user);
      setIsLoggedIn(true);
      fetchWalletDetails(user.user_id);
    }
    setShowLogin(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowAccount(false);
    setUserData(null);
    setWalletDetails({
      current_balance: 0,
      current_exposure: 0
    });
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

  // Format numbers with commas
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

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
        <span className="rb-header-search-icon"> <img src={Search_btn} alt="" /> </span>
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
             <div className="rd-balance-badge">{formatNumber(walletDetails.current_balance)}</div>
             </div>
             <div className="rd-badge-continer">
            <div className="rb-header-badge">
              <div className="rd-title-badge">EXP</div>
              
            </div>
            <div className="rd-balance-badge">{formatNumber(walletDetails.current_exposure)}</div>
            </div>
            <div style={{ position: 'relative' }} ref={userRef}>
              <div className="rb-header-user" onClick={() => setShowAccount(v => !v)} style={{ cursor: 'pointer' }}>
                {userData?.name || userData?.user_id || 'User'} <span style={{fontSize: 18}}> <img src={account_icon} alt="" /> </span>
              </div>
              {showAccount && (
                <AccountDropdown
                  onClose={() => setShowAccount(false)}
                  onSignOut={handleSignOut}
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