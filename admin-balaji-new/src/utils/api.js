import axios from 'axios';

// Base URL for API requests
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  // Admin login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  // Admin logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// User management services
export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('API Error - Get All Users:', error);
      throw error;
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`API Error - Get User ${userId}:`, error);
      throw error;
    }
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`API Error - Update User ${userId}:`, error);
      throw error;
    }
  },
  
  // Update user status
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/users/${userId}/status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error(`API Error - Update User Status ${userId}:`, error);
      throw error;
    }
  },
  
  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`API Error - Update User Role ${userId}:`, error);
      throw error;
    }
  },
  
  // Get user wallet details
  getUserWallet: async (userId) => {
    const response = await api.get(`/wallet/details/${userId}`);
    return response.data;
  },
  
  // Update user wallet
  updateWallet: async (userId, amount, type) => {
    const response = await api.post('/wallet/update-balance', {
      user_id: userId,
      amount,
      type // 'credit' or 'debit'
    });
    return response.data;
  }
};

// Betting services
export const bettingService = {
  // Get all bets
  getAllBets: async () => {
    const response = await api.get('/betting/grouped/all');
    return response.data;
  },
  
  // Get user bets
  getUserBets: async (userId) => {
    const response = await api.get(`/betting/user/${userId}`);
    return response.data;
  },
  
  // Settle a bet
  settleBet: async (betId, resultOdds) => {
    const response = await api.post(`/betting/${betId}/settle`, { result_odds: resultOdds });
    return response.data;
  },
  
  // Cancel a bet
  cancelBet: async (betId) => {
    const response = await api.post(`/betting/${betId}/cancel`);
    return response.data;
  },
};

export default api; 