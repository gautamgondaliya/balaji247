import React, { useState, useRef } from 'react';
import '../styles/Payments.css';

const Deposits = () => {
  const [deposits, setDeposits] = useState([
    { 
      id: 17, 
      user: 'Abhishek', 
      phone: '9508535424', 
      amount: '5,000.00', 
      method: 'UPI', 
      date: '19 May 2025', 
      time: '01:59', 
      status: 'PENDING',
      receipt: null 
    },
    { 
      id: 15, 
      user: 'Rahul', 
      phone: '1234567890', 
      amount: '10,000.00', 
      method: 'BANK', 
      date: '18 May 2025', 
      time: '12:30', 
      status: 'APPROVED',
      receipt: 'bank_transfer_receipt.jpg'
    },
    { 
      id: 12, 
      user: 'Sanu', 
      phone: '8979066955', 
      amount: '2,000.00', 
      method: 'UPI', 
      date: '17 May 2025', 
      time: '18:45', 
      status: 'APPROVED',
      receipt: 'upi_receipt.jpg'
    },
  ]);
  
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentDepositDetails, setCurrentDepositDetails] = useState(null);
  const [isDepositDetailsOpen, setIsDepositDetailsOpen] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  
  // Filter deposits based on status
  const filteredDeposits = deposits.filter(deposit => {
    return statusFilter === 'All Status' || deposit.status === statusFilter;
  });
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };
  
  const viewDepositDetails = (deposit) => {
    setCurrentDepositDetails(deposit);
    setPreviewUrl(deposit.receipt ? 
      `https://via.placeholder.com/400x300?text=${deposit.receipt}` : 
      '');
    setIsDepositDetailsOpen(true);
  };
  
  const handleApprove = (depositId) => {
    setDeposits(deposits.map(deposit => 
      deposit.id === depositId ? { 
        ...deposit, 
        status: 'APPROVED', 
        receipt: receiptImage ? receiptImage.name : deposit.receipt
      } : deposit
    ));
    
    if (isDepositDetailsOpen) {
      setIsDepositDetailsOpen(false);
    }
  };
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReceiptImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleUploadReceipt = (depositId) => {
    if (!receiptImage) return;
    
    setDeposits(deposits.map(deposit => 
      deposit.id === depositId ? { 
        ...deposit, 
        receipt: receiptImage.name 
      } : deposit
    ));
    
    // In a real application, you would upload the file to a server here
    console.log(`Uploading receipt for deposit ID ${depositId}: ${receiptImage.name}`);
  };
  
  return (
    <div className="payments-page">
      <div className="payment-management-header">
        <h1>
          <i className="fas fa-arrow-circle-down"></i> DEPOSITS
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
              <th>RECEIPT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.map(deposit => (
              <tr key={deposit.id}>
                <td>#{deposit.id}</td>
                <td>
                  <div className="user-cell">
                    <div>{deposit.user}</div>
                    <div className="user-phone">{deposit.phone}</div>
                  </div>
                </td>
                <td>
                  <span className="payment-amount">₹ {deposit.amount}</span>
                </td>
                <td>{deposit.method}</td>
                <td>
                  <div className="date-cell">
                    <div>{deposit.date}</div>
                    <div className="payment-time">{deposit.time}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${deposit.status.toLowerCase()}`}>
                    {deposit.status}
                  </span>
                </td>
                <td>
                  {deposit.receipt ? (
                    <button 
                      className="view-receipt-btn"
                      onClick={() => viewDepositDetails(deposit)}
                    >
                      <i className="fas fa-image"></i> View
                    </button>
                  ) : (
                    <span className="no-receipt">No Receipt</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => viewDepositDetails(deposit)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    {deposit.status === 'PENDING' && (
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(deposit.id)}
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
      
      {isDepositDetailsOpen && currentDepositDetails && (
        <div className="payment-details-modal">
          <div className="modal-content deposit-modal">
            <div className="modal-header">
              <h2>Deposit Details</h2>
              <button 
                className="close-btn"
                onClick={() => setIsDepositDetailsOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="deposit-details">
                <div className="payment-detail">
                  <span>ID:</span>
                  <span>#{currentDepositDetails.id}</span>
                </div>
                <div className="payment-detail">
                  <span>User:</span>
                  <span>{currentDepositDetails.user}</span>
                </div>
                <div className="payment-detail">
                  <span>Phone:</span>
                  <span>{currentDepositDetails.phone}</span>
                </div>
                <div className="payment-detail">
                  <span>Amount:</span>
                  <span>₹ {currentDepositDetails.amount}</span>
                </div>
                <div className="payment-detail">
                  <span>Method:</span>
                  <span>{currentDepositDetails.method}</span>
                </div>
                <div className="payment-detail">
                  <span>Date & Time:</span>
                  <span>{currentDepositDetails.date} at {currentDepositDetails.time}</span>
                </div>
                <div className="payment-detail">
                  <span>Status:</span>
                  <span className={`status-badge ${currentDepositDetails.status.toLowerCase()}`}>
                    {currentDepositDetails.status}
                  </span>
                </div>
              </div>
              
              <div className="receipt-section">
                <h3>Payment Receipt</h3>
                <div className="receipt-upload-area">
                  {previewUrl ? (
                    <div className="receipt-preview">
                      <img src={previewUrl} alt="Receipt Preview" />
                    </div>
                  ) : (
                    <div className="upload-placeholder" onClick={triggerFileInput}>
                      <i className="fas fa-upload"></i>
                      <p>Click to upload receipt</p>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  <div className="upload-controls">
                    <button 
                      className="choose-file-btn"
                      onClick={triggerFileInput}
                    >
                      <i className="fas fa-file-image"></i> Choose File
                    </button>
                    
                    {receiptImage && (
                      <button 
                        className="upload-btn"
                        onClick={() => handleUploadReceipt(currentDepositDetails.id)}
                      >
                        <i className="fas fa-upload"></i> Upload Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {currentDepositDetails.status === 'PENDING' && (
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(currentDepositDetails.id)}
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
      
      <style jsx>{`
        .no-receipt {
          color: #a0a3bd;
          font-size: 12px;
        }
        
        .view-receipt-btn {
          background-color: #242736;
          border: none;
          color: #fff;
          padding: 5px 8px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .view-receipt-btn:hover {
          background-color: #3a3f55;
        }
        
        .deposit-modal {
          width: 700px;
          max-width: 90%;
        }
        
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .deposit-details {
          flex: 1;
        }
        
        .receipt-section {
          flex: 1;
        }
        
        .receipt-section h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #fff;
        }
        
        .receipt-upload-area {
          background-color: #1e2130;
          border-radius: 8px;
          padding: 15px;
          border: 2px dashed #3a3f55;
        }
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .upload-placeholder:hover {
          background-color: #242736;
        }
        
        .upload-placeholder i {
          font-size: 36px;
          color: #3a3f55;
          margin-bottom: 10px;
        }
        
        .upload-placeholder p {
          color: #a0a3bd;
          margin: 0;
        }
        
        .receipt-preview {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }
        
        .receipt-preview img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 6px;
        }
        
        .upload-controls {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        
        .choose-file-btn, .upload-btn {
          background-color: #242736;
          border: none;
          color: #fff;
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .choose-file-btn:hover {
          background-color: #3a3f55;
        }
        
        .upload-btn {
          background-color: #8c52ff;
        }
        
        .upload-btn:hover {
          background-color: #7841e0;
        }
      `}</style>
    </div>
  );
};

export default Deposits; 