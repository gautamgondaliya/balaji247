import React, { useState, useEffect } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Cricket from './pages/Cricket';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import ResultDeclaration from './pages/ResultDeclaration';
import Bets from './pages/Bets';
import Login from './pages/Login';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Wrapper component that uses the auth context
const AppContent = () => {
  const { isAuthenticated, login, logout, loading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Function to render the current page
  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'payments':
        return <Payments />;
      case 'cricket':
        return <Cricket />;
      case 'deposits':
        return <Deposits />;
      case 'withdrawals':
        return <Withdrawals />;
      case 'results':
        return <ResultDeclaration />;
      case 'bets':
        return <Bets />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="App">
      <Sidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        <div className="page-container">
          {renderPage()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
