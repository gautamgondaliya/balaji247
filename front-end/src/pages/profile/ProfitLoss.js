import React, { useState } from 'react';
import './ProfitLoss.css';

const ProfitLoss = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sportType, setSportType] = useState('Cricket');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);
  const [totalPL, setTotalPL] = useState(0);

  // Game types from Sidebar.js
  const gameTypes = [
    'Cricket',
    'Football',
    'Tennis',
    'Sports Book',
    'Matka',
    'Cricket Fight',
    'Casino',
    'Evolution',
    'FIFA CUP WINNER',
    'WINNER CUP',
  ];

  const handleSubmit = () => {
    setLoading(true);
    setSearched(true);
    
    // Simulate API call
    setTimeout(() => {
      // This would be replaced with actual API data
      setData([]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="profit-loss-page">
      <div className="profit-loss-header">
        <h2>PROFIT LOSS</h2>
        <div className="total-pl">TOTAL P/L: ₹{totalPL}</div>
      </div>
      
      <div className="profit-loss-content">
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

        <div className="profit-loss-btn-type">
          <div className="type-filter">
            <label>Type</label>
            <select value={sportType} onChange={(e) => setSportType(e.target.value)}>
              {gameTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <button className="submit-btn" onClick={handleSubmit}>
            SUBMIT
          </button>
        </div>
        
        <div className="profit-loss-results">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : searched ? (
            <table className="profit-loss-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Comm</th>
                  <th>Total</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data-cell">No Data Found</td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.date}</td>
                      <td>{item.amount}</td>
                      <td>{item.comm}</td>
                      <td>{item.total}</td>
                      <td>{item.event}</td>
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

export default ProfitLoss; 