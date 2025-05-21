import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo.png'; // Make sure you have a logo image

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    user_id: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any errors when user types
    if (error) setError('');
    if (networkError) setNetworkError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNetworkError(false);

    // Validate input fields
    if (!credentials.user_id || !credentials.password) {
      setError('User ID and password are required.');
      setLoading(false);
      return;
    }
    
    // Prepare the request body - explicitly create a well-formed object
    const requestBody = {
      user_id: credentials.user_id.trim(),
      password: credentials.password
    };

    try {
      console.log('Login with:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      // Handle network errors
      if (!response.ok) {
        if (response.status === 0 || response.status === 404) {
          setNetworkError(true);
          throw new Error('Network Error: Unable to connect to the server');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const result = await response.json();
      
      // Make sure the response matches the expected format
      if (result.success && result.data) {
        console.log('Login successful:', result);
        
        // Store token and user data in localStorage
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Show success message briefly before redirecting
        setError(''); // Clear any errors
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        throw new Error(result.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {logo && <img src={logo} alt="Company Logo" className="login-logo" />}
          <h2>Admin Panel</h2>
          <p>Enter your credentials to access the admin panel</p>
        </div>
        
        {networkError && (
          <div className="error-message network-error">
            <i className="fas fa-exclamation-circle"></i>
            Network Error: Unable to connect to the server
          </div>
        )}
        
        {error && !networkError && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="user_id">Username</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="user_id"
                name="user_id"
                value={credentials.user_id}
                onChange={handleChange}
                placeholder="Enter your user ID"
                required
                autoComplete="username"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span>
                <i className="fas fa-spinner fa-spin"></i> Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;