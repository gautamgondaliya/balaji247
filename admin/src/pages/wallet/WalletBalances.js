import React, { useState, useEffect } from 'react';
import './WalletBalances.css';

const WalletBalances = () => {
  // State for user balances
  const [userBalances, setUserBalances] = useState([]);
  
  // State for system balance
  const [systemBalance, setSystemBalance] = useState({
    total: 0,
    available: 0,
    inPlay: 0
  });
  
  // State for add/deduct balance modal
  const [balanceModal, setBalanceModal] = useState({
    show: false,
    userId: null,
    username: '',
    action: 'add', // 'add' or 'deduct'
    amount: '',
    note: ''
  });
  
  // State for transfer balance modal
  const [transferModal, setTransferModal] = useState({
    show: false,
    fromUserId: '',
    toUserId: '',
    amount: '',
    note: ''
  });
  
  // Current logged in user role - this would come from auth context in a real app
  const currentUserRole = 'Super Admin'; // Change this to test different admin levels
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Sample user balances data
  const sampleUserBalances = [
    {
      id: 'USR001',
      name: 'Rahul Sharma',
      role: 'Agent',
      balance: 15000,
      exposure: 2500,
      availableBalance: 12500,
      status: 'active',
      lastTransaction: '2023-10-15 14:30',
      parent: 'Vikram Singh'
    },
    {
      id: 'USR002',
      name: 'Priya Patel',
      role: 'Sub Admin',
      balance: 56000,
      exposure: 8200,
      availableBalance: 47800,
      status: 'active',
      lastTransaction: '2023-10-14 11:20',
      parent: 'Super Admin'
    },
    {
      id: 'USR003',
      name: 'Vikram Singh',
      role: 'Master',
      balance: 98500,
      exposure: 15000,
      availableBalance: 83500,
      status: 'active',
      lastTransaction: '2023-10-13 16:45',
      parent: 'Super Admin'
    },
    {
      id: 'USR004',
      name: 'Ananya Desai',
      role: 'Super Admin',
      balance: 500000,
      exposure: 120000,
      availableBalance: 380000,
      status: 'active',
      lastTransaction: '2023-10-12 09:15',
      parent: null
    },
    {
      id: 'USR005',
      name: 'Rajesh Kumar',
      role: 'Agent',
      balance: 28000,
      exposure: 5600,
      availableBalance: 22400,
      status: 'inactive',
      lastTransaction: '2023-10-10 17:30',
      parent: 'Priya Patel'
    },
    {
      id: 'USR006',
      name: 'Amit Shah',
      role: 'Client',
      balance: 7500,
      exposure: 1200,
      availableBalance: 6300,
      status: 'active',
      lastTransaction: '2023-10-15 19:45',
      parent: 'Rahul Sharma'
    }
  ];
  
  // Sample users for transfer dropdown
  const sampleUsers = [
    { id: 'USR001', name: 'Rahul Sharma', role: 'Agent' },
    { id: 'USR002', name: 'Priya Patel', role: 'Sub Admin' },
    { id: 'USR003', name: 'Vikram Singh', role: 'Master' },
    { id: 'USR004', name: 'Ananya Desai', role: 'Super Admin' },
    { id: 'USR005', name: 'Rajesh Kumar', role: 'Agent' },
    { id: 'USR006', name: 'Amit Shah', role: 'Client' }
  ];
  
  // Load balances on component mount
  useEffect(() => {
    // In a real app, this would be an API call:
    // fetchWalletBalances();
    // fetchSystemBalance();
    
    setUserBalances(sampleUserBalances);
    
    // Calculate system balance
    const totalBalance = sampleUserBalances.reduce((sum, user) => sum + user.balance, 0);
    const totalExposure = sampleUserBalances.reduce((sum, user) => sum + user.exposure, 0);
    
    setSystemBalance({
      total: totalBalance,
      available: totalBalance - totalExposure,
      inPlay: totalExposure
    });
  }, []);
  
  // Filter balances based on search query and role filter
  const filteredBalances = userBalances.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Check if user can add/deduct balance based on their role
  const canModifyBalance = (userRole) => {
    const roleHierarchy = {
      'Super Admin': 4,
      'Master': 3,
      'Sub Admin': 2,
      'Agent': 1,
      'Client': 0
    };
    
    const currentRoleLevel = roleHierarchy[currentUserRole];
    const targetRoleLevel = roleHierarchy[userRole];
    
    return currentRoleLevel > targetRoleLevel;
  };
  
  // Check if current user can transfer to another user
  const canTransferTo = (fromRole, toRole) => {
    const roleHierarchy = {
      'Super Admin': 4,
      'Master': 3,
      'Sub Admin': 2,
      'Agent': 1,
      'Client': 0
    };
    
    const fromRoleLevel = roleHierarchy[fromRole];
    const toRoleLevel = roleHierarchy[toRole];
    
    return fromRoleLevel > toRoleLevel;
  };
  
  // Open add/deduct balance modal
  const openBalanceModal = (user, action) => {
    setBalanceModal({
      show: true,
      userId: user.id,
      username: user.name,
      action,
      amount: '',
      note: ''
    });
  };
  
  // Open transfer balance modal
  const openTransferModal = () => {
    setTransferModal({
      show: true,
      fromUserId: '',
      toUserId: '',
      amount: '',
      note: ''
    });
  };
  
  // Handle balance modal input change
  const handleBalanceModalChange = (e) => {
    const { name, value } = e.target;
    setBalanceModal({
      ...balanceModal,
      [name]: value
    });
  };
  
  // Handle transfer modal input change
  const handleTransferModalChange = (e) => {
    const { name, value } = e.target;
    setTransferModal({
      ...transferModal,
      [name]: value
    });
  };
  
  // Submit add/deduct balance
  const handleBalanceSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call:
    // if (balanceModal.action === 'add') {
    //   addBalance(balanceModal.userId, balanceModal.amount, balanceModal.note);
    // } else {
    //   deductBalance(balanceModal.userId, balanceModal.amount, balanceModal.note);
    // }
    
    console.log(`${balanceModal.action} ${balanceModal.amount} to user ${balanceModal.userId}`);
    
    // Close modal and reset form
    setBalanceModal({
      show: false,
      userId: null,
      username: '',
      action: 'add',
      amount: '',
      note: ''
    });
    
    // Show success message
    alert(`Balance ${balanceModal.action === 'add' ? 'added to' : 'deducted from'} ${balanceModal.username}`);
  };
  
  // Submit transfer balance
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call:
    // transferBalance(transferModal.fromUserId, transferModal.toUserId, transferModal.amount, transferModal.note);
    
    console.log(`Transfer ${transferModal.amount} from user ${transferModal.fromUserId} to user ${transferModal.toUserId}`);
    
    // Close modal and reset form
    setTransferModal({
      show: false,
      fromUserId: '',
      toUserId: '',
      amount: '',
      note: ''
    });
    
    // Show success message
    alert('Balance transferred successfully');
  };
  
  // Get potential transfer users based on current user role
  const getTransferUsers = () => {
    // In a real app, this would filter users based on current user's downline
    return sampleUsers.filter(user => 
      canTransferTo(currentUserRole, user.role)
    );
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1 className="page-title">Wallet Balances</h1>
        {['Super Admin', 'Master'].includes(currentUserRole) && (
          <button className="btn btn-primary" onClick={openTransferModal}>
            Transfer Funds
          </button>
        )}
      </div>
      
      {/* System Balance Overview */}
      <div className="card system-balance-card">
        <div className="card-header">
          <h2 className="card-title">System Balance Overview</h2>
        </div>
        <div className="system-balance">
          <div className="balance-item">
            <div className="balance-label">Total Balance</div>
            <div className="balance-value total">{formatCurrency(systemBalance.total)}</div>
          </div>
          <div className="balance-item">
            <div className="balance-label">Available Balance</div>
            <div className="balance-value available">{formatCurrency(systemBalance.available)}</div>
          </div>
          <div className="balance-item">
            <div className="balance-label">In-Play Balance</div>
            <div className="balance-value in-play">{formatCurrency(systemBalance.inPlay)}</div>
          </div>
        </div>
      </div>
      
      {/* User Balances */}
      <div className="card user-balances-card">
        <div className="card-header">
          <h2 className="card-title">User Balances</h2>
          <div className="filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="role-filter"
              >
                <option value="All">All Roles</option>
                <option value="Client">Client</option>
                <option value="Agent">Agent</option>
                <option value="Sub Admin">Sub Admin</option>
                <option value="Master">Master</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <table className="balance-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Parent</th>
                <th>Balance</th>
                <th>Exposure</th>
                <th>Available</th>
                <th>Last Transaction</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.length > 0 ? (
                filteredBalances.map(user => (
                  <tr key={user.id} className={user.status === 'inactive' ? 'inactive-user' : ''}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td className="role-cell">{user.role}</td>
                    <td>{user.parent || 'None'}</td>
                    <td className="balance-cell">{formatCurrency(user.balance)}</td>
                    <td className="exposure-cell">{formatCurrency(user.exposure)}</td>
                    <td className="available-cell">{formatCurrency(user.availableBalance)}</td>
                    <td>{user.lastTransaction}</td>
                    <td>
                      <span className={`status-badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {canModifyBalance(user.role) && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openBalanceModal(user, 'add')}
                          >
                            Add
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openBalanceModal(user, 'deduct')}
                          >
                            Deduct
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    No matching users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Deduct Balance Modal */}
      {balanceModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {balanceModal.action === 'add' ? 'Add Balance' : 'Deduct Balance'}
              </h2>
              <button className="close-btn" onClick={() => setBalanceModal({...balanceModal, show: false})}>
                &times;
              </button>
            </div>
            <form onSubmit={handleBalanceSubmit}>
              <div className="form-group">
                <label>User</label>
                <input
                  type="text"
                  value={balanceModal.username}
                  disabled
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={balanceModal.amount}
                  onChange={handleBalanceModalChange}
                  required
                  min="1"
                  step="1"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  name="note"
                  value={balanceModal.note}
                  onChange={handleBalanceModalChange}
                  rows="3"
                  className="form-control"
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setBalanceModal({...balanceModal, show: false})}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {balanceModal.action === 'add' ? 'Add Balance' : 'Deduct Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Transfer Balance Modal */}
      {transferModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Transfer Funds</h2>
              <button className="close-btn" onClick={() => setTransferModal({...transferModal, show: false})}>
                &times;
              </button>
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="form-group">
                <label>From User</label>
                <select
                  name="fromUserId"
                  value={transferModal.fromUserId}
                  onChange={handleTransferModalChange}
                  required
                  className="form-control"
                >
                  <option value="">Select User</option>
                  {getTransferUsers().filter(user => user.id !== transferModal.toUserId).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>To User</label>
                <select
                  name="toUserId"
                  value={transferModal.toUserId}
                  onChange={handleTransferModalChange}
                  required
                  className="form-control"
                >
                  <option value="">Select User</option>
                  {getTransferUsers().filter(user => user.id !== transferModal.fromUserId).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <small className="form-help-text">
                  You can only transfer funds to users below your admin level.
                </small>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={transferModal.amount}
                  onChange={handleTransferModalChange}
                  required
                  min="1"
                  step="1"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  name="note"
                  value={transferModal.note}
                  onChange={handleTransferModalChange}
                  rows="3"
                  className="form-control"
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTransferModal({...transferModal, show: false})}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Transfer Funds
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
            <h3>Wallet Operation Permissions</h3>
            <div className="permission-grid">
              <div className="permission-row header">
                <div className="permission-cell role-header">Admin Role</div>
                <div className="permission-cell">Add Balance</div>
                <div className="permission-cell">Deduct Balance</div>
                <div className="permission-cell">Transfer Funds</div>
                <div className="permission-cell">View Users</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Super Admin</div>
                <div className="permission-cell">All Users</div>
                <div className="permission-cell">All Users</div>
                <div className="permission-cell">All Users</div>
                <div className="permission-cell">All Users</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Master</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
                <div className="permission-cell">Sub Admin, Agent, Client</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Sub Admin</div>
                <div className="permission-cell">Agent, Client</div>
                <div className="permission-cell">Agent, Client</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">Agent, Client</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Agent</div>
                <div className="permission-cell">Client</div>
                <div className="permission-cell">Client</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">Client</div>
              </div>
              <div className="permission-row">
                <div className="permission-cell role">Client</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">No</div>
                <div className="permission-cell">No</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalances; 