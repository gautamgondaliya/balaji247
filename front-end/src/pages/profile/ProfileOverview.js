import React, { useState, useEffect } from 'react';
import './ProfileOverview.css';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import ProfileImage from "../../assets/Images/profile_image.webp"
import { useLocation } from 'react-router-dom';

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
          <h3 className="profile-username">DEMO746</h3>
        </div>

        <div className="profile-main">
          <div className="tabs-container">
            <div 
              className={`tab ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
              onClick={() => setActiveTab('OVERVIEW')}
            >
              OVERVIEW
            </div>
            <div 
              className={`tab ${activeTab === 'STAKE SETTINGS' ? 'active' : ''}`}
              onClick={() => setActiveTab('STAKE SETTINGS')}
            >
              STAKE SETTINGS
            </div>
            <div 
              className={`tab ${activeTab === 'CHANGE PASSWORD' ? 'active' : ''}`}
              onClick={() => setActiveTab('CHANGE PASSWORD')}
            >
              CHANGE PASSWORD
            </div>
          </div>

          {activeTab === 'OVERVIEW' && (
            <div className="tab-content">
              <img src={ProfileImage} alt="profile_logo" className="peofile-image-logo" />
              <div className="welcome-message">
                Welcome To Reddybook399, Demo746
              </div>

              <div className="profile-details">
                <div className="detail-row">
                  <div className="detail-label">User Id</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">Demo746</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Available Chips</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">0</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Exposure</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">500</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Total Chips</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">500</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Profit/Loss</div>
                  <div className="detail-separator">:</div>
                  <div className="detail-value">0</div>
                </div>
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