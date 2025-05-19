import React, { useState } from 'react';
import './Deposits.css';

const DepositList = () => {
  // Dummy data for deposits
  const [deposits, setDeposits] = useState([
    {
      id: 1,
      userId: "USER123",
      username: "JohnDoe",
      amount: 1000,
      status: "pending",
      timestamp: "2024-03-20 10:30:00",
      paymentMethod: "Bank Transfer"
    },
    {
      id: 2,
      userId: "USER124",
      username: "JaneSmith",
      amount: 500,
      status: "approved",
      timestamp: "2024-03-20 09:15:00",
      paymentMethod: "UPI"
    }
  ]);

  const handleApproveDeposit = (id) => {
    setDeposits(deposits.map(deposit => 
      deposit.id === id ? { ...deposit, status: 'approved' } : deposit
    ));
  };

  const handleRejectDeposit = (id) => {
    setDeposits(deposits.map(deposit => 
      deposit.id === id ? { ...deposit, status: 'rejected' } : deposit
    ));
  };

  return (
    <div className="deposit-container">
      <h2>Deposit Requests</h2>
      <div className="deposit-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map(deposit => (
              <tr key={deposit.id}>
                <td>{deposit.id}</td>
                <td>{deposit.username}</td>
                <td>₹{deposit.amount}</td>
                <td>{deposit.paymentMethod}</td>
                <td>
                  <span className={`status ${deposit.status}`}>
                    {deposit.status}
                  </span>
                </td>
                <td>{deposit.timestamp}</td>
                <td>
                  {deposit.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApproveDeposit(deposit.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleRejectDeposit(deposit.id)}
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

export default DepositList; 