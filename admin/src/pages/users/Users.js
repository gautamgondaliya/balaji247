import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Client',
    parentId: '',
    commissionRate: '0',
    initialBalance: '0',
    address: ''
  });

  // Current logged in user role - this would come from auth context in a real app
  const currentUserRole = 'Super Admin'; // Change this to test different admin levels

  // Sample users data - would come from API in a real app
  const users = [
    { 
      id: 'USR001', 
      name: 'Rahul Sharma', 
      phone: '+91 98765 43210', 
      email: 'rahul.s@example.com', 
      role: 'Client', 
      balance: '₹15,000', 
      status: 'active',
      lastLogin: '2023-10-12 15:30',
      joinDate: '2023-05-15'
    },
    { 
      id: 'USR002', 
      name: 'Priya Patel', 
      phone: '+91 87654 32109', 
      email: 'priya.p@example.com', 
      role: 'Agent', 
      balance: '₹56,000', 
      status: 'active',
      lastLogin: '2023-10-11 09:45',
      joinDate: '2023-04-20'
    },
    { 
      id: 'USR003', 
      name: 'Vikram Singh', 
      phone: '+91 76543 21098', 
      email: 'vikram.s@example.com', 
      role: 'Client', 
      balance: '₹8,500', 
      status: 'inactive',
      lastLogin: '2023-09-28 14:20',
      joinDate: '2023-06-05'
    },
    { 
      id: 'USR004', 
      name: 'Ananya Desai', 
      phone: '+91 65432 10987', 
      email: 'ananya.d@example.com', 
      role: 'Super Agent', 
      balance: '₹120,000', 
      status: 'active',
      lastLogin: '2023-10-12 11:15',
      joinDate: '2023-02-10'
    },
    { 
      id: 'USR005', 
      name: 'Raj Kumar', 
      phone: '+91 54321 09876', 
      email: 'raj.k@example.com', 
      role: 'Client', 
      balance: '₹3,200', 
      status: 'pending',
      lastLogin: '2023-10-05 16:50',
      joinDate: '2023-09-01'
    },
    { 
      id: 'USR006', 
      name: 'Meera Joshi', 
      phone: '+91 43210 98765', 
      email: 'meera.j@example.com', 
      role: 'Agent', 
      balance: '₹42,500', 
      status: 'active',
      lastLogin: '2023-10-10 08:30',
      joinDate: '2023-03-15'
    }
  ];

  // Get potential parent users based on selected role
  const getPotentialParents = (selectedRole) => {
    const roleHierarchy = ['Client', 'Agent', 'Sub Admin', 'Master', 'Super Admin'];
    const selectedRoleIndex = roleHierarchy.indexOf(selectedRole);
    
    if (selectedRoleIndex <= 0) return []; // Client has no children
    
    // Filter users with higher role than the selected one
    return users.filter(user => {
      const userRoleIndex = roleHierarchy.indexOf(user.role);
      return userRoleIndex > selectedRoleIndex;
    });
  };

  // Filter users based on search query and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUserClick = (user) => {
    navigate(`/users/${user.id}`);
  };

  const handleStatusToggle = (userId, currentStatus, e) => {
    e.stopPropagation(); // Prevent triggering the row click
    console.log(`Toggle status for user ${userId} from ${currentStatus}`);
    // API call would happen here in a real app
  };

  const handleAddUser = () => {
    // Open the modal
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    // Reset form
    setNewUser({
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Client',
      parentId: '',
      commissionRate: '0',
      initialBalance: '0',
      address: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    console.log('Creating new user:', newUser);
    // Here you would make API call to create user
    
    // Close modal after submission
    closeModal();
    
    // Show success message
    alert(`User ${newUser.name} created successfully!`);
  };

  // Get available roles based on current user role
  const getAvailableRoles = () => {
    const allRoles = ['Client', 'Agent', 'Sub Admin', 'Master', 'Super Admin'];
    
    switch(currentUserRole) {
      case 'Super Admin':
        return allRoles; // Super Admin can create all roles
      case 'Master':
        return ['Sub Admin', 'Agent']; // Master can only create Sub Admin and Agent
      case 'Sub Admin':
        return ['Agent']; // Sub Admin can only create Agent
      case 'Agent':
        return ['Client']; // Agent can only create Client
      default:
        return [];
    }
  };

  // Function to render status badge with appropriate class
  const renderStatusBadge = (status) => {
    let badgeClass = '';
    
    switch(status) {
      case 'active':
        badgeClass = 'badge-success';
        break;
      case 'inactive':
        badgeClass = 'badge-danger';
        break;
      case 'pending':
        badgeClass = 'badge-warning';
        break;
      default:
        badgeClass = 'badge-info';
    }
    
    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary" onClick={handleAddUser}>Add New User</button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Users</h2>
          <div className="users-filter">
            <input 
              type="text" 
              placeholder="Search users by name, ID, phone..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => handleUserClick(user)}
                  className={`user-row ${user.status}`}
                >
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.balance}</td>
                  <td>{renderStatusBadge(user.status)}</td>
                  <td>{user.lastLogin}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      onClick={(e) => handleStatusToggle(user.id, user.status, e)}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">User Statistics</h2>
        </div>
        <div className="user-stats">
          <div className="stat-item">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{users.filter(u => u.status === 'active').length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Inactive Users</div>
            <div className="stat-value">{users.filter(u => u.status === 'inactive').length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Pending Users</div>
            <div className="stat-value">{users.filter(u => u.status === 'pending').length}</div>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <h3 className="form-section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name*</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number*</label>
                  <input 
                    type="text" 
                    id="phone"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address*</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Role*</label>
                  <select 
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                  >
                    {getAvailableRoles().map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password*</label>
                  <input 
                    type="password" 
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password*</label>
                  <input 
                    type="password" 
                    id="confirmPassword"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea 
                  id="address"
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>
              
              <h3 className="form-section-title">User Hierarchy & Finance</h3>
              
              {newUser.role !== 'Super Admin' && (
                <div className="form-group">
                  <label htmlFor="parentId">Parent User</label>
                  <select 
                    id="parentId"
                    name="parentId"
                    value={newUser.parentId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Parent User</option>
                    {getPotentialParents(newUser.role).map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} ({parent.role})
                      </option>
                    ))}
                  </select>
                  <small className="form-help-text">
                    Select the parent user in the hierarchy
                  </small>
                </div>
              )}
              
              {newUser.role !== 'Client' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="commissionRate">Commission Rate (%)</label>
                    <input 
                      type="number" 
                      id="commissionRate"
                      name="commissionRate"
                      value={newUser.commissionRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <small className="form-help-text">
                      Commission percentage for this user
                    </small>
                  </div>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="initialBalance">Initial Balance</label>
                  <input 
                    type="number" 
                    id="initialBalance"
                    name="initialBalance"
                    value={newUser.initialBalance}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 