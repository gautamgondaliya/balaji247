import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../utils/api';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('adminToken'); // Use adminToken instead of token
        
        // Safely parse user data with error handling
        let userData = null;
        try {
          const userStr = localStorage.getItem('user');
          userData = userStr ? JSON.parse(userStr) : null;
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
          userData = null;
        }
        
        // Ensure both token and user data exist
        if (authStatus && token && userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          // Clear inconsistent auth state
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        // Reset auth state on error
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if authenticated
      if (isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state regardless of API success
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext; 