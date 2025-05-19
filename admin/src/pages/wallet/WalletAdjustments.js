import React, { useState, useEffect } from 'react';
import './WalletAdjustments.css';

const WalletAdjustments = () => {
  // State for adjustments
  const [adjustments, setAdjustments] = useState([]);
  
  // State for new adjustment modal
  const [newAdjustmentModal, setNewAdjustmentModal] = useState({
    show: false,
    userId: '',
    amount: '',
    reason: '',
    note: ''
  });
  
  // Current logged in user role - this would come from auth context in a real app
  const currentUserRole = 'Super Admin'; // Change this to test different admin levels
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    status: 'All'
  });
  
  // Sample users for user selection dropdown
  const sampleUsers = [
    { id: 'USR001', name: 'Rahul Sharma', role: 'Agent' },
    { id: 'USR002', name: 'Priya Patel', role: 'Sub Admin' },
    { id: 'USR003', name: 'Vikram Singh', role: 'Master' },
    { id: 'USR004', name: 'Ananya Desai', role: 'Super Admin' },
    { id: 'USR005', name: 'Rajesh Kumar', role: 'Agent' },
    { id: 'USR006', name: 'Amit Shah', role: 'Client' }
  ];
  
  // Sample adjustment statuses
  const adjustmentStatuses = [
    'All',
    'Approved',
    'Pending',
    'Rejected'
  ];
  
  // Sample adjustments data
  const sampleAdjustments = [
    {
      id: 'ADJ001',
      userId: 'USR001',
      userName: 'Rahul Sharma',
      userRole: 'Agent',
      amount: 1000,
      previousBalance: 14000,
      newBalance: 15000,
      reason: 'System Error Correction',
      note: 'Bet settlement calculation error',
      date: '2023-10-15T14:30:00',
      status: 'Approved',
      approvedBy: 'Vikram Singh',
      ipAddress: '192.168.1.1'
    },
    {
      id: 'ADJ002',
      userId: 'USR002',
      userName: 'Priya Patel',
      userRole: 'Sub Admin',
      amount: -2000,
      previousBalance: 58000,
      newBalance: 56000,
      reason: 'Manual Correction',
      note: 'Adjustment after account review',
      date: '2023-10-14T11:20:00',
      status: 'Approved',
      approvedBy: 'Super Admin',
      ipAddress: '192.168.1.2'
    },
    {
      id: 'ADJ003',
      userId: 'USR003',
      userName: 'Vikram Singh',
      userRole: 'Master',
      amount: 5000,
      previousBalance: 93500,
      newBalance: 98500,
      reason: 'Bonus Credit',
      note: 'Performance bonus',
      date: '2023-10-13T16:45:00',
      status: 'Approved',
      approvedBy: 'Super Admin',
      ipAddress: '192.168.1.3'
    },
    {
      id: 'ADJ004',
      userId: 'USR005',
      userName: 'Rajesh Kumar',
      userRole: 'Agent',
      amount: -1500,
      previousBalance: 29500,
      newBalance: 28000,
      reason: 'Fee Deduction',
      note: 'Monthly platform fee',
      date: '2023-10-10T17:30:00',
      status: 'Pending',
      approvedBy: null,
      ipAddress: '192.168.1.5'
    },
    {
      id: 'ADJ005',
      userId: 'USR006',
      userName: 'Amit Shah',
      userRole: 'Client',
      amount: 500,
      previousBalance: 7000,
      newBalance: 7500,
      reason: 'Welcome Bonus',
      note: 'New user welcome bonus',
      date: '2023-10-15T19:45:00',
      status: 'Approved',
      approvedBy: 'Rahul Sharma',
      ipAddress: '192.168.1.6'
    },
    {
      id: 'ADJ006',
      userId: 'USR004',
      userName: 'Ananya Desai',
      userRole: 'Super Admin',
      amount: 10000,
      previousBalance: 490000,
      newBalance: 500000,
      reason: 'Capital Addition',
      note: 'Adding capital to system',
      date: '2023-10-12T09:15:00',
      status: 'Rejected',
      approvedBy: null,
      ipAddress: '192.168.1.4'
    }
  ];
  
  // Adjustment reasons
  const adjustmentReasons = [
    'System Error Correction',
    'Manual Correction',
    'Bonus Credit',
    'Fee Deduction',
    'Welcome Bonus',
    'Capital Addition',
    'Other'
  ];
  
  // Load adjustments on component mount
  useEffect(() => {
    // In a real app, this would be an API call with filters:
    // fetchAdjustments(filters);
    
    setAdjustments(sampleAdjustments);
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
    const filteredData = sampleAdjustments.filter(adjustment => {
      // Filter by user ID or name
      if (filters.userId && !adjustment.userId.toLowerCase().includes(filters.userId.toLowerCase()) && 
          !adjustment.userName.toLowerCase().includes(filters.userId.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (filters.status !== 'All' && adjustment.status !== filters.status) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateFrom && new Date(adjustment.date) < new Date(filters.dateFrom + 'T00:00:00')) {
        return false;
      }
      
      if (filters.dateTo && new Date(adjustment.date) > new Date(filters.dateTo + 'T23:59:59')) {
        return false;
      }
      
      // Filter by amount range
      const adjustmentAmount = Math.abs(adjustment.amount);
      if (filters.minAmount && adjustmentAmount < parseFloat(filters.minAmount)) {
        return false;
      }
      
      if (filters.maxAmount && adjustmentAmount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      return true;
    });
    
    setAdjustments(filteredData);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      userId: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      status: 'All'
    });
    
    // Reset to full dataset
    setAdjustments(sampleAdjustments);
  };
  
  // Open new adjustment modal
  const openNewAdjustmentModal = () => {
    setNewAdjustmentModal({
      show: true,
      userId: '',
      amount: '',
      reason: 'System Error Correction',
      note: ''
    });
  };
  
  // Handle new adjustment input change
  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setNewAdjustmentModal({
      ...newAdjustmentModal,
      [name]: value
    });
  };
  
  // Submit new adjustment
  const handleSubmitAdjustment = (e) => {
    e.preventDefault();
    
    // Validate input
    if (!newAdjustmentModal.userId || !newAdjustmentModal.amount || !newAdjustmentModal.reason) {
      alert('Please fill all required fields');
      return;
    }
    
    // In a real app, this would be an API call:
    // createAdjustment(newAdjustmentModal);
    
    // Get selected user
    const selectedUser = sampleUsers.find(user => user.id === newAdjustmentModal.userId);
    
    // For demo, create adjustment locally
    const newAdjustment = {
      id: `ADJ${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      userId: newAdjustmentModal.userId,
      userName: selectedUser ? selectedUser.name : 'Unknown User',
      userRole: selectedUser ? selectedUser.role : 'Unknown',
      amount: parseFloat(newAdjustmentModal.amount),
      previousBalance: 0, // This would come from the API
      newBalance: 0, // This would come from the API
      reason: newAdjustmentModal.reason,
      note: newAdjustmentModal.note,
      date: new Date().toISOString(),
      status: 'Pending',
      approvedBy: null,
      ipAddress: '192.168.1.100'
    };
    
    // Add to local state
    setAdjustments([newAdjustment, ...adjustments]);
    
    // Close modal
    setNewAdjustmentModal({
      show: false,
      userId: '',
      amount: '',
      reason: 'System Error Correction',
      note: ''
    });
    
    // Show success message
    alert('Adjustment request submitted successfully');
  };
  
  // Check if user can perform adjustments based on role
  const canCreateAdjustment = () => {
    return ['Super Admin', 'Master'].includes(currentUserRole);
  };
  
  // Check if user can approve/reject adjustments
  const canApproveAdjustment = () => {
    return currentUserRole === 'Super Admin';
  };
  
  // Get users allowed for adjustment based on current user role
  const getAdjustmentUsers = () => {
    const roleHierarchy = {
      'Super Admin': 4,
      'Master': 3,
      'Sub Admin': 2,
      'Agent': 1,
      'Client': 0
    };
    
    const currentRoleLevel = roleHierarchy[currentUserRole];
    
    // Filter users that are below current user in hierarchy
    return sampleUsers.filter(user => {
      const userRoleLevel = roleHierarchy[user.role];
      return userRoleLevel < currentRoleLevel;
    });
  };
  
  // Approve adjustment
  const approveAdjustment = (adjustmentId) => {
    // In a real app, this would be an API call:
    // approveAdjustment(adjustmentId);
    
    // For demo, update locally
    const updatedAdjustments = adjustments.map(adjustment => {
      if (adjustment.id === adjustmentId) {
        return {
          ...adjustment,
          status: 'Approved',
          approvedBy: 'Super Admin'
        };
      }
      return adjustment;
    });
    
    setAdjustments(updatedAdjustments);
    
    // Show success message
    alert('Adjustment approved successfully');
  };
  
  // Reject adjustment
  const rejectAdjustment = (adjustmentId) => {
    // In a real app, this would be an API call:
    // rejectAdjustment(adjustmentId);
    
    // For demo, update locally
    const updatedAdjustments = adjustments.map(adjustment => {
      if (adjustment.id === adjustmentId) {
        return {
          ...adjustment,
          status: 'Rejected',
          approvedBy: 'Super Admin'
        };
      }
      return adjustment;
    });
    
    setAdjustments(updatedAdjustments);
    
    // Show success message
    alert('Adjustment rejected successfully');
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
        <h1 className="page-title">Wallet Adjustments</h1>
        {canCreateAdjustment() && (
          <button className="btn btn-primary" onClick={openNewAdjustmentModal}>
            New Adjustment
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Adjustment Filters</h2>
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
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {adjustmentStatuses.map(status => (
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
      
      {/* Adjustments Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Adjustments List</h2>
          <div className="card-actions">
            <button className="btn btn-secondary">
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="adjustments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Role</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Note</th>
                <th>Previous Balance</th>
                <th>New Balance</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length > 0 ? (
                adjustments.map(adjustment => (
                  <tr key={adjustment.id}>
                    <td>{adjustment.id}</td>
                    <td>{adjustment.userName}</td>
                    <td className="role-cell">{adjustment.userRole}</td>
                    <td className={`amount-cell ${adjustment.amount >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(adjustment.amount)}
                    </td>
                    <td>{adjustment.reason}</td>
                    <td className="note-cell">{adjustment.note}</td>
                    <td className="balance-cell">{formatCurrency(adjustment.previousBalance)}</td>
                    <td className="balance-cell">{formatCurrency(adjustment.newBalance)}</td>
                    <td>{formatDate(adjustment.date)}</td>
                    <td>
                      <span className={`status-badge status-${adjustment.status.toLowerCase()}`}>
                        {adjustment.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {canApproveAdjustment() && adjustment.status === 'Pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => approveAdjustment(adjustment.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => rejectAdjustment(adjustment.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-data">
                    No adjustments found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New Adjustment Modal */}
      {newAdjustmentModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Wallet Adjustment</h2>
              <button className="close-btn" onClick={() => setNewAdjustmentModal({...newAdjustmentModal, show: false})}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmitAdjustment}>
              <div className="form-group">
                <label>User <span className="required">*</span></label>
                <select
                  name="userId"
                  value={newAdjustmentModal.userId}
                  onChange={handleAdjustmentChange}
                  required
                  className="form-control"
                >
                  <option value="">Select User</option>
                  {getAdjustmentUsers().map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <small className="form-help-text">
                  You can only make adjustments for users below your admin level.
                </small>
              </div>
              
              <div className="form-group">
                <label>Amount <span className="required">*</span></label>
                <div className="amount-input-container">
                  <span className="amount-prefix">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={newAdjustmentModal.amount}
                    onChange={handleAdjustmentChange}
                    required
                    placeholder="Enter amount"
                    className="form-control amount-input"
                  />
                </div>
                <small className="form-help-text">
                  Use positive values to add balance, negative to deduct.
                </small>
              </div>
              
              <div className="form-group">
                <label>Reason <span className="required">*</span></label>
                <select
                  name="reason"
                  value={newAdjustmentModal.reason}
                  onChange={handleAdjustmentChange}
                  required
                  className="form-control"
                >
                  {adjustmentReasons.map(reason => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Note</label>
                <textarea
                  name="note"
                  value={newAdjustmentModal.note}
                  onChange={handleAdjustmentChange}
                  rows="3"
                  placeholder="Enter detailed explanation for this adjustment"
                  className="form-control"
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setNewAdjustmentModal({...newAdjustmentModal, show: false})}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Adjustment
                </button>
              </div>
            </form>
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
            <h3>Adjustment Permissions</h3>
            <div className="permission-grid">
              <div className="permission-row header">
                <div className="permission-cell role-header">Admin Role</div>
                <div className="permission-cell">Create Adjustments</div>
                <div className="permission-cell">Approve/Reject</div>
                <div className="permission-cell">View Adjustments</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Super Admin</div>
                <div className="permission-cell">All Users</div>
                <div className="permission-cell">Yes</div>
                <div className="permission-cell">All Users</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Master</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Sub Admin</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">Agent, Client</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Agent</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">Client</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Client</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">Own only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAdjustments; 