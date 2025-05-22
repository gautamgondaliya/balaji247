import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHistory, FaChartBar, FaFileAlt, FaCog, FaBell, FaLanguage, FaKey, FaSignOutAlt, FaChartLine, FaMoneyBillWave, FaMoneyCheckAlt, FaInfoCircle, FaQrcode, FaUniversity } from 'react-icons/fa';
import './AccountDropdown.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://backbalaji.dynexbet.com/api';

// Setup axios with authentication interceptor
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const menuItems = [
  { label: 'My Profile', icon: <FaUser />, route: '/profile/overview' },
  { label: 'Bet History', icon: <FaHistory />, route: '/profile/history' }
];

const AccountDropdown = ({ onClose, onSignOut }) => {
  const [oneClick, setOneClick] = useState(false);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const [walletDetails, setWalletDetails] = useState({
    current_balance: 0,
    current_exposure: 0
  });
  const [userData, setUserData] = useState(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPaymentId, setDepositPaymentId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPaymentId, setWithdrawPaymentId] = useState('');

  // WhatsApp number for transactions
  const whatsappNumber = "919876543210"; // Replace with your actual WhatsApp number

  // Bank account details for deposits
  const bankDetails = {
    accountNumber: "1234567890",
    ifscCode: "SBIN0001234",
    accountName: "Balaji247 Betting",
    bankName: "State Bank of India",
    branch: "Main Branch",
    qrCodeImage: "/assets/qr-code.png" // Path to QR code image
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userString && token) {
      const user = JSON.parse(userString);
      setUserData(user);
      fetchWalletDetails(user.user_id);
    }
  }, []);

  // Setup periodic wallet refresh
  useEffect(() => {
    let intervalId;

    if (userData) {
      // Then setup interval (every 1 second)
      intervalId = setInterval(() => {
        fetchWalletDetails(userData.user_id);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userData]);

  const fetchWalletDetails = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/wallet/details/${userId}`, getAuthHeaders());

      if (response.data.success) {
        setWalletDetails({
          current_balance: response.data.data.wallet.current_balance || 0,
          current_exposure: response.data.data.wallet.current_exposure || 0
        });
      } else {
        console.error('Failed to fetch wallet details:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      if (error.response?.status === 401) {
        // Handle token expiration
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000
        });
        onSignOut();
      }
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const handleMenuClick = (item) => {
    setActive(item.label);

    // Check if we need to navigate with a tab parameter
    if (item.tab) {
      navigate(`${item.route}?tab=${item.tab}`);
    } else {
      navigate(item.route);
    }

    onClose(); // Close the dropdown after navigation
  };

  const handleDepositClick = () => {
    setShowDepositForm(true);
    setShowWithdrawForm(false);
    setShowAccountDetails(false);
  };

  const handleWithdrawClick = () => {
    setShowWithdrawForm(true);
    setShowDepositForm(false);
    setShowAccountDetails(false);
  };

  const handleAccountDetailsClick = () => {
    setShowAccountDetails(true);
    setShowDepositForm(false);
    setShowWithdrawForm(false);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData) {
      toast.error('You must be logged in to make a deposit', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    try {
      // Create deposit request payload
      const depositData = {
        userId: userData.user_id,  // Changed from user_id to userId to match API expectations
        transaction_id: depositPaymentId,
        amount: depositAmount
      };
      
      // Send deposit request to server
      const response = await axios.post(`${BASE_URL}/deposit`, depositData, getAuthHeaders());
      
      if (response.data.success) {
        // Close the form
        setShowDepositForm(false);
        
        // Reset form fields
        setDepositAmount('');
        setDepositPaymentId('');
        
        // Prepare WhatsApp message
        const message = `Deposit Request:\n\nAmount: ${depositAmount}\nTransaction ID: ${depositPaymentId}\nUser ID: ${userData.user_id}\nUsername: ${userData.username || 'N/A'}\n\nPlease confirm my deposit request.`;
        
        // Encode for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp with the deposit details
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        
        // Show success notification
        toast.success('Deposit request submitted successfully!', {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.error(response.data.message || 'Failed to submit deposit request', {
          position: "top-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      toast.error(error.response?.data?.message || 'Error processing your request', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();

    if (!withdrawAmount || !withdrawPaymentId) {
      toast.error('Please fill all required fields', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    // Prepare message for WhatsApp
    const message = `Withdrawal Request:\nAmount: ${withdrawAmount}\nPayment ID/UPI: ${withdrawPaymentId}\nUser: ${userData?.name || userData?.user_id}`;

    // Open WhatsApp with the message
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    // Clear the form
    setWithdrawAmount('');
    setWithdrawPaymentId('');
    setShowWithdrawForm(false);
  };

  return (
    <div className="account-dropdown">
      <div className="account-dropdown-header">
        HI, {userData?.name || userData?.user_id || 'DEMO746'}
        <span className="account-dropdown-close" onClick={onClose}>✖</span>
      </div>
      {/* <div className="account-dropdown-toggle-row">
        One Click Bet
        <span className="account-dropdown-toggle-label" />
        <label className="account-dropdown-toggle-switch">
          <input
            type="checkbox"
            checked={oneClick}
            onChange={() => setOneClick(v => !v)}
          />
          <span className="account-dropdown-toggle-slider" />
          <span className="account-dropdown-toggle-knob" style={oneClick ? { left: '16px' } : { left: '2px' }} />
        </label>
      </div> */}
      <div className="account-dropdown-balance">
        <div style={{ marginBottom: 6 }} className="main-balance-part">
          <div className="main-balance-show-left">
            <div className="account-dropdown-balance-label">Wallet Amount</div>
            <div className="account-dropdown-balance-bonus">(Inclusive bonus)</div>
          </div>
          <div className="main-balance-show-right">
            <div className="account-dropdown-balance-value">{formatNumber(walletDetails.current_balance)}</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div className="exposure-balance-main">
            <div className="account-dropdown-balance-label">Net Exposure</div>
            <div className="account-dropdown-balance-value">{formatNumber(walletDetails.current_exposure)}</div>
          </div>
        </div>
      </div>

      <div className="account-dropdown-transaction-buttons">
        <button
          className="account-dropdown-deposit-btn"
          onClick={handleDepositClick}
        >
          <FaMoneyBillWave style={{ marginRight: 5 }} /> DEPOSIT
        </button>
        <button
          className="account-dropdown-withdraw-btn"
          onClick={handleWithdrawClick}
        >
          <FaMoneyCheckAlt style={{ marginRight: 5 }} /> WITHDRAW
        </button>
      </div>
      <div className="account-dropdown-details-button">
        <button
          className="account-dropdown-details-btn"
          onClick={handleAccountDetailsClick}
        >
          <FaUniversity style={{ marginRight: 5 }} /> DEPOSIT ACCOUNT DETAILS
        </button>
      </div>

      {showDepositForm && (
        <div className="account-dropdown-form">
          <form onSubmit={handleDepositSubmit}>
            <div className="form-title">Deposit Funds</div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="form-group">
              <label>Payment ID/UPI Reference</label>
              <input
                type="text"
                value={depositPaymentId}
                onChange={(e) => setDepositPaymentId(e.target.value)}
                placeholder="Enter payment reference"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="form-submit-btn">
                Submit via WhatsApp
              </button>
              <button
                type="button"
                className="form-cancel-btn"
                onClick={() => setShowDepositForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showWithdrawForm && (
        <div className="account-dropdown-form">
          <form onSubmit={handleWithdrawSubmit}>
            <div className="form-title">Withdraw Funds</div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="form-group">
              <label>UPI ID/Bank Details</label>
              <input
                type="text"
                value={withdrawPaymentId}
                onChange={(e) => setWithdrawPaymentId(e.target.value)}
                placeholder="Enter payment details"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="form-submit-btn">
                Submit via WhatsApp
              </button>
              <button
                type="button"
                className="form-cancel-btn"
                onClick={() => setShowWithdrawForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showAccountDetails && (
        <div className="account-dropdown-form account-details-popup">
          <div className="form-title">Deposit Account Details</div>
          <div className="account-details-content">
            <div className="account-detail-item">
              <FaUniversity className="account-detail-icon" />
              <div className="account-detail-info">
                <span className="account-detail-label">Bank Name</span>
                <span className="account-detail-value">{bankDetails.bankName}</span>
              </div>
            </div>
            <div className="account-detail-item">
              <FaUser className="account-detail-icon" />
              <div className="account-detail-info">
                <span className="account-detail-label">Account Name</span>
                <span className="account-detail-value">{bankDetails.accountName}</span>
              </div>
            </div>
            <div className="account-detail-item">
              <FaKey className="account-detail-icon" />
              <div className="account-detail-info">
                <span className="account-detail-label">Account Number</span>
                <span className="account-detail-value">{bankDetails.accountNumber}</span>
              </div>
            </div>
            <div className="account-detail-item">
              <FaInfoCircle className="account-detail-icon" />
              <div className="account-detail-info">
                <span className="account-detail-label">IFSC Code</span>
                <span className="account-detail-value">{bankDetails.ifscCode}</span>
              </div>
            </div>
            <div className="account-detail-item">
              <FaInfoCircle className="account-detail-icon" />
              <div className="account-detail-info">
                <span className="account-detail-label">Branch</span>
                <span className="account-detail-value">{bankDetails.branch}</span>
              </div>
            </div>
            <div className="qr-code-container">
              <h4>Scan QR Code</h4>
              <div className="qr-code-image">
                <FaQrcode size={120} />
                {/* Replace with actual image when available */}
                {/* <img src={bankDetails.qrCodeImage} alt="Payment QR Code" /> */}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="form-cancel-btn"
              onClick={() => setShowAccountDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="account-dropdown-menu">
        {menuItems.map(item => (
          <div
            key={item.label}
            className={`account-dropdown-menu-item${active === item.label ? ' active' : ''}`}
            onClick={() => handleMenuClick(item)}
          >
            <span className="account-dropdown-menu-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <button
        className="account-dropdown-signout"
        onClick={onSignOut}
      >
        <FaSignOutAlt style={{ marginRight: 7, fontSize: 16 }} /> SIGN OUT
      </button>
    </div>
  );
};

export default AccountDropdown; 