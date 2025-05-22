import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    let intervalId;
    
    const fetchMatches = async () => {
      // Skip if we fetched within the last second (prevent overlapping requests)
      const now = Date.now();
      if (now - lastFetchTime < 1000) return;
      
      try {
        // Only show loading on initial fetch
        if (!matches) setLoading(true);
        
        const response = await axios.get(`https://zplay1.in/pb/api/v1/events/matches/inplay`);
        setMatches(response.data);
        setLastFetchTime(now);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMatches();
    
    // Set up interval for subsequent fetches
    intervalId = setInterval(fetchMatches, 3000);
    
    // Clean up interval on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [lastFetchTime, matches]);

  // Extract odds from the match data if available
  const getOddsFromMatchData = (match) => {
    try {
      if (match.runners && match.runners.length > 0) {
        let odds = [];

        // Function to extract odds from a runner's data
        const extractOdds = (runnerData) => {
          if (!runnerData || !runnerData.ex) return { back: "-", lay: "-" };
          
          // Extract best back odds (highest price)
          const backOdds = runnerData.ex.b && runnerData.ex.b.length > 0 
            ? runnerData.ex.b[0].p || "-" 
            : "-";
          
          // Extract best lay odds (lowest price)
          const layOdds = runnerData.ex.l && runnerData.ex.l.length > 0 
            ? runnerData.ex.l[0].p || "-" 
            : "-";
          
          return { back: backOdds, lay: layOdds };
        };

        // Get odds for all runners (up to 3)
        const runner1 = match.runners.length > 0 ? extractOdds(match.runners[0]) : { back: "-", lay: "-" };
        const runner2 = match.runners.length > 1 ? extractOdds(match.runners[1]) : { back: "-", lay: "-" };
        const runner3 = match.runners.length > 2 ? extractOdds(match.runners[2]) : { back: "-", lay: "-" };

        // Format odds array to match the layout
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
      
      // Default empty odds (all "-")
      return ["-", "-", "-", "-", "-", "-"];
    } catch (error) {
      console.error('Error extracting odds:', error);
      return ["-", "-", "-", "-", "-", "-"];
    }
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
      {(!matches?.data?.inplay || matches.data.inplay.length === 0) ? (
        <div style={{ padding: 40, color: '#888' }}>No matches found.</div>
      ) : (
        matches.data.inplay.map((match, idx) => {
          const odds = getOddsFromMatchData(match);
          const colors = ['blue', 'pink', 'blue', 'pink', 'blue', 'pink'];
          
          return (
            <div
              className="cricket-table-row"
              key={match.matchId || idx}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/sports-event-detail/${match.event_id}`)}
            >
              <div className="cricket-table-left">
                <div className="cricket-match-left-main-title-and-time">
                  <div className="cricket-title-section">
                    <div className="cricket-match-title">{match.event_name}</div>
                    <div className="cricket-match-subtitle">({match.league_name})</div>
                  </div>
                  <div className="cricket-match-status-row">
                    <span className="cricket-match-status">{match.inplay ? 'LIVE' : ""}</span>
                    <div className="cricket-match-date">
                      <div className="date">{formatDate(match.event_date).date}</div>
                      <div className="time">{formatDate(match.event_date).time}</div>
                    </div>
                  </div>
                </div>
                <div className="cricket-match-tv-f-b">
                  <span className="cricket-match-icons">
                    {[
                      match.is_populer ? "F" : null,
                      match.isMatchLive ? "TV" : null,
                      match.has_bookmaker ? "BM" : null,
                      match.has_premium_fancy ? "P" : null
                    ].filter(Boolean).map((icon, i) => (
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