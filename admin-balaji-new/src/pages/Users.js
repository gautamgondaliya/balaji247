import React, { useState, useEffect } from 'react';
import '../styles/Users.css';
import { userService } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock data for testing when backend is not available
const MOCK_USERS = [
  {
    id: 1,
    user_id: 'user1',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    role: 'client',
    is_active: true,
    wallet: { current_balance: 1000, current_exposure: 200 }
  },
  {
    id: 2,
    user_id: 'user2',
    name: 'Jane Smith',
    phone: '9876543211',
    email: 'jane@example.com',
    role: 'client',
    is_active: true,
    wallet: { current_balance: 2000, current_exposure: 500 }
  },
  {
    id: 3,
    user_id: 'admin1',
    name: 'Admin User',
    phone: '9876543212',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true,
    wallet: { current_balance: 5000, current_exposure: 0 }
  }
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const usersPerPage = 10;
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load mock data for testing
  const loadMockData = () => {
    const formattedUsers = MOCK_USERS.map((user, index) => ({
      id: index + 1,
      registrarId: user.id || 'N/A',
      phone: user.phone || 'N/A',
      userNo: user.user_id || 'N/A',
      balance: user.wallet?.current_balance || '0',
      exposure: user.wallet?.current_exposure || '0',
      username: user.name || 'N/A',
      email: user.email || 'N/A',
      role: user.role || 'client',
      is_active: user.is_active
    }));
    
    setUsers(formattedUsers);
    setUseMockData(true);
    toast.info('Loaded test data. Backend connection not available.');
  };
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      
      if (response.success) {
        // Format user data to match our structure
        const formattedUsers = response.data.map((user, index) => ({
          id: index + 1,
          registrarId: user.id || 'N/A',
          phone: user.phone || 'N/A',
          userNo: user.user_id || 'N/A',
          balance: user.wallet?.current_balance || '0',
          exposure: user.wallet?.current_exposure || '0',
          username: user.name || 'N/A',
          email: user.email || 'N/A',
          role: user.role || 'client',
          is_active: user.is_active
        }));
        
        setUsers(formattedUsers);
        setUseMockData(false);
        toast.success(`${formattedUsers.length} users loaded successfully`);
      } else {
        toast.error(`Failed to fetch users: ${response.message || 'Unknown error'}`);
        if (!useMockData) loadMockData();
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication error. Please log in again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view users.');
      } else {
        toast.error(`Error fetching users: ${error.response?.data?.message || error.message || 'Network error'}`);
        if (!useMockData) loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.userNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const updateUser = (userId) => {
    const userToUpdate = users.find(user => user.userNo === userId);
    setSelectedUser(userToUpdate);
    setShowUserModal(true);
  };
  
  const handleUserUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      setProcessing(true);
      
      const userData = {
        name: selectedUser.username,
        phone: selectedUser.phone,
        email: selectedUser.email
      };
      
      const response = await userService.updateUser(selectedUser.userNo, userData);
      
      if (response.success) {
        toast.success('User updated successfully');
        setShowUserModal(false);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setProcessing(true);
      
      const response = await userService.updateUserStatus(userId, !currentStatus);
      
      if (response.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        
        // Update the user in the local state
        setUsers(users.map(user => 
          user.userNo === userId ? { ...user, is_active: !currentStatus } : user
        ));
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      setProcessing(true);
      
      const response = await userService.updateUserRole(userId, newRole);
      
      if (response.success) {
        toast.success('User role updated successfully');
        
        // Update the user in the local state
        setUsers(users.map(user => 
          user.userNo === userId ? { ...user, role: newRole } : user
        ));
      } else {
        toast.error(response.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error updating user role');
    } finally {
      setProcessing(false);
    }
  };

  // Format numbers with commas for display
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  // Handle pagination
  const handleNextPage = () => {
    if (indexOfLastUser < filteredUsers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const closeModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };
  
  const handleUserInputChange = (field, value) => {
    setSelectedUser({
      ...selectedUser,
      [field]: value
    });
  };

  return (
    <div className="users-page">
      <ToastContainer />
      <div className="users-header">
        <h1>All Users</h1>
        <p>List of All users in Balaji Cricket</p>
      </div>
      
      <div className="users-controls">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by name, phone, or ID..." 
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
        <div className="filters">
          <button className="filter-button" onClick={fetchUsers} disabled={loading}>
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync'}`}></i> REFRESH
          </button>
          <button className="filter-button">
            <i className="fas fa-filter"></i> FILTERS
          </button>
          <button className="filter-button">
            <i className="fas fa-download"></i> EXPORT
          </button>
        </div>
      </div>
      
      <div className="users-table">
        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i> Loading users...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID <i className="fas fa-sort"></i></th>
                <th>User ID</th>
                <th>Phone Number</th>
                <th>User Name</th>
                <th>Balance</th>
                <th>Exposure</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.userNo}</td>
                    <td>{user.phone}</td>
                    <td>{user.username}</td>
                    <td>{formatNumber(user.balance)}</td>
                    <td>{formatNumber(user.exposure)}</td>
                    <td>
                      <span 
                        className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(user.userNo, user.is_active)}
                        title={`Click to ${user.is_active ? 'deactivate' : 'activate'} user`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.userNo, e.target.value)}
                        className="role-select"
                        disabled={processing}
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="update-button"
                        onClick={() => updateUser(user.userNo)}
                        disabled={processing}
                      >
                        UPDATE
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No users found. {searchTerm && 'Try adjusting your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="pagination">
        <div className="pagination-info">
          <span>Rows per page: </span>
          <select>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="pagination-pages">
          <span>
            {filteredUsers.length > 0 
              ? `${indexOfFirstUser + 1}-${Math.min(indexOfLastUser, filteredUsers.length)} of ${filteredUsers.length}` 
              : '0-0 of 0'}
          </span>
          <button 
            className="pagination-button" 
            disabled={currentPage === 1}
            onClick={handlePrevPage}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            className="pagination-button" 
            disabled={indexOfLastUser >= filteredUsers.length}
            onClick={handleNextPage}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
      {/* User Update Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <h2>Update User: {selectedUser.username}</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleUserUpdate}>
              <div className="form-group">
                <label>Username:</label>
                <input 
                  type="text"
                  value={selectedUser.username}
                  onChange={(e) => handleUserInputChange('username', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input 
                  type="text"
                  value={selectedUser.phone}
                  onChange={(e) => handleUserInputChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => handleUserInputChange('email', e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-button"
                  disabled={processing}
                >
                  {processing ? <i className="fas fa-spinner fa-spin"></i> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 