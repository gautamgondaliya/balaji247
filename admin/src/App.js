import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Games from './pages/games/Games';
import GameDetail from './pages/games/GameDetail';
import CricketDashboard from './pages/games/CricketDashboard';
import AllBets from './pages/bets/AllBets';
import BettingDataPage from './pages/BettingDataPage';
import Users from './pages/users/Users';
import UserDetail from './pages/users/UserDetail';
import UserCommissions from './pages/users/UserCommissions';

// Wallet pages
import WalletBalances from './pages/wallet/WalletBalances';
import WalletTransactions from './pages/wallet/WalletTransactions';
import WalletAdjustments from './pages/wallet/WalletAdjustments';

// Deposit and Withdrawal pages
import DepositList from './components/deposits/DepositList';
import WithdrawalList from './components/withdrawals/WithdrawalList';

// Auth check function
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes using Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* User management routes */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/users/hierarchy" element={<div className="page-container"><h1 className="page-title">User Hierarchy</h1></div>} />
          <Route path="/users/commissions" element={<UserCommissions />} />
          
          {/* Wallet management routes */}
          <Route path="/wallet/balances" element={<WalletBalances />} />
          <Route path="/wallet/transactions" element={<WalletTransactions />} />
          <Route path="/wallet/adjustments" element={<WalletAdjustments />} />
          
          {/* Deposit management routes */}
          <Route path="/deposits" element={<DepositList />} />
          <Route path="/deposits/pending" element={<DepositList />} />
          <Route path="/deposits/approved" element={<DepositList />} />
          
          {/* Withdrawal management routes */}
          <Route path="/withdrawals" element={<WithdrawalList />} />
          <Route path="/withdrawals/pending" element={<WithdrawalList />} />
          <Route path="/withdrawals/approved" element={<WithdrawalList />} />
          
          {/* Game management routes */}
          <Route path="/games" element={<Games />} />
          <Route path="/games/:gameId" element={<GameDetail />} />
          <Route path="/games/cricket-dashboard" element={<CricketDashboard />} />
          <Route path="/games/categories" element={<div className="page-container"><h1 className="page-title">Game Categories</h1></div>} />
          <Route path="/games/odds" element={<div className="page-container"><h1 className="page-title">Game Odds</h1></div>} />
          
          {/* Betting management routes */}
          <Route path="/bets" element={<AllBets />} />
          <Route path="/bets/data" element={<BettingDataPage />} />
          
          {/* Commission management routes */}
          <Route path="/commission/structure" element={<div className="page-container"><h1 className="page-title">Commission Structure</h1></div>} />
          <Route path="/commission/history" element={<div className="page-container"><h1 className="page-title">Commission History</h1></div>} />
          <Route path="/commission/profit-report" element={<div className="page-container"><h1 className="page-title">Commission Profit Report</h1></div>} />
          
          {/* Reports */}
          <Route path="/reports" element={<div className="page-container"><h1 className="page-title">Reports</h1></div>} />
          
          {/* Settings */}
          <Route path="/settings" element={<div className="page-container"><h1 className="page-title">Settings</h1></div>} />
        </Route>
        
        {/* Redirect to dashboard if authenticated, otherwise to login */}
        <Route path="*" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
