import React, { useState } from 'react';
import '../styles/Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([
    { 
      id: 17, 
      user: 'Abhishek', 
      phone: '9508535424', 
      type: 'DEPOSIT', 
      amount: '5,000.00', 
      method: 'UPI', 
      date: '19 May 2025', 
      time: '01:59', 
      status: 'PENDING' 
    },
    { 
      id: 16, 
      user: 'Raaz', 
      phone: '9752090369', 
      type: 'WITHDRAWAL', 
      amount: '2,500.00', 
      method: 'UPI', 
      date: '18 May 2025', 
      time: '15:42', 
      status: 'APPROVED' 
    },
    { 
      id: 15, 
      user: 'Rahul', 
      phone: '1234567890', 
      type: 'DEPOSIT', 
      amount: '10,000.00', 
      method: 'BANK', 
      date: '18 May 2025', 
      time: '12:30', 
      status: 'APPROVED' 
    },
  ]);
  
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPaymentDetails, setCurrentPaymentDetails] = useState(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  
  // Filter payments based on status and type
  const filteredPayments = payments.filter(payment => {
    const statusMatch = statusFilter === 'All Status' || payment.status === statusFilter;
    const typeMatch = typeFilter === 'All Types' || payment.type === typeFilter;
    return statusMatch && typeMatch;
  });
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };
  
  const handleTypeFilter = (type) => {
    setTypeFilter(type);
  };
  
  const viewPaymentDetails = (payment) => {
    setCurrentPaymentDetails(payment);
    setIsPaymentDetailsOpen(true);
  };
  
  const handleApprove = (paymentId) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId ? { ...payment, status: 'APPROVED' } : payment
    ));
  };
  
  return (
    <div className="payments-page">
      <div className="payment-management-header">
        <h1>
          <i className="fas fa-money-bill"></i> PAYMENT MANAGEMENT
        </h1>
        <button className="refresh-button">
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      
      <div className="admin-payment-details">
        <h2>Admin Payment Details</h2>
        <p>Configure your payment details that will be displayed to users when they make deposits or withdrawals.</p>
        
        <div className="payment-methods">
          <div className="payment-method">
            <h3>
              <i className="fas fa-qrcode"></i> Scanner/QR Code
            </h3>
            <div className="qr-container">
              <img src="https://via.placeholder.com/200" alt="QR Code" className="qr-code" />
            </div>
            <button className="choose-scanner-btn">CHOOSE SCANNER IMAGE</button>
            <p>Upload a QR code or scanner image for payments. Max size: 5MB. Formats: JPG, PNG.</p>
          </div>
          
          <div className="payment-method">
            <h3>
              <i className="fas fa-university"></i> Bank Details
            </h3>
            <div className="bank-details-form">
              <div className="form-group">
                <label>BANK NAME</label>
                <input type="text" defaultValue="Kotak Mahindra Bank" />
              </div>
              <div className="form-group">
                <label>ACCOUNT HOLDER NAME</label>
                <input type="text" defaultValue="Abhishek" />
              </div>
              <div className="form-group">
                <label>ACCOUNT NUMBER</label>
                <input type="text" defaultValue="8346413874" />
              </div>
              <div className="form-group">
                <label>IFSC CODE</label>
                <input type="text" defaultValue="KKBK005632" />
              </div>
              <div className="form-group">
                <label>UPI ID</label>
                <input type="text" defaultValue="8789363388@YBL" />
              </div>
            </div>
            <button className="save-payment-details-btn">
              <i className="fas fa-save"></i> Save Payment Details
            </button>
          </div>
        </div>
      </div>
      
      <div className="payment-history">
        <h2>Payment Management</h2>
        
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
          
          <div className="dropdown">
            <button className="dropdown-btn">{typeFilter} <i className="fas fa-chevron-down"></i></button>
            <div className="dropdown-content">
              <a onClick={() => handleTypeFilter('All Types')}>All Types</a>
              <a onClick={() => handleTypeFilter('DEPOSIT')}>DEPOSIT</a>
              <a onClick={() => handleTypeFilter('WITHDRAWAL')}>WITHDRAWAL</a>
            </div>
          </div>
        </div>
        
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>TYPE</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id}>
                <td>#{payment.id}</td>
                <td>
                  <div className="user-cell">
                    <div>{payment.user}</div>
                    <div className="user-phone">{payment.phone}</div>
                  </div>
                </td>
                <td>
                  <span className={`payment-type ${payment.type.toLowerCase()}`}>
                    {payment.type}
                  </span>
                </td>
                <td>
                  <span className="payment-amount">₹ {payment.amount}</span>
                </td>
                <td>{payment.method}</td>
                <td>
                  <div className="date-cell">
                    <div>{payment.date}</div>
                    <div className="payment-time">{payment.time}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => viewPaymentDetails(payment)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    {payment.status === 'PENDING' && (
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(payment.id)}
                      >
                        <i className="fas fa-check"></i> Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isPaymentDetailsOpen && currentPaymentDetails && (
        <div className="payment-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button 
                className="close-btn"
                onClick={() => setIsPaymentDetailsOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-detail">
                <span>ID:</span>
                <span>#{currentPaymentDetails.id}</span>
              </div>
              <div className="payment-detail">
                <span>User:</span>
                <span>{currentPaymentDetails.user}</span>
              </div>
              <div className="payment-detail">
                <span>Phone:</span>
                <span>{currentPaymentDetails.phone}</span>
              </div>
              <div className="payment-detail">
                <span>Type:</span>
                <span>{currentPaymentDetails.type}</span>
              </div>
              <div className="payment-detail">
                <span>Amount:</span>
                <span>₹ {currentPaymentDetails.amount}</span>
              </div>
              <div className="payment-detail">
                <span>Method:</span>
                <span>{currentPaymentDetails.method}</span>
              </div>
              <div className="payment-detail">
                <span>Date & Time:</span>
                <span>{currentPaymentDetails.date} at {currentPaymentDetails.time}</span>
              </div>
              <div className="payment-detail">
                <span>Status:</span>
                <span className={`status-badge ${currentPaymentDetails.status.toLowerCase()}`}>
                  {currentPaymentDetails.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              {currentPaymentDetails.status === 'PENDING' && (
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(currentPaymentDetails.id)}
                  >
                    <i className="fas fa-check"></i> Approve
                  </button>
                  <button className="reject-btn">
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

export default Payments; 