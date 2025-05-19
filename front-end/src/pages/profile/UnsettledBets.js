import React, { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import './UnsettledBets.css';

const UnsettledBets = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sportType, setSportType] = useState('Cricket');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleGetStatement = () => {
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
    <div className="unsettled-bets-page">
      <div className="unsettled-bets-header">
        <h2>UNSETTLED BETS</h2>
      </div>
      
      <div className="unsettled-bets-content">
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

        <div className="unsettled-bets0btn-type">
          <div className="type-filter">
            <label>Type</label>
            <select value={sportType} onChange={(e) => setSportType(e.target.value)}>
              <option value="Cricket">Cricket</option>
              <option value="Football">Football</option>
              <option value="Tennis">Tennis</option>
              <option value="Horse Racing">Horse Racing</option>
            </select>
          </div>
          
          
          <button className="get-statement-btn" onClick={handleGetStatement}>
            GET STATEMENT
          </button>
        </div>
        
        <div className="unsettled-bets-results">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : searched ? (
            data.length === 0 ? (
              <div className="no-data">No Data Found</div>
            ) : (
              <table className="unsettled-bets-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Market</th>
                    <th>Selection</th>
                    <th>Type</th>
                    <th>Odds</th>
                    <th>Stake</th>
                    <th>Liability</th>
                    <th>Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((bet, index) => (
                    <tr key={index}>
                      <td>{bet.date}</td>
                      <td>{bet.event}</td>
                      <td>{bet.market}</td>
                      <td>{bet.selection}</td>
                      <td>{bet.type}</td>
                      <td>{bet.odds}</td>
                      <td>{bet.stake}</td>
                      <td>{bet.liability}</td>
                      <td>{bet.profitLoss}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UnsettledBets; 