import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import Logo_login from "../assets/Images/logo.png"
import { FaRegEye } from "react-icons/fa";

const LoginModal = ({ open, onClose, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isPageLoad, setIsPageLoad] = useState(true);

  // Handle page load/refresh detection
  useEffect(() => {
    // Clear modal state on page load
    if (isPageLoad) {
      localStorage.setItem('modalShouldBeOpen', 'false');
      if (onClose) onClose();
    }
    // After initial load, set isPageLoad to false
    setIsPageLoad(false);

    // Handle page refresh
    const handleBeforeUnload = () => {
      localStorage.setItem('modalShouldBeOpen', 'false');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPageLoad, onClose]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      localStorage.setItem('modalShouldBeOpen', 'false');
    }
  };

  const handleLogin = () => {
    if (onLogin) onLogin();
  };

  const handleRegister = () => {
    // Implement registration logic
    if (onLogin) onLogin(); // For now using the same callback
  };

  // Don't show modal on page load or if not meant to be open
  if (isPageLoad || !open || localStorage.getItem('modalShouldBeOpen') !== 'true') {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Left: Form */}
        <div className="form-section">
          <img src={Logo_login} alt="logo" className="login-image-main" />
          
          {isLoginView ? (
            // Login Form
            <>
              <input 
                value={userId} 
                onChange={e => setUserId(e.target.value)} 
                placeholder="Enter User ID" 
                className="input-field" 
              />
              <div className="password-field-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter Password*" 
                  className="input-field" 
                />
                <span 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
              <div className="button-container">
                <button onClick={handleLogin} className="login-button">LOGIN WITH DEMO ID</button>
                <button onClick={handleLogin} className="login-button">LOG IN</button>
              </div>
              <div className="register-prompt">
                <span>Don't have an account? </span>
                <button 
                  onClick={() => setIsLoginView(false)} 
                  className="register-link-button"
                >
                  Register
                </button>
              </div>
            </>
          ) : (
            // Register Form
            <>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Enter Name" 
                className="input-field" 
              />
              <input 
                value={phone} 
                onChange={handlePhoneChange} 
                placeholder="Enter Phone Number (10 digits)" 
                className="input-field" 
                maxLength={10}
              />
              <div className="password-field-container">
                <input 
                  type={showRegisterPassword ? "text" : "password"} 
                  value={registerPassword} 
                  onChange={e => setRegisterPassword(e.target.value)} 
                  placeholder="Enter Password*" 
                  className="input-field" 
                />
                <span 
                  className="password-toggle"
                  onClick={toggleRegisterPasswordVisibility}
                >
                  {showRegisterPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
              <div className="button-container">
                <button onClick={() => setIsLoginView(true)} className="login-button">LOGIN</button>
                <button onClick={handleRegister} className="login-button">REGISTER</button>
              </div>
              <div className="login-prompt">
                <span>Already have an account? </span>
                <button 
                  onClick={() => setIsLoginView(true)} 
                  className="login-link-button"
                >
                  Login
                </button>
              </div>
            </>
          )}
          <button className="download-button">Download APK <span role="img" aria-label="android">🤖</span></button>
        </div>
        {/* Right: Image */}
        <div className="image-section">
          <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=300&h=400&fit=crop" alt="login visual" className="login-image" />
        </div>
        <button onClick={handleClose} className="close-button">&times;</button>
      </div>
    </div>
  );
};

export default LoginModal;