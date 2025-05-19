import React, { useState, useEffect } from 'react';
import './WalletTransactions.css';

const WalletTransactions = () => {
  // State for transactions
  const [transactions, setTransactions] = useState([]);
  
  // State for transaction details modal
  const [detailsModal, setDetailsModal] = useState({
    show: false,
    transaction: null
  });
  
  // Current logged in user role - this would come from auth context in a real app
  const currentUserRole = 'Super Admin'; // Change this to test different admin levels
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    transactionType: 'All',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    status: 'All'
  });
  
  // Sample transaction types
  const transactionTypes = [
    'All',
    'Deposit',
    'Withdrawal',
    'Transfer',
    'Bet Placement',
    'Bet Settlement',
    'Commission',
    'Adjustment'
  ];
  
  // Sample transaction statuses
  const transactionStatuses = [
    'All',
    'Completed',
    'Pending',
    'Failed',
    'Cancelled'
  ];
  
  // Sample transactions data
  const sampleTransactions = [
    {
      id: 'TRX001',
      userId: 'USR001',
      userName: 'Rahul Sharma',
      userRole: 'Agent',
      type: 'Deposit',
      amount: 5000,
      balance: 15000,
      date: '2023-10-15T14:30:00',
      status: 'Completed',
      description: 'Deposit via bank transfer',
      reference: 'REF123456',
      approvedBy: 'Vikram Singh',
      ipAddress: '192.168.1.1',
      metadata: {
        bankName: 'HDFC Bank',
        accountNumber: 'XXXX4567'
      }
    },
    {
      id: 'TRX002',
      userId: 'USR002',
      userName: 'Priya Patel',
      userRole: 'Sub Admin',
      type: 'Transfer',
      amount: 10000,
      balance: 56000,
      date: '2023-10-14T11:20:00',
      status: 'Completed',
      description: 'Transfer to Agent Rahul Sharma',
      reference: 'TRF789012',
      approvedBy: 'Super Admin',
      ipAddress: '192.168.1.2',
      metadata: {
        toUser: 'Rahul Sharma',
        toUserId: 'USR001'
      }
    },
    {
      id: 'TRX003',
      userId: 'USR003',
      userName: 'Vikram Singh',
      userRole: 'Master',
      type: 'Bet Settlement',
      amount: 8500,
      balance: 98500,
      date: '2023-10-13T16:45:00',
      status: 'Completed',
      description: 'Cricket match win settlement',
      reference: 'BET345678',
      approvedBy: 'System',
      ipAddress: '192.168.1.3',
      metadata: {
        betId: 'BET345678',
        game: 'Cricket',
        event: 'India vs Australia'
      }
    },
    {
      id: 'TRX004',
      userId: 'USR004',
      userName: 'Ananya Desai',
      userRole: 'Super Admin',
      type: 'Adjustment',
      amount: -5000,
      balance: 500000,
      date: '2023-10-12T09:15:00',
      status: 'Completed',
      description: 'Balance correction',
      reference: 'ADJ901234',
      approvedBy: 'System',
      ipAddress: '192.168.1.4',
      metadata: {
        reason: 'System calculation error',
        previousBalance: '505000'
      }
    },
    {
      id: 'TRX005',
      userId: 'USR005',
      userName: 'Rajesh Kumar',
      userRole: 'Agent',
      type: 'Withdrawal',
      amount: -3000,
      balance: 28000,
      date: '2023-10-10T17:30:00',
      status: 'Pending',
      description: 'Withdrawal request',
      reference: 'WTH567890',
      approvedBy: null,
      ipAddress: '192.168.1.5',
      metadata: {
        bankName: 'SBI',
        accountNumber: 'XXXX7890'
      }
    },
    {
      id: 'TRX006',
      userId: 'USR006',
      userName: 'Amit Shah',
      userRole: 'Client',
      type: 'Bet Placement',
      amount: -1200,
      balance: 7500,
      date: '2023-10-15T19:45:00',
      status: 'Completed',
      description: 'Bet on Cricket match',
      reference: 'BET678901',
      approvedBy: 'System',
      ipAddress: '192.168.1.6',
      metadata: {
        betId: 'BET678901',
        game: 'Cricket',
        event: 'India vs Australia',
        odds: '2.5'
      }
    },
    {
      id: 'TRX007',
      userId: 'USR001',
      userName: 'Rahul Sharma',
      userRole: 'Agent',
      type: 'Commission',
      amount: 150,
      balance: 15150,
      date: '2023-10-16T10:30:00',
      status: 'Completed',
      description: 'Commission from client bets',
      reference: 'COM123456',
      approvedBy: 'System',
      ipAddress: '192.168.1.1',
      metadata: {
        clientId: 'USR006',
        betId: 'BET678901'
      }
    }
  ];
  
  // Load transactions on component mount
  useEffect(() => {
    // In a real app, this would be an API call with filters:
    // fetchTransactions(filters);
    
    setTransactions(sampleTransactions);
  }, []);
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    // In a real app, this would make an API call with the filters
    console.log('Applying filters:', filters);
    
    // For demo, we'll filter the sample data
    const filteredData = sampleTransactions.filter(transaction => {
      // Filter by user ID or name
      if (filters.userId && !transaction.userId.toLowerCase().includes(filters.userId.toLowerCase()) && 
          !transaction.userName.toLowerCase().includes(filters.userId.toLowerCase())) {
        return false;
      }
      
      // Filter by transaction type
      if (filters.transactionType !== 'All' && transaction.type !== filters.transactionType) {
        return false;
      }
      
      // Filter by status
      if (filters.status !== 'All' && transaction.status !== filters.status) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom + 'T00:00:00')) {
        return false;
      }
      
      if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo + 'T23:59:59')) {
        return false;
      }
      
      // Filter by amount range
      const transactionAmount = Math.abs(transaction.amount);
      if (filters.minAmount && transactionAmount < parseFloat(filters.minAmount)) {
        return false;
      }
      
      if (filters.maxAmount && transactionAmount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      return true;
    });
    
    setTransactions(filteredData);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      userId: '',
      transactionType: 'All',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      status: 'All'
    });
    
    // Reset to full dataset
    setTransactions(sampleTransactions);
  };
  
  // Open transaction details modal
  const openDetailsModal = (transaction) => {
    setDetailsModal({
      show: true,
      transaction
    });
  };
  
  // Check if user can view transaction details based on their role
  const canViewTransactionDetails = (transactionUserRole) => {
    const roleHierarchy = {
      'Super Admin': 4,
      'Master': 3,
      'Sub Admin': 2,
      'Agent': 1,
      'Client': 0
    };
    
    const currentRoleLevel = roleHierarchy[currentUserRole];
    const transactionRoleLevel = roleHierarchy[transactionUserRole];
    
    // Super Admin can see all, others can only see transactions from users below their level
    return currentUserRole === 'Super Admin' || currentRoleLevel > transactionRoleLevel;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    const prefix = amount < 0 ? '-₹' : '₹';
    return `${prefix}${Math.abs(amount).toLocaleString('en-IN')}`;
  };
  
  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1 className="page-title">Wallet Transactions</h1>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Transaction Filters</h2>
        </div>
        <div className="filter-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>User ID or Name</label>
              <input
                type="text"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Search user..."
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Transaction Type</label>
              <select
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {transactionStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Amount</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="Min"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Max Amount</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="Max"
                className="filter-input"
              />
            </div>
            
            <div className="filter-actions">
              <button className="btn btn-primary" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="btn btn-secondary" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Transactions List</h2>
          <div className="card-actions">
            <button className="btn btn-secondary">
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Role</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.userName}</td>
                    <td className="role-cell">{transaction.userRole}</td>
                    <td className={`type-cell ${transaction.type.toLowerCase().replace(/\s+/g, '-')}`}>
                      {transaction.type}
                    </td>
                    <td className={`amount-cell ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="balance-cell">{formatCurrency(transaction.balance)}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td>
                      <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.reference}</td>
                    <td className="actions-cell">
                      {canViewTransactionDetails(transaction.userRole) ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openDetailsModal(transaction)}
                        >
                          Details
                        </button>
                      ) : (
                        <span className="permission-badge">No Access</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    No transactions found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Transaction Details Modal */}
      {detailsModal.show && detailsModal.transaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="close-btn" onClick={() => setDetailsModal({show: false, transaction: null})}>
                &times;
              </button>
            </div>
            
            <div className="transaction-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <div className="detail-label">Transaction ID</div>
                  <div className="detail-value">{detailsModal.transaction.id}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Type</div>
                  <div className="detail-value">{detailsModal.transaction.type}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Amount</div>
                  <div className={`detail-value ${detailsModal.transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(detailsModal.transaction.amount)}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`status-badge status-${detailsModal.transaction.status.toLowerCase()}`}>
                      {detailsModal.transaction.status}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Date & Time</div>
                  <div className="detail-value">{formatDate(detailsModal.transaction.date)}</div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>User Information</h3>
                <div className="detail-row">
                  <div className="detail-label">User ID</div>
                  <div className="detail-value">{detailsModal.transaction.userId}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Name</div>
                  <div className="detail-value">{detailsModal.transaction.userName}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Role</div>
                  <div className="detail-value">{detailsModal.transaction.userRole}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">IP Address</div>
                  <div className="detail-value">{detailsModal.transaction.ipAddress}</div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Transaction Details</h3>
                <div className="detail-row">
                  <div className="detail-label">Description</div>
                  <div className="detail-value">{detailsModal.transaction.description}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Reference</div>
                  <div className="detail-value">{detailsModal.transaction.reference}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Balance After</div>
                  <div className="detail-value">{formatCurrency(detailsModal.transaction.balance)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Approved By</div>
                  <div className="detail-value">{detailsModal.transaction.approvedBy || 'Pending Approval'}</div>
                </div>
              </div>
              
              {detailsModal.transaction.metadata && (
                <div className="detail-section">
                  <h3>Additional Information</h3>
                  {Object.entries(detailsModal.transaction.metadata).map(([key, value]) => (
                    <div className="detail-row" key={key}>
                      <div className="detail-label">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</div>
                      <div className="detail-value">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Admin Layer Information */}
      <div className="card admin-layer-card">
        <div className="card-header">
          <h2 className="card-title">Admin Layer Permissions</h2>
        </div>
        <div className="admin-layers">
          <div className="layer-info">
            <h3>Transaction Visibility Permissions</h3>
            <div className="permission-grid">
              <div className="permission-row header">
                <div className="permission-cell role-header">Admin Role</div>
                <div className="permission-cell">View Transactions</div>
                <div className="permission-cell">View Details</div>
                <div className="permission-cell">Export</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Super Admin</div>
                <div className="permission-cell">All Users</div>
                <div className="permission-cell">All Users</div>
                <div className="permission-cell">Yes</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Master</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
                <div className="permission-cell">Yes</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Sub Admin</div>
                <div className="permission-cell">Agent, Client</div>
                <div className="permission-cell">Agent, Client</div>
                <div className="permission-cell">Yes</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Agent</div>
                <div className="permission-cell">Client</div>
                <div className="permission-cell">Client</div>
                <div className="permission-cell">No</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Client</div>
                <div className="permission-cell">Own only</div>
                <div className="permission-cell">Own only</div>
                <div className="permission-cell">No</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTransactions; 