import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import Logo_login from "../assets/Images/logo.png"
import { FaRegEye } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';

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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!userId || !password) {
      toast.error('Please enter both User ID and Password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('https://backbalaji.dynexbet.com/api/auth/login', {
        user_id: userId,
        password: password
      });

      if (response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success('Login successful!');
        if (onLogin) onLogin();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !registerPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('https://backbalaji.dynexbet.com/api/auth/register', {
        name,
        phone,
        password: registerPassword
      });

      if (response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success('Registration successful!');
        if (onLogin) onLogin();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* // <img src={Logo_login} alt="logo" className="login-image-main" /> */}
           <h1 className="rb-header-logo-main-txt-login">Balaji 247</h1>
          
          {isLoginView ? (
            // Login Form
            <>
              <input 
                value={userId} 
                onChange={e => setUserId(e.target.value)} 
                placeholder="Enter User ID" 
                className="input-field" 
                disabled={isLoading}
              />
              <div className="password-field-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter Password*" 
                  className="input-field" 
                  disabled={isLoading}
                />
                <span 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
              <div className="button-container">
                <button 
                  onClick={handleLogin} 
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'LOG IN'}
                </button>
              </div>
              <div className="register-prompt">
                <span>Don't have an account? </span>
                <button 
                  onClick={() => setIsLoginView(false)} 
                  className="register-link-button"
                  disabled={isLoading}
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
                disabled={isLoading}
              />
              <input 
                value={phone} 
                onChange={handlePhoneChange} 
                placeholder="Enter Phone Number (10 digits)" 
                className="input-field" 
                maxLength={10}
                disabled={isLoading}
              />
              <div className="password-field-container">
                <input 
                  type={showRegisterPassword ? "text" : "password"} 
                  value={registerPassword} 
                  onChange={e => setRegisterPassword(e.target.value)} 
                  placeholder="Enter Password*" 
                  className="input-field" 
                  disabled={isLoading}
                />
                <span 
                  className="password-toggle"
                  onClick={toggleRegisterPasswordVisibility}
                >
                  {showRegisterPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
              <div className="button-container">
                <button 
                  onClick={handleRegister} 
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'REGISTER'}
                </button>
              </div>
              <div className="login-prompt">
                <span>Already have an account? </span>
                <button 
                  onClick={() => setIsLoginView(true)} 
                  className="login-link-button"
                  disabled={isLoading}
                >
                  Login
                </button>
              </div>
            </>
          )}
          <button className="download-button" disabled={isLoading}>
            Download APK <span role="img" aria-label="android">🤖</span>
          </button>
        </div>
        {/* Right: Image */}
        <div className="image-section">
          <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=300&h=400&fit=crop" alt="login visual" className="login-image" />
        </div>
        <button onClick={handleClose} className="close-button" disabled={isLoading}>&times;</button>
      </div>
    </div>
  );
};

export default LoginModal;