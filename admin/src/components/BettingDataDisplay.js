import React, { useState, useEffect } from 'react';
import { parseApiResponse, parseBettingData } from '../utils/apiUtils';
import './BettingDataDisplay.css';

const BettingDataDisplay = ({ rawData }) => {
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (!rawData) {
        setLoading(false);
        return;
      }

      // Extract data from the raw API response
      const messagesData = rawData.messages || "{}";
      const booksData = rawData.books || "{}";
      const inactiveMarketsData = rawData.inactiveMarkets || "[]";
      const scoreData = rawData.score || "{}";

      // Parse the betting data
      const bettingData = parseBettingData(messagesData, booksData, inactiveMarketsData);
      
      // Parse score data if available
      const score = parseApiResponse(scoreData);

      // Set the parsed data
      setParsedData({ 
        ...bettingData,
        score
      });

      setLoading(false);
    } catch (err) {
      console.error("Error processing betting data:", err);
      setError("Failed to process data. See console for details.");
      setLoading(false);
    }
  }, [rawData]);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!parsedData) return <div>No data available</div>;

  // Render active messages
  const renderMessages = () => {
    if (!parsedData.messages) return null;
    
    const messageEntries = Object.entries(parsedData.messages);
    if (messageEntries.length === 0) return <div>No messages available</div>;

    return (
      <div className="betting-messages">
        <h3>Messages</h3>
        <div className="message-list">
          {messageEntries.map(([marketId, messages]) => (
            <div key={marketId} className="market-messages">
              <h4>Market ID: {marketId}</h4>
              <ul>
                {Array.isArray(messages) && messages.map((msg, idx) => (
                  <li key={idx} className={msg.isActive ? 'active' : 'inactive'}>
                    <span className="timestamp">{new Date(msg.time * 1000).toLocaleString()}</span>
                    <span className="message-content">{msg.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render books data
  const renderBooks = () => {
    if (!parsedData.books) return null;
    
    const bookEntries = Object.entries(parsedData.books)
      .filter(([_, value]) => value !== null)
      .slice(0, 10); // Limit to first 10 for readability
    
    if (bookEntries.length === 0) return <div>No books data available</div>;

    return (
      <div className="betting-books">
        <h3>Books (First 10)</h3>
        <table className="books-table">
          <thead>
            <tr>
              <th>Market ID</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {bookEntries.map(([marketId, bookData]) => {
              if (typeof bookData === 'string') {
                const parts = bookData.split('|');
                return (
                  <tr key={marketId}>
                    <td>{marketId}</td>
                    <td>{parts[2] || 'N/A'}</td>
                    <td>
                      {parts[5] ? new Date(parseInt(parts[5])).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render score data
  const renderScore = () => {
    if (!parsedData.score) return null;

    return (
      <div className="score-data">
        <h3>Match Score</h3>
        <div className="match-info">
          <p><strong>Event:</strong> {parsedData.score.en || 'N/A'}</p>
          <p><strong>Home Team:</strong> {parsedData.score.h || 'N/A'}</p>
          <p><strong>Away Team:</strong> {parsedData.score.a || 'N/A'}</p>
          <p><strong>Match Format:</strong> {parsedData.score.mf || 'N/A'}</p>
          <p><strong>Status:</strong> {parsedData.score.m || 'N/A'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="betting-data-container">
      <h2>Betting Data</h2>
      
      {renderScore()}
      {renderMessages()}
      {renderBooks()}
      
      {/* Optional - Show inactive markets */}
      <div className="inactive-markets">
        <h3>Inactive Markets Count</h3>
        <p>{Array.isArray(parsedData.inactiveMarkets) ? parsedData.inactiveMarkets.length : 0} markets</p>
      </div>
    </div>
  );
};

export default BettingDataDisplay; 