import React, { useState } from 'react';
import './AccountStatement.css';

const AccountStatement = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [type, setType] = useState('All');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true); // Set to true to show table by default

  // Types for dropdown
  const types = [
    'All',
    'Deposit',
    'Withdrawal',
    'Bet',
    'Settlement',
    'Commission',
    'Bonus',
    'Adjustment'
  ];

  const handleGetStatement = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // This would be replaced with actual API data
      setData([]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="account-statement-page">
      <div className="account-statement-header">
        <h2>ACCOUNT STATEMENT</h2>
      </div>
      
      <div className="account-statement-content">
        <div className="search-filters">
          <div className="date-filters">
            <div className="date-input-group">
              <label>From Date</label>
              <div className="date-input">
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="date-input-group">
              <label>To Date</label>
              <div className="date-input">
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="statement-btn-type">
          <div className="type-filter">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <button className="get-statement-btn" onClick={handleGetStatement}>
            GET STATEMENT
          </button>
        </div>
        
        <div className="account-statement-results">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : searched ? (
            <table className="account-statement-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Total</th>
                  <th>Balance</th>
                  <th>D/C</th>
                  <th>Description</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data-cell">No Data Found</td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.no}</td>
                      <td>{item.date}</td>
                      <td>{item.amount}</td>
                      <td>{item.commission}</td>
                      <td>{item.total}</td>
                      <td>{item.balance}</td>
                      <td>{item.dc}</td>
                      <td>{item.description}</td>
                      <td>{item.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AccountStatement; 