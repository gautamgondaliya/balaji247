import React, { useState } from 'react';
import '../styles/Payments.css';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([
    { 
      id: 16, 
      user: 'Raaz', 
      phone: '9752090369', 
      amount: '2,500.00', 
      method: 'UPI', 
      date: '18 May 2025', 
      time: '15:42', 
      status: 'APPROVED' 
    },
    { 
      id: 14, 
      user: 'Abhishek', 
      phone: '9508535424', 
      amount: '3,000.00', 
      method: 'UPI', 
      date: '17 May 2025', 
      time: '13:20', 
      status: 'PENDING' 
    },
    { 
      id: 11, 
      user: 'Sanu', 
      phone: '8979066955', 
      amount: '5,000.00', 
      method: 'BANK', 
      date: '16 May 2025', 
      time: '09:15', 
      status: 'APPROVED' 
    },
  ]);
  
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentWithdrawalDetails, setCurrentWithdrawalDetails] = useState(null);
  const [isWithdrawalDetailsOpen, setIsWithdrawalDetailsOpen] = useState(false);
  
  // Filter withdrawals based on status
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    return statusFilter === 'All Status' || withdrawal.status === statusFilter;
  });
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };
  
  const viewWithdrawalDetails = (withdrawal) => {
    setCurrentWithdrawalDetails(withdrawal);
    setIsWithdrawalDetailsOpen(true);
  };
  
  const handleApprove = (withdrawalId) => {
    setWithdrawals(withdrawals.map(withdrawal => 
      withdrawal.id === withdrawalId ? { ...withdrawal, status: 'APPROVED' } : withdrawal
    ));
  };
  
  const handleReject = (withdrawalId) => {
    setWithdrawals(withdrawals.map(withdrawal => 
      withdrawal.id === withdrawalId ? { ...withdrawal, status: 'REJECTED' } : withdrawal
    ));
  };
  
  return (
    <div className="payments-page">
      <div className="payment-management-header">
        <h1>
          <i className="fas fa-arrow-circle-up"></i> WITHDRAWALS
        </h1>
        <button className="refresh-button">
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      
      <div className="payment-history">
        <div className="filters">
          <div className="dropdown">
            <button className="dropdown-btn">{statusFilter} <i className="fas fa-chevron-down"></i></button>
            <div className="dropdown-content">
              <a onClick={() => handleStatusFilter('All Status')}>All Status</a>
              <a onClick={() => handleStatusFilter('PENDING')}>PENDING</a>
              <a onClick={() => handleStatusFilter('APPROVED')}>APPROVED</a>
              <a onClick={() => handleStatusFilter('REJECTED')}>REJECTED</a>
            </div>
          </div>
        </div>
        
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.map(withdrawal => (
              <tr key={withdrawal.id}>
                <td>#{withdrawal.id}</td>
                <td>
                  <div className="user-cell">
                    <div>{withdrawal.user}</div>
                    <div className="user-phone">{withdrawal.phone}</div>
                  </div>
                </td>
                <td>
                  <span className="payment-amount">₹ {withdrawal.amount}</span>
                </td>
                <td>{withdrawal.method}</td>
                <td>
                  <div className="date-cell">
                    <div>{withdrawal.date}</div>
                    <div className="payment-time">{withdrawal.time}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${withdrawal.status.toLowerCase()}`}>
                    {withdrawal.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => viewWithdrawalDetails(withdrawal)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    {withdrawal.status === 'PENDING' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleApprove(withdrawal.id)}
                        >
                          <i className="fas fa-check"></i> Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleReject(withdrawal.id)}
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isWithdrawalDetailsOpen && currentWithdrawalDetails && (
        <div className="payment-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Withdrawal Details</h2>
              <button 
                className="close-btn"
                onClick={() => setIsWithdrawalDetailsOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-detail">
                <span>ID:</span>
                <span>#{currentWithdrawalDetails.id}</span>
              </div>
              <div className="payment-detail">
                <span>User:</span>
                <span>{currentWithdrawalDetails.user}</span>
              </div>
              <div className="payment-detail">
                <span>Phone:</span>
                <span>{currentWithdrawalDetails.phone}</span>
              </div>
              <div className="payment-detail">
                <span>Amount:</span>
                <span>₹ {currentWithdrawalDetails.amount}</span>
              </div>
              <div className="payment-detail">
                <span>Method:</span>
                <span>{currentWithdrawalDetails.method}</span>
              </div>
              <div className="payment-detail">
                <span>Date & Time:</span>
                <span>{currentWithdrawalDetails.date} at {currentWithdrawalDetails.time}</span>
              </div>
              <div className="payment-detail">
                <span>Status:</span>
                <span className={`status-badge ${currentWithdrawalDetails.status.toLowerCase()}`}>
                  {currentWithdrawalDetails.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              {currentWithdrawalDetails.status === 'PENDING' && (
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(currentWithdrawalDetails.id)}
                  >
                    <i className="fas fa-check"></i> Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(currentWithdrawalDetails.id)}
                  >
                    <i className="fas fa-times"></i> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals; 