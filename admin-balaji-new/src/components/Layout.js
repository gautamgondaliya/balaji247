import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        <div className="page-container">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Layout; 