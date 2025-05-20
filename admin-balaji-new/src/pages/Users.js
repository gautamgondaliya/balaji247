import React, { useState, useEffect } from 'react';
import '../styles/Users.css';
import { userService } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
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
      } else {
        toast.error('Failed to fetch users data');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users data');
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
  
  const updateUser = async (userId) => {
    try {
      // You can implement user update dialog/form here
      console.log(`Update user with ID: ${userId}`);
      toast.info('User update feature coming soon!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
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
          <button className="filter-button" onClick={fetchUsers}>
            <i className="fas fa-sync"></i> REFRESH
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
                <th>Action</th>
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
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      <button 
                        className="update-button"
                        onClick={() => updateUser(user.userNo)}
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
    </div>
  );
};

export default Users; 