import React, { useState } from 'react';
import '../styles/Cricket.css';
import '../styles/Payments.css';

const ResultDeclaration = () => {
  const [completedMatches, setCompletedMatches] = useState([
    {
      id: 1,
      league: 'Indian Premier League',
      teams: 'Mumbai Indians v Delhi Capitals',
      date: '18 May 2025',
      time: '19:30',
      winner: 'Mumbai Indians',
      declared: true
    },
    {
      id: 2,
      league: 'Pakistan Super League',
      teams: 'Lahore Qalandars v Karachi Kings',
      date: '17 May 2025',
      time: '16:00',
      winner: 'Karachi Kings',
      declared: true
    },
    {
      id: 3,
      league: 'Indian Premier League',
      teams: 'Chennai Super Kings v Rajasthan Royals',
      date: '17 May 2025',
      time: '19:30',
      winner: null,
      declared: false
    }
  ]);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winnerSelection, setWinnerSelection] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openDeclarationModal = (match) => {
    setSelectedMatch(match);
    setWinnerSelection(match.winner || '');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
    setWinnerSelection('');
  };
  
  const handleWinnerSelection = (team) => {
    setWinnerSelection(team);
  };
  
  const declareResult = () => {
    if (!winnerSelection) return;
    
    setCompletedMatches(completedMatches.map(match => 
      match.id === selectedMatch.id 
        ? { ...match, winner: winnerSelection, declared: true } 
        : match
    ));
    
    closeModal();
  };
  
  // Extract team names from the match string (e.g., "Team A v Team B")
  const getTeamNames = (matchString) => {
    const teams = matchString.split(' v ');
    return teams;
  };
  
  return (
    <div className="cricket-page">
      <div className="payment-management-header">
        <h1>
          <i className="fas fa-trophy"></i> RESULT DECLARATION
        </h1>
        <button className="refresh-button">
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      
      <div className="matches-tab">
        <table className="matches-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>League</th>
              <th>Match</th>
              <th>Date</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {completedMatches.map(match => (
              <tr key={match.id}>
                <td>{match.id}</td>
                <td>{match.league}</td>
                <td>{match.teams}</td>
                <td>
                  <div className="date-cell">
                    <div>{match.date}</div>
                    <div className="match-time">{match.time}</div>
                  </div>
                </td>
                <td>
                  {match.declared ? (
                    <span className="status-badge approved">
                      {match.winner}
                    </span>
                  ) : (
                    <span className="status-badge pending">
                      Not Declared
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {!match.declared ? (
                      <button 
                        className="approve-btn"
                        onClick={() => openDeclarationModal(match)}
                      >
                        <i className="fas fa-trophy"></i> Declare Result
                      </button>
                    ) : (
                      <button 
                        className="view-btn"
                        onClick={() => openDeclarationModal(match)}
                      >
                        <i className="fas fa-eye"></i> View Result
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && selectedMatch && (
        <div className="payment-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Result Declaration</h2>
              <button 
                className="close-btn"
                onClick={closeModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-detail">
                <span>Match:</span>
                <span>{selectedMatch.teams}</span>
              </div>
              <div className="payment-detail">
                <span>League:</span>
                <span>{selectedMatch.league}</span>
              </div>
              <div className="payment-detail">
                <span>Date & Time:</span>
                <span>{selectedMatch.date} at {selectedMatch.time}</span>
              </div>
              
              {!selectedMatch.declared && (
                <div className="winner-selection">
                  <h3>Select Winner:</h3>
                  <div className="team-buttons">
                    {getTeamNames(selectedMatch.teams).map((team, index) => (
                      <button
                        key={index}
                        className={`team-btn ${winnerSelection === team ? 'selected' : ''}`}
                        onClick={() => handleWinnerSelection(team)}
                      >
                        {team}
                      </button>
                    ))}
                    <button
                      className={`team-btn ${winnerSelection === 'Draw' ? 'selected' : ''}`}
                      onClick={() => handleWinnerSelection('Draw')}
                    >
                      Draw
                    </button>
                    <button
                      className={`team-btn ${winnerSelection === 'No Result' ? 'selected' : ''}`}
                      onClick={() => handleWinnerSelection('No Result')}
                    >
                      No Result
                    </button>
                  </div>
                </div>
              )}
              
              {selectedMatch.declared && (
                <div className="payment-detail">
                  <span>Winner:</span>
                  <span className="status-badge approved">{selectedMatch.winner}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {!selectedMatch.declared && (
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={declareResult}
                    disabled={!winnerSelection}
                  >
                    <i className="fas fa-trophy"></i> Declare Result
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={closeModal}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .winner-selection {
          margin-top: 20px;
          padding: 15px;
          background-color: #1e2130;
          border-radius: 6px;
        }
        
        .winner-selection h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #fff;
        }
        
        .team-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .team-btn {
          background-color: #242736;
          border: 1px solid #3a3f55;
          color: #fff;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .team-btn:hover {
          background-color: #3a3f55;
        }
        
        .team-btn.selected {
          background-color: #8c52ff;
          border-color: #8c52ff;
        }
      `}</style>
    </div>
  );
};

export default ResultDeclaration; 