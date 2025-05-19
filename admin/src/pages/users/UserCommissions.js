import React, { useState, useEffect } from 'react';
import './UserCommissions.css';

const UserCommissions = () => {
  // State for commission structure by role
  const [commissionStructure, setCommissionStructure] = useState({
    'Super Admin': { commission: 100, share: 5 },
    'Master': { commission: 95, share: 10 },
    'Sub Admin': { commission: 85, share: 15 },
    'Agent': { commission: 70, share: 20 },
    'Client': { commission: 0, share: 0 }
  });

  // State for commission history/records
  const [commissionRecords, setCommissionRecords] = useState([]);
  
  // State for role being edited
  const [editingRole, setEditingRole] = useState(null);
  const [tempCommission, setTempCommission] = useState({ commission: 0, share: 0 });

  // Filter states
  const [roleFilter, setRoleFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Sample data for commission distribution visualization
  const [sampleBet, setSampleBet] = useState({
    amount: 1000,
    loss: true, // Only distribute commission on loss
  });

  // Sample commission history
  const sampleCommissionHistory = [
    { id: 1, userId: 'USR001', userName: 'Rahul Sharma', role: 'Agent', amount: 150, date: '2023-10-15', betId: 'BET123', description: 'Commission from bet loss' },
    { id: 2, userId: 'USR002', userName: 'Priya Patel', role: 'Sub Admin', amount: 85, date: '2023-10-14', betId: 'BET120', description: 'Commission from bet loss' },
    { id: 3, userId: 'USR003', userName: 'Vikram Singh', role: 'Master', amount: 45, date: '2023-10-13', betId: 'BET118', description: 'Commission from bet loss' },
    { id: 4, userId: 'USR004', userName: 'Ananya Desai', role: 'Super Admin', amount: 25, date: '2023-10-12', betId: 'BET115', description: 'Commission from bet loss' },
    { id: 5, userId: 'USR001', userName: 'Rahul Sharma', role: 'Agent', amount: 120, date: '2023-10-10', betId: 'BET110', description: 'Commission from bet loss' },
  ];

  // Fetch commission structure and history on component mount
  useEffect(() => {
    // In a real app, this would be API calls:
    // fetchCommissionStructure();
    // fetchCommissionHistory();
    setCommissionRecords(sampleCommissionHistory);
  }, []);

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const startEditRole = (role) => {
    setEditingRole(role);
    setTempCommission({ ...commissionStructure[role] });
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setTempCommission({ commission: 0, share: 0 });
  };

  const saveCommissionStructure = () => {
    // Validate input
    if (tempCommission.commission < 0 || tempCommission.commission > 100 || 
        tempCommission.share < 0 || tempCommission.share > 100) {
      alert('Commission and share values must be between 0 and 100');
      return;
    }
    
    // Update commission structure
    setCommissionStructure({
      ...commissionStructure,
      [editingRole]: { ...tempCommission }
    });
    
    // In a real app, save to backend:
    // saveCommissionToAPI(editingRole, tempCommission);
    
    // Reset editing state
    setEditingRole(null);
    setTempCommission({ commission: 0, share: 0 });
  };

  const handleCommissionChange = (e) => {
    setTempCommission({
      ...tempCommission,
      [e.target.name]: parseFloat(e.target.value)
    });
  };
  
  const handleBetAmountChange = (e) => {
    setSampleBet({
      ...sampleBet,
      amount: parseFloat(e.target.value)
    });
  };

  const toggleBetResult = () => {
    setSampleBet({
      ...sampleBet,
      loss: !sampleBet.loss
    });
  };

  // Filter commission records
  const filteredRecords = commissionRecords.filter(record => {
    // Filter by role
    if (roleFilter !== 'All' && record.role !== roleFilter) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.from && new Date(record.date) < new Date(dateRange.from)) {
      return false;
    }
    
    if (dateRange.to && new Date(record.date) > new Date(dateRange.to)) {
      return false;
    }
    
    return true;
  });

  // Calculate commission distribution for the sample bet
  const calculateCommissionDistribution = () => {
    if (!sampleBet.loss) return [];
    
    const hierarchy = ['Client', 'Agent', 'Sub Admin', 'Master', 'Super Admin'];
    let remainingAmount = sampleBet.amount;
    const distribution = [];
    
    for (let i = 0; i < hierarchy.length - 1; i++) {
      const currentRole = hierarchy[i];
      const nextRole = hierarchy[i + 1];
      
      if (i > 0) { // Skip Client as they don't get commission
        const share = commissionStructure[currentRole].share;
        const commissionAmount = (sampleBet.amount * share) / 100;
        
        distribution.push({
          role: currentRole,
          percentage: share,
          amount: commissionAmount.toFixed(2)
        });
        
        remainingAmount -= commissionAmount;
      }
    }
    
    // Super Admin gets the remainder
    const superAdminShare = commissionStructure['Super Admin'].share;
    const superAdminCommission = (sampleBet.amount * superAdminShare) / 100;
    
    distribution.push({
      role: 'Super Admin',
      percentage: superAdminShare,
      amount: superAdminCommission.toFixed(2)
    });
    
    return distribution;
  };

  const commissionDistribution = calculateCommissionDistribution();

  return (
    <div className="commissions-container">
      <div className="commissions-header">
        <h1 className="page-title">User Commissions</h1>
      </div>
      
      {/* Commission Structure Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Commission Structure by Role</h2>
          <p className="card-subtitle">Define the commission percentage for each role in the hierarchy</p>
        </div>
        
        <div className="commission-structure">
          <div className="hierarchy-diagram">
            <div className="hierarchy-title">Admin Layers Hierarchy</div>
            <div className="hierarchy-flow">
              <div className="hierarchy-node">Client</div>
              <div className="hierarchy-arrow">→</div>
              <div className="hierarchy-node">Agent</div>
              <div className="hierarchy-arrow">→</div>
              <div className="hierarchy-node">Sub Admin</div>
              <div className="hierarchy-arrow">→</div>
              <div className="hierarchy-node">Master</div>
              <div className="hierarchy-arrow">→</div>
              <div className="hierarchy-node">Super Admin</div>
            </div>
            <div className="hierarchy-permissions">
              <div className="permission-item">
                <span className="permission-role">Super Admin:</span> Can create all roles
              </div>
              <div className="permission-item">
                <span className="permission-role">Master:</span> Can create Sub Admin and Agent
              </div>
              <div className="permission-item">
                <span className="permission-role">Sub Admin:</span> Can create Agent only
              </div>
              <div className="permission-item">
                <span className="permission-role">Agent:</span> Can create Client only
              </div>
            </div>
          </div>
          
          <table className="commission-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Commission %</th>
                <th>Share %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(commissionStructure).map(([role, { commission, share }]) => (
                <tr key={role}>
                  <td className="role-cell">{role}</td>
                  <td>
                    {editingRole === role ? (
                      <input
                        type="number"
                        name="commission"
                        value={tempCommission.commission}
                        onChange={handleCommissionChange}
                        min="0"
                        max="100"
                      />
                    ) : (
                      `${commission}%`
                    )}
                  </td>
                  <td>
                    {editingRole === role ? (
                      <input
                        type="number"
                        name="share"
                        value={tempCommission.share}
                        onChange={handleCommissionChange}
                        min="0"
                        max="100"
                      />
                    ) : (
                      `${share}%`
                    )}
                  </td>
                  <td>
                    {editingRole === role ? (
                      <div className="edit-actions">
                        <button onClick={saveCommissionStructure} className="btn btn-success btn-sm">Save</button>
                        <button onClick={cancelEdit} className="btn btn-secondary btn-sm">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEditRole(role)} className="btn btn-primary btn-sm">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Commission Distribution Visualization */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">Commission Distribution Simulator</h2>
          <p className="card-subtitle">See how commission is distributed across admin layers</p>
        </div>
        
        <div className="commission-simulator">
          <div className="simulator-controls">
            <div className="form-group">
              <label>Bet Amount</label>
              <input
                type="number"
                value={sampleBet.amount}
                onChange={handleBetAmountChange}
                min="100"
              />
            </div>
            
            <div className="form-group">
              <label>Bet Result</label>
              <div className="toggle-container">
                <button 
                  className={`toggle-btn ${sampleBet.loss ? 'active' : ''}`} 
                  onClick={toggleBetResult}
                >
                  Loss (Commission applies)
                </button>
                <button 
                  className={`toggle-btn ${!sampleBet.loss ? 'active' : ''}`} 
                  onClick={toggleBetResult}
                >
                  Win (No commission)
                </button>
              </div>
            </div>
          </div>
          
          <div className="distribution-results">
            {sampleBet.loss ? (
              <>
                <h3 className="distribution-title">Commission Distribution</h3>
                <div className="distribution-chart">
                  {commissionDistribution.map((item, index) => (
                    <div key={index} className="distribution-bar-container">
                      <div className="distribution-label">{item.role}</div>
                      <div className="distribution-bar" style={{ width: `${item.percentage}%` }}></div>
                      <div className="distribution-value">
                        {item.percentage}% (₹{item.amount})
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-commission-message">
                <p>No commission is distributed on winning bets</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Commission History */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">Commission History</h2>
          
          <div className="filters">
            <div className="filter-group">
              <label>Filter by Role</label>
              <select value={roleFilter} onChange={handleRoleFilterChange}>
                <option value="All">All Roles</option>
                <option value="Agent">Agent</option>
                <option value="Sub Admin">Sub Admin</option>
                <option value="Master">Master</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  name="from"
                  value={dateRange.from}
                  onChange={handleDateRangeChange}
                  placeholder="From"
                />
                <span>to</span>
                <input
                  type="date"
                  name="to"
                  value={dateRange.to}
                  onChange={handleDateRangeChange}
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="commission-history">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Role</th>
                <th>Bet ID</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.userName}</td>
                    <td>{record.role}</td>
                    <td>{record.betId}</td>
                    <td className="amount-cell">₹{record.amount}</td>
                    <td>{record.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-records">
                    No commission records found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserCommissions; 