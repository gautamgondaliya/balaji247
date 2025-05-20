import React, { useState, useEffect } from 'react';
import '../styles/Cricket.css';

const Cricket = () => {
  const [matches, setMatches] = useState([
    {
      id: 1,
      league: 'Indian Premier League',
      teams: 'Chennai Super Kings v Rajasthan Royals',
      status: 'LIVE',
      date: '19 May 2025',
      time: '19:30',
      bets: 156
    },
    {
      id: 2,
      league: 'Pakistan Super League',
      teams: 'Lahore Qalandars v Karachi Kings',
      status: 'UPCOMING',
      date: '20 May 2025',
      time: '16:00',
      bets: 72
    },
    {
      id: 3,
      league: 'Indian Premier League',
      teams: 'Mumbai Indians v Delhi Capitals',
      status: 'UPCOMING',
      date: '20 May 2025',
      time: '19:30',
      bets: 98
    }
  ]);
  
  const [overMarkets, setOverMarkets] = useState([
    {
      id: 1,
      matchId: 1,
      description: '6 OVER RUNS CSK(CSK VS RR)',
      no: 0.00,
      yes: 0.00,
      minBet: 100,
      maxBet: 25000,
      bets: []
    },
    {
      id: 2,
      matchId: 1,
      description: '6 OVER RUNS RR(CSK VS RR)',
      no: 0.00,
      yes: 0.00,
      minBet: 100,
      maxBet: 25000,
      bets: []
    }
  ]);
  
  const [matchOdds, setMatchOdds] = useState([
    {
      id: 1,
      matchId: 1,
      lgaai: 0.00,
      khaai: 0.00,
      minBet: 100,
      maxBet: 25000,
      bets: []
    }
  ]);
  
  const [userBets, setUserBets] = useState([
    {
      id: 1,
      userId: 4,
      username: 'Rahul',
      phone: '1234567890',
      matchId: 1,
      betType: 'Match Odds',
      selection: 'CSK',
      amount: 5000,
      odds: 1.95,
      potentialWin: 9750,
      status: 'PENDING',
      date: '19 May 2025',
      time: '18:45'
    },
    {
      id: 2,
      userId: 2,
      username: 'Sanu',
      phone: '8979066955',
      matchId: 1,
      betType: 'Over Market',
      selection: '6 OVER RUNS CSK > 50',
      amount: 2000,
      odds: 1.85,
      potentialWin: 3700,
      status: 'PENDING',
      date: '19 May 2025',
      time: '19:05'
    },
    {
      id: 3,
      userId: 3,
      username: 'Raaz',
      phone: '9752090369',
      matchId: 2,
      betType: 'Match Odds',
      selection: 'Lahore Qalandars',
      amount: 1500,
      odds: 2.10,
      potentialWin: 3150,
      status: 'PENDING',
      date: '20 May 2025',
      time: '10:15'
    },
    {
      id: 4,
      userId: 1,
      username: 'Abhishek',
      phone: '9508535424',
      matchId: 3,
      betType: 'Match Odds',
      selection: 'Mumbai Indians',
      amount: 3000,
      odds: 1.85,
      potentialWin: 5550,
      status: 'PENDING',
      date: '20 May 2025',
      time: '15:30'
    }
  ]);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');
  const [matchBets, setMatchBets] = useState([]);
  
  const viewMatchDetails = (match) => {
    setSelectedMatch(match);
    // Filter bets for this specific match
    const betsForMatch = userBets.filter(bet => bet.matchId === match.id);
    setMatchBets(betsForMatch);
    setActiveTab('markets');
  };
  
  const handleOddsUpdate = (marketId, type, value) => {
    // Update odds for match odds
    if (type === 'lgaai' || type === 'khaai') {
      setMatchOdds(matchOdds.map(odd => 
        odd.id === marketId ? { ...odd, [type]: parseFloat(value) } : odd
      ));
    } 
    // Update odds for over markets
    else if (type === 'no' || type === 'yes') {
      setOverMarkets(overMarkets.map(market => 
        market.id === marketId ? { ...market, [type]: parseFloat(value) } : market
      ));
    }
  };
  
  return (
    <div className="cricket-page">
      <div className="cricket-header">
        <h1>BALAJI CRICKET</h1>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button 
          className={`tab-btn ${activeTab === 'markets' ? 'active' : ''}`}
          onClick={() => setActiveTab('markets')}
          disabled={!selectedMatch}
        >
          Markets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'match-bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('match-bets')}
          disabled={!selectedMatch}
        >
          Match Bets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('bets')}
        >
          All User Bets
        </button>
      </div>
      
      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="matches-tab">
          <table className="matches-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>League</th>
                <th>Match</th>
                <th>Status</th>
                <th>Date</th>
                <th>Bets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => (
                <tr key={match.id} className={match.status === 'LIVE' ? 'live-match' : ''}>
                  <td>{match.id}</td>
                  <td>
                    <div className="league-cell">
                      {match.status === 'LIVE' && <span className="live-badge">LIVE</span>}
                      {match.league}
                    </div>
                  </td>
                  <td>{match.teams}</td>
                  <td>
                    <span className={`status-badge ${match.status.toLowerCase()}`}>
                      {match.status}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <div>{match.date}</div>
                      <div className="match-time">{match.time}</div>
                    </div>
                  </td>
                  <td>{match.bets}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => viewMatchDetails(match)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Markets Tab */}
      {activeTab === 'markets' && selectedMatch && (
        <div className="markets-tab">
          <div className="match-info">
            <h2>{selectedMatch.teams}</h2>
            <p>{selectedMatch.league} | {selectedMatch.date} {selectedMatch.time}</p>
          </div>
          
          <div className="market-section">
            <div className="market-header">
              <h3>MATCH ODDS</h3>
              <button className="reverse-btn">REVERSE</button>
            </div>
            <table className="market-table">
              <thead>
                <tr>
                  <th>Settings</th>
                  <th>LGAAI</th>
                  <th>KHAAI</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {matchOdds
                  .filter(odd => odd.matchId === selectedMatch.id)
                  .map(odd => (
                    <tr key={odd.id}>
                      <td>Min: {odd.minBet} Max: {odd.maxBet}</td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01"
                          value={odd.lgaai} 
                          onChange={(e) => handleOddsUpdate(odd.id, 'lgaai', e.target.value)}
                          className="odds-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01"
                          value={odd.khaai} 
                          onChange={(e) => handleOddsUpdate(odd.id, 'khaai', e.target.value)}
                          className="odds-input"
                        />
                      </td>
                      <td>
                        <button className="submit-btn">SUBMIT</button>
                        <button className="suspend-btn">SUSPEND</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          <div className="market-section">
            <div className="market-header">
              <h3>OVER MARKET</h3>
              <button className="reverse-btn">REVERSE</button>
            </div>
            <table className="market-table">
              <thead>
                <tr>
                  <th>MARKET</th>
                  <th>NO</th>
                  <th>YES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {overMarkets
                  .filter(market => market.matchId === selectedMatch.id)
                  .map(market => (
                    <tr key={market.id}>
                      <td>
                        {market.description}
                        <div className="market-settings">Min: {market.minBet} Max: {market.maxBet}</div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01"
                          value={market.no} 
                          onChange={(e) => handleOddsUpdate(market.id, 'no', e.target.value)}
                          className="odds-input no"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01"
                          value={market.yes} 
                          onChange={(e) => handleOddsUpdate(market.id, 'yes', e.target.value)}
                          className="odds-input yes"
                        />
                      </td>
                      <td>
                        <div className="market-actions">
                          <div className="top-actions">
                            <input 
                              type="number" 
                              placeholder="Enter Runs" 
                              className="runs-input"
                            />
                            <button className="submit-btn">SUBMIT</button>
                          </div>
                          <button className="reverse-btn">REVERSE</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Match Bets Tab - Show bets for the selected match */}
      {activeTab === 'match-bets' && selectedMatch && (
        <div className="bets-tab">
          <div className="match-info">
            <h2>Bets for {selectedMatch.teams}</h2>
            <p>{selectedMatch.league} | {selectedMatch.date} {selectedMatch.time}</p>
          </div>
          
          {matchBets.length > 0 ? (
            <table className="bets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Bet Type</th>
                  <th>Selection</th>
                  <th>Amount</th>
                  <th>Odds</th>
                  <th>Potential Win</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {matchBets.map(bet => (
                  <tr key={bet.id}>
                    <td>{bet.id}</td>
                    <td>
                      <div className="user-cell">
                        <div>{bet.username}</div>
                        <div className="user-phone">{bet.phone}</div>
                      </div>
                    </td>
                    <td>{bet.betType}</td>
                    <td>{bet.selection}</td>
                    <td>₹ {bet.amount.toLocaleString()}</td>
                    <td>{bet.odds}</td>
                    <td>₹ {bet.potentialWin.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${bet.status.toLowerCase()}`}>
                        {bet.status}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <div>{bet.date}</div>
                        <div className="bet-time">{bet.time}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-bets-message">
              <p>No bets have been placed on this match yet.</p>
            </div>
          )}
        </div>
      )}
      
      {/* All User Bets Tab */}
      {activeTab === 'bets' && (
        <div className="bets-tab">
          <h2>All User Bets</h2>
          <table className="bets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Match</th>
                <th>Bet Type</th>
                <th>Selection</th>
                <th>Amount</th>
                <th>Odds</th>
                <th>Potential Win</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userBets.map(bet => {
                const match = matches.find(m => m.id === bet.matchId);
                return (
                  <tr key={bet.id}>
                    <td>{bet.id}</td>
                    <td>
                      <div className="user-cell">
                        <div>{bet.username}</div>
                        <div className="user-phone">{bet.phone}</div>
                      </div>
                    </td>
                    <td>{match ? match.teams : 'Unknown Match'}</td>
                    <td>{bet.betType}</td>
                    <td>{bet.selection}</td>
                    <td>₹ {bet.amount.toLocaleString()}</td>
                    <td>{bet.odds}</td>
                    <td>₹ {bet.potentialWin.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${bet.status.toLowerCase()}`}>
                        {bet.status}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <div>{bet.date}</div>
                        <div className="bet-time">{bet.time}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Cricket; 