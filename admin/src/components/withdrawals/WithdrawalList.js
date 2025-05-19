import React, { useState } from 'react';
import './Withdrawals.css';

const WithdrawalList = () => {
  // Dummy data for withdrawals
  const [withdrawals, setWithdrawals] = useState([
    {
      id: 1,
      userId: "USER123",
      username: "JohnDoe",
      amount: 500,
      status: "pending",
      timestamp: "2024-03-20 11:30:00",
      withdrawalMethod: "Bank Transfer",
      accountDetails: {
        bankName: "HDFC Bank",
        accountNumber: "XXXX1234",
        ifscCode: "HDFC0001234"
      }
    },
    {
      id: 2,
      userId: "USER124",
      username: "JaneSmith",
      amount: 1000,
      status: "approved",
      timestamp: "2024-03-20 10:15:00",
      withdrawalMethod: "UPI",
      accountDetails: {
        upiId: "jane@upi"
      }
    }
  ]);

  const handleApproveWithdrawal = (id) => {
    setWithdrawals(withdrawals.map(withdrawal => 
      withdrawal.id === id ? { ...withdrawal, status: 'approved' } : withdrawal
    ));
  };

  const handleRejectWithdrawal = (id) => {
    setWithdrawals(withdrawals.map(withdrawal => 
      withdrawal.id === id ? { ...withdrawal, status: 'rejected' } : withdrawal
    ));
  };

  return (
    <div className="withdrawal-container">
      <h2>Withdrawal Requests</h2>
      <div className="withdrawal-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Withdrawal Method</th>
              <th>Account Details</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(withdrawal => (
              <tr key={withdrawal.id}>
                <td>{withdrawal.id}</td>
                <td>{withdrawal.username}</td>
                <td>₹{withdrawal.amount}</td>
                <td>{withdrawal.withdrawalMethod}</td>
                <td>
                  {withdrawal.withdrawalMethod === 'Bank Transfer' ? (
                    <>
                      {withdrawal.accountDetails.bankName}<br/>
                      Acc: {withdrawal.accountDetails.accountNumber}
                    </>
                  ) : (
                    <>UPI: {withdrawal.accountDetails.upiId}</>
                  )}
                </td>
                <td>
                  <span className={`status ${withdrawal.status}`}>
                    {withdrawal.status}
                  </span>
                </td>
                <td>{withdrawal.timestamp}</td>
                <td>
                  {withdrawal.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproveWithdrawal(withdrawal.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleRejectWithdrawal(withdrawal.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalList; 