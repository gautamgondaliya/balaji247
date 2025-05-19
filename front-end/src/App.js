import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import BottomNavBar from './components/BottomNavBar';
import CricketPage from './components/cricket/CricketPage';
import FootballPage from './components/football/FootballPage';
import TennisPage from './components/tennis/TennisPage';
import { Routes, Route } from 'react-router-dom';
import EventDetailPage from './components/cricket/cricket-event/EventDetailPage';
import ProfileLayout from './pages/profile/ProfileLayout';
import ProfileOverview from './pages/profile/ProfileOverview';
import UnsettledBets from './pages/profile/UnsettledBets';
import BetHistory from './pages/profile/BetHistory';
import ProfitLoss from './pages/profile/ProfitLoss';
import AccountStatement from './pages/profile/AccountStatement';
import Notifications from './pages/profile/Notifications';
// Placeholder imports for new components
// import Header from './components/Header';
// import Sidebar from './components/Sidebar';
// import LoginModal from './components/LoginModal';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Multi Market');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setShowLogin(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="App">
      <Header />
      <BottomNavBar /> 
      <Sidebar onCategorySelect={setSelectedCategory} />
      <div className="main-right-side-content-all-main-data">
        {/* Main content area */}
        {showSuccess && (
          <div style={{position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#2ecc40', color: '#fff', padding: '20px 40px', borderRadius: 8, zIndex: 2000}}>
            <strong>Success!</strong><br />Successfully Login!
          </div>
        )}
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
        <Routes>
          <Route path="/sports-event-detail/:id" element={<EventDetailPage />} />
          <Route path="/" element={
            selectedCategory === 'Multi Market' ? (
              <>
                <CricketPage />
                <FootballPage />
                <TennisPage />
              </>
            ) : selectedCategory === 'Cricket' ? (
              <CricketPage />
            ) : selectedCategory === 'Football' ? (
              <FootballPage />
            ) : selectedCategory === 'Tennis' ? (
              <TennisPage />
            ) : (
              <div style={{padding: 40, color: '#888'}}>Select a category from the sidebar.</div>
            )
          } />
          <Route path="/profile" element={<ProfileLayout />}>
            <Route path="overview" element={<ProfileOverview />} />
            <Route path="unsettled" element={<UnsettledBets />} />
            <Route path="history" element={<BetHistory />} />
            <Route path="profit-loss" element={<ProfitLoss />} />
            <Route path="statement" element={<AccountStatement />} />
            <Route path="settings" element={<div>Stake Settings</div>} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="language" element={<div>Language Settings</div>} />
            <Route path="change-password" element={<div>Change Password</div>} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
