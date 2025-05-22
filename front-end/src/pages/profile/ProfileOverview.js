import React, { useState, useEffect } from 'react';
import './ProfileOverview.css';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import ProfileImage from "../../assets/Images/profile_image.webp"
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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

const ProfileOverview = ({ standalone = false, initialTab = null }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [stakeSettings, setStakeSettings] = useState({
    100: "100",
    200: "200",
    300: "300",
    400: "400",
    500: "500",
    600: "600",
    700: "700",
    8000: "8000"
  });
  const [walletDetails, setWalletDetails] = useState({
    current_balance: 0,
    current_exposure: 0
  });
  const [userData, setUserData] = useState(null);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userString && token) {
      const user = JSON.parse(userString);
      setUserData(user);
      fetchWalletDetails(user.user_id);
    }
  }, []);

  // Setup periodic wallet refresh
  useEffect(() => {
    let intervalId;
    
    if (userData) {
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
  }, [userData]);

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
        // Redirect to login or handle logout
      }
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };
  
  useEffect(() => {
    // Check for initialTab prop
    if (initialTab) {
      setActiveTab(initialTab);
    }
    
    // Check URL params for tab
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam.toUpperCase());
    }
  }, [initialTab, location.search]);
  
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleStakeChange = (key, value) => {
    setStakeSettings({
      ...stakeSettings,
      [key]: value
    });
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordFields({
      ...passwordFields,
      [field]: value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleStakeSave = () => {
    // Handle stake settings save logic
    console.log("Saving stake settings:", stakeSettings);
  };

  const handlePasswordChange = () => {
    // Handle password change logic
    console.log("Changing password:", passwordFields);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-title">PROFILE</div>
      </div>
      
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="avatar-circle">
            <FaUser className="avatar-icon" />
          </div>
          <h3 className="profile-username">{userData?.name || userData?.user_id || 'DEMO746'}</h3>
        </div>

        <div className="profile-main">
          <div className="tabs-container">
            <div 
              className={`tab ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
              onClick={() => setActiveTab('OVERVIEW')}
            >
              OVERVIEW
            </div>
            {/* <div 
              className={`tab ${activeTab === 'STAKE SETTINGS' ? 'active' : ''}`}
              onClick={() => setActiveTab('STAKE SETTINGS')}
            >
              STAKE SETTINGS
            </div> */}
            {/* <div 
              className={`tab ${activeTab === 'CHANGE PASSWORD' ? 'active' : ''}`}
              onClick={() => setActiveTab('CHANGE PASSWORD')}
            >
              CHANGE PASSWORD
            </div> */}
          </div>

          {activeTab === 'OVERVIEW' && (
            <div className="tab-content">
              <img src={ProfileImage} alt="profile_logo" className="peofile-image-logo" />
              <div className="welcome-message">
                Welcome To Balaji 247, {userData?.name || userData?.user_id || 'DEMO746'}
              </div>

              <div className="profile-details">
                <div className="detail-row">
                  <div className="detail-label">User Id</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">{userData?.user_id || 'Demo746'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Available Chips</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">{formatNumber(walletDetails.current_balance)}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Exposure</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">{formatNumber(walletDetails.current_exposure)}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Total Chips</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">{formatNumber(parseFloat(walletDetails.current_balance) + parseFloat(walletDetails.current_exposure))}</div>
                </div>
                
                {/* <div className="detail-row">
                  <div className="detail-label">Profit/Loss</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">0</div>
                </div> */}
              </div>
            </div>
          )}

          {activeTab === 'STAKE SETTINGS' && (
            <div className="tab-content">
              <div className="stake-settings-container">
                {Object.keys(stakeSettings).map(key => (
                  <div className="stake-row" key={key}>
                    <div className="stake-label">{key}</div>
                    <div className="stake-input">
                      <input 
                        type="text" 
                        value={stakeSettings[key]} 
                        onChange={(e) => handleStakeChange(key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button className="save-button" onClick={handleStakeSave}>
                  SAVE
                </button>
              </div>
            </div>
          )}

          {activeTab === 'CHANGE PASSWORD' && (
            <div className="tab-content">
              <div className="change-password-container">
                <div className="password-field">
                  <input 
                    type={showPasswords.currentPassword ? "text" : "password"} 
                    placeholder="Current Password*"
                    value={passwordFields.currentPassword}
                    onChange={(e) => handlePasswordFieldChange("currentPassword", e.target.value)}
                  />
                  <div 
                    className="password-toggle" 
                    onClick={() => togglePasswordVisibility("currentPassword")}
                  >
                    {showPasswords.currentPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                
                <div className="password-field">
                  <input 
                    type={showPasswords.newPassword ? "text" : "password"} 
                    placeholder="New Password*"
                    value={passwordFields.newPassword}
                    onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
                  />
                  <div 
                    className="password-toggle" 
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                
                <div className="password-field">
                  <input 
                    type={showPasswords.confirmPassword ? "text" : "password"} 
                    placeholder="Confirm New Password*"
                    value={passwordFields.confirmPassword}
                    onChange={(e) => handlePasswordFieldChange("confirmPassword", e.target.value)}
                  />
                  <div 
                    className="password-toggle" 
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                
                <div className="password-notes">
                  <div className="note-title">Note:</div>
                  <ul className="password-requirements">
                    <li>Password Must Be Of Minimum 8 Characters And Maximum 20 Characters.</li>
                    <li>Password Must Contain Alphabets, Numbers, Special Characters And At Least 1 In Capital Case, And 1 In Lower Case.</li>
                  </ul>
                </div>
                
                <button className="change-password-button" onClick={handlePasswordChange}>
                  CHANGE PASSWORD
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview; 