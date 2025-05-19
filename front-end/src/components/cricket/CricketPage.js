import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CricketPage.css';

const iconMap = {
  F: <span title="Favorite" style={{fontWeight: 'bold'}}>F</span>,
  TV: <span title="TV" role="img" aria-label="tv">📺</span>,
  BM: <span title="BM" className="cricket-bm">BM</span>,
  P: <span title="Premium" className="cricket-premium">P</span>,
  "🎮": <span title="Game" role="img" aria-label="game">🎮</span>,
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return {
    date: `${day} ${month}`,
    time: `${formattedHours}:${formattedMinutes} ${ampm}`
  };
};

const CricketPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.dynexbet.com/api/v1/sports/4');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setMatches(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Extract odds from the metadata if available
  const getOddsFromMetadata = (match) => {
    try {
      if (match.metadata && match.metadata.book) {
        const bookParts = match.metadata.book.split('|');
        if (bookParts.length >= 7) {
          const runnersData = bookParts[7].split(',');
          let odds = [];

          // Function to extract odds from a runner's data
          const extractOdds = (runnerData) => {
            if (!runnerData) return { back: "-", lay: "-" };
            const parts = runnerData.split('~');
            if (parts.length < 4) return { back: "-", lay: "-" };

            // Extract back odds (first value before :)
            const backOdds = parts[2].split(':')[0].split('*')[0] || "-";
            // Extract lay odds (first value before :)
            const layOdds = parts[3].split(':')[0].split('*')[0] || "-";
            
            return { back: backOdds, lay: layOdds };
          };

          // Get odds for all runners
          const runner1 = extractOdds(runnersData[0]);
          const runner2 = extractOdds(runnersData[1]);
          const runner3 = runnersData.length > 2 ? extractOdds(runnersData[2]) : { back: "-", lay: "-" };

          // Format odds array to match the screenshot layout
          odds = [
            runner1.back || "-",    // Column 1 (blue)
            runner1.lay || "-",     // Column 2 (pink)
            runner2.back || "-",    // Column 3 (blue)
            runner2.lay || "-",     // Column 4 (pink)
            runner3.back || "-",    // Column 5 (blue)
            runner3.lay || "-"      // Column 6 (pink)
          ];

          return odds;
        }
      }
    } catch (err) {
      console.error('Error processing odds:', err);
    }
    
    return ["-", "-", "-", "-", "-", "-"];
  };

  const renderOddsButton = (value, color, index) => (
    <div className="cricket-odds-col" key={index}>
      <button 
        className={`cricket-odd-btn cricket-odd-${color}`}
        onClick={(e) => {
          e.stopPropagation();
          // Handle odds click
        }}
      >
        {value}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="cricket-table">
        <div className="cricket-table-header-row">
          <div className="cricket-table-header-left">
            <span className="cricket-header-icon">🏏</span>
            <span className="cricket-header-title">CRICKET</span>
            <button className="cricket-header-tab active">+ LIVE</button>
            <button className="cricket-header-tab">+ VIRTUAL</button>
          </div>
          <div className="cricket-table-header-right">
            <div className="cricket-odds-header">
              <div className="stack-1">1</div>
              <div className="stack-1">X</div>
              <div className="stack-1">2</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cricket-table">
        <div className="cricket-table-header-row">
          <div className="cricket-table-header-left">
            <span className="cricket-header-icon">🏏</span>
            <span className="cricket-header-title">CRICKET</span>
            <button className="cricket-header-tab active">+ LIVE</button>
            <button className="cricket-header-tab">+ VIRTUAL</button>
          </div>
          <div className="cricket-table-header-right">
            <div className="cricket-odds-header">
              <div className="stack-1">1</div>
              <div className="stack-1">X</div>
              <div className="stack-1">2</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 40, color: '#c3003c' }}>Error loading matches: {error}</div>
      </div>
    );
  }

  return (
    <div className="cricket-table">
      <div className="cricket-table-header-row">
        <div className="cricket-table-header-left">
        <div className="cricket-header-title-main-yes">
          <span className="cricket-header-icon">🏏</span>
          <span className="cricket-header-title">CRICKET</span>
          </div>
          <div className="cricket-main-header-live-virtual">
          <button className="cricket-header-tab active">+ LIVE</button>
          <button className="cricket-header-tab">+ VIRTUAL</button>
          </div>
        </div>
        <div className="cricket-table-header-right">
          <div className="cricket-odds-header">
            <div className="stack-1">1</div>
            <div className="stack-1">X</div>
            <div className="stack-1">2</div>
          </div>
        </div>
      </div>
      {(!matches?.data || matches.data.length === 0) ? (
        <div style={{ padding: 40, color: '#888' }}>No matches found.</div>
      ) : (
        matches.data.map((match, idx) => {
          const odds = getOddsFromMetadata(match);
          const colors = ['blue', 'pink', 'blue', 'pink', 'blue', 'pink'];
          
          return (
            <div
              className="cricket-table-row"
              key={match.event.id || idx}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/sports-event-detail/${match.event.id}`)}
            >
              <div className="cricket-table-left">
              <div className="cricket-match-left-main-title-and-time">
                <div className="cricket-title-section">
                  <div className="cricket-match-title">{match.event.name}</div>
                  <div className="cricket-match-subtitle">({match.competition.name})</div>
                </div>
                <div className="cricket-match-status-row">
                  <span className="cricket-match-status">{match.catalogue.inPlay ? 'LIVE' : ""}</span>
                  <div className="cricket-match-date">
                    <div className="date">{formatDate(match.event.openDate).date}</div>
                    <div className="time">{formatDate(match.event.openDate).time}</div>
                  </div>
                  </div>
                 
                </div>
                <div className="cricket-match-tv-f-b">
                   <span className="cricket-match-icons">
                    {["F", "TV", "BM", "P"].map((icon, i) => (
                      <span key={i} className="cricket-match-icon">{iconMap[icon] || icon}</span>
                    ))}
                  </span>
                </div>
              </div>
              <div className="cricket-table-right">
                {odds.map((value, index) => renderOddsButton(
                  value === "-" ? "-" : Number(value).toFixed(2),
                  colors[index],
                  index
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CricketPage; 