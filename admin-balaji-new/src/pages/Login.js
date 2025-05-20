import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Login.css';
import { authService } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    
    setLoading(true);

    try {
      // Call the login API with user credentials
      const response = await authService.login({
        user_id: username,
        password: password
      });

      if (response.success) {
        // Check if user is admin/super_admin
        const userRole = response.data.user.role;
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          toast.error('Access denied. Admin rights required.', {
            position: 'top-right',
            autoClose: 3000,
          });
          setLoading(false);
          return;
        }

        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 2000,
        });
        
        // Login using the auth context
        login(response.data.user, response.data.token);
        
        // Call the onLogin function passed from parent
        setTimeout(() => {
          onLogin();
        }, 1000);
      } else {
        toast.error(response.message || 'Login failed. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-form-container">
        <div className="login-header">
          <h1>BALAJI CRICKET</h1>
          <h2>Admin Panel</h2>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner">
                  <i className="fas fa-spinner fa-spin"></i> Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>
          
          <div className="login-footer">
            <p>Enter your admin credentials to login</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 