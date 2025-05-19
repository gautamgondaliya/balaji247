import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserDetail.css';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Mock data - would be fetched from API in real app
  useEffect(() => {
    // Simulate API call to get user details
    setTimeout(() => {
      const mockUser = {
        id: userId,
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul.s@example.com',
        role: 'Client',
        balance: '₹15,000',
        status: 'active',
        lastLogin: '2023-10-12 15:30',
        joinDate: '2023-05-15',
        address: 'B-15, Sector 62, Noida, UP',
        kyc: {
          status: 'verified',
          panCard: 'ABCDE1234F',
          aadharCard: '1234 5678 9012',
          documents: ['ID_proof.pdf', 'Address_proof.pdf']
        },
        bankDetails: {
          accountName: 'Rahul Sharma',
          accountNumber: 'XXXX XXXX XXXX 1234',
          bankName: 'HDFC Bank',
          ifsc: 'HDFC0001234',
          upiId: 'rahul123@upi'
        },
        transactions: [
          { id: 'TXN001', type: 'deposit', amount: '₹5,000', date: '2023-10-10', status: 'completed' },
          { id: 'TXN002', type: 'withdrawal', amount: '₹2,000', date: '2023-10-08', status: 'completed' },
          { id: 'TXN003', type: 'bet', amount: '₹500', date: '2023-10-05', status: 'completed' },
          { id: 'TXN004', type: 'deposit', amount: '₹10,000', date: '2023-09-28', status: 'completed' }
        ],
        bets: [
          { id: 'BET001', game: 'Cricket', amount: '₹500', odds: '1.9', outcome: 'win', date: '2023-10-05' },
          { id: 'BET002', game: 'Football', amount: '₹1,000', odds: '2.1', outcome: 'loss', date: '2023-10-01' },
          { id: 'BET003', game: 'Tennis', amount: '₹300', odds: '1.75', outcome: 'win', date: '2023-09-28' }
        ],
        commission: {
          rate: '2%',
          earned: '₹1,200',
          lastMonth: '₹350',
          history: [
            { date: '2023-10', amount: '₹350' },
            { date: '2023-09', amount: '₹450' },
            { date: '2023-08', amount: '₹400' }
          ]
        },
        parentAgent: {
          id: 'USR002',
          name: 'Priya Patel',
          role: 'Agent'
        }
      };
      
      setUser(mockUser);
      setLoading(false);
    }, 800);
  }, [userId]);

  const handleBack = () => {
    navigate('/users');
  };

  const handleStatusToggle = () => {
    if (user) {
      setUser({
        ...user,
        status: user.status === 'active' ? 'inactive' : 'active'
      });
      // Would make API call in real app
    }
  };

  const handleSave = () => {
    // Would make API call to save changes in real app
    alert('Changes saved successfully!');
  };

  const handleInputChange = (field, value) => {
    setUser({
      ...user,
      [field]: value
    });
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setUser({
      ...user,
      [parentField]: {
        ...user[parentField],
        [field]: value
      }
    });
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!user) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-header">
          <button className="btn btn-secondary" onClick={handleBack}>Back to Users</button>
        </div>
        <div className="card">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail-container">
      <div className="user-detail-header">
        <button className="btn btn-secondary" onClick={handleBack}>Back to Users</button>
        <h1 className="page-title">User Details</h1>
        <div className="header-actions">
          <button 
            className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
            onClick={handleStatusToggle}
          >
            {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
      
      <div className="user-profile-header card">
        <div className="user-avatar">
          {user.name.charAt(0)}
        </div>
        <div className="user-basic-info">
          <h2>{user.name}</h2>
          <div className="user-meta">
            <span className="user-id">ID: {user.id}</span>
            <span className="user-role">{user.role}</span>
            <span className={`user-status status-badge badge-${user.status === 'active' ? 'success' : 'danger'}`}>
              {user.status}
            </span>
          </div>
        </div>
        <div className="user-quick-stats">
          <div className="quick-stat">
            <div className="stat-label">Balance</div>
            <div className="stat-value">{user.balance}</div>
          </div>
          <div className="quick-stat">
            <div className="stat-label">Commission</div>
            <div className="stat-value">{user.commission.earned}</div>
          </div>
        </div>
      </div>
      
      <div className="user-detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab-button ${activeTab === 'bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('bets')}
        >
          Betting History
        </button>
        <button 
          className={`tab-button ${activeTab === 'commission' ? 'active' : ''}`}
          onClick={() => setActiveTab('commission')}
        >
          Commission
        </button>
      </div>
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Personal Information</h2>
            </div>
            <div className="card-content">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={user.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="text" 
                    id="phone" 
                    value={user.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={user.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select 
                    id="role" 
                    value={user.role} 
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <option value="Client">Client</option>
                    <option value="Agent">Agent</option>
                    <option value="Super Agent">Super Agent</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
         
          
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Agent Hierarchy</h2>
            </div>
            <div className="card-content">
              {user.parentAgent ? (
                <div className="parent-agent-info">
                  <h3>Parent Agent</h3>
                  <div className="agent-card">
                    <div className="agent-avatar">{user.parentAgent.name.charAt(0)}</div>
                    <div className="agent-details">
                      <div className="agent-name">{user.parentAgent.name}</div>
                      <div className="agent-meta">
                        <span className="agent-id">ID: {user.parentAgent.id}</span>
                        <span className="agent-role">{user.parentAgent.role}</span>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-secondary"
                      onClick={() => navigate(`/users/${user.parentAgent.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ) : (
                <p>This user doesn't have a parent agent.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Transaction History</h2>
            </div>
            <div className="table-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td className={`transaction-type ${transaction.type}`}>{transaction.type}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.date}</td>
                      <td>
                        <span className={`status-badge badge-${transaction.status === 'completed' ? 'success' : 'warning'}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary">View All Transactions</button>
              <button className="btn btn-primary">Add Manual Transaction</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bets Tab */}
      {activeTab === 'bets' && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Betting History</h2>
            </div>
            <div className="table-container">
              <table className="bets-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Game</th>
                    <th>Amount</th>
                    <th>Odds</th>
                    <th>Outcome</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.bets.map((bet) => (
                    <tr key={bet.id}>
                      <td>{bet.id}</td>
                      <td>{bet.game}</td>
                      <td>{bet.amount}</td>
                      <td>{bet.odds}</td>
                      <td>
                        <span className={`status-badge badge-${bet.outcome === 'win' ? 'success' : 'danger'}`}>
                          {bet.outcome}
                        </span>
                      </td>
                      <td>{bet.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary">View All Bets</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Commission Tab */}
      {activeTab === 'commission' && (
        <div className="tab-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Commission Details</h2>
            </div>
            <div className="card-content">
              <div className="commission-summary">
                <div className="commission-stat">
                  <div className="stat-label">Commission Rate</div>
                  <div className="stat-value">{user.commission.rate}</div>
                </div>
                <div className="commission-stat">
                  <div className="stat-label">Total Earned</div>
                  <div className="stat-value">{user.commission.earned}</div>
                </div>
                <div className="commission-stat">
                  <div className="stat-label">Last Month</div>
                  <div className="stat-value">{user.commission.lastMonth}</div>
                </div>
              </div>
              
              <div className="commission-form">
                <h3>Update Commission Rate</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="commissionRate">New Commission Rate</label>
                    <div className="input-with-button">
                      <input 
                        type="text" 
                        id="commissionRate" 
                        value={user.commission.rate.replace('%', '')} 
                        onChange={(e) => handleNestedInputChange('commission', 'rate', `${e.target.value}%`)}
                      />
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                  <div className="form-action">
                    <button className="btn btn-primary">Update Rate</button>
                  </div>
                </div>
              </div>
              
              <h3>Commission History</h3>
              <div className="table-container">
                <table className="commission-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.commission.history.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail; 