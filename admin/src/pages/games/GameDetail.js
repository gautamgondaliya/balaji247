import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameDetail.css';

const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock game data - would be fetched from API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const mockGame = {
        id: gameId,
        name: gameId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        icon: getGameIcon(gameId),
        status: 'active',
        description: 'This is a sample game description that explains the rules and how to play the game.',
        minBet: '₹10',
        maxBet: '₹10,000',
        commission: '2%',
        odds: [
          { name: 'Win', value: '1.9' },
          { name: 'Loss', value: '2.1' },
          { name: 'Draw', value: '3.5' }
        ],
        categoryId: 'sports',
        isPopular: true,
        createdAt: '2023-06-01',
        updatedAt: '2023-06-15'
      };
      
      setGame(mockGame);
      setIsLoading(false);
    }, 800);
  }, [gameId]);

  // Helper function to get an icon based on game ID
  const getGameIcon = (id) => {
    const icons = {
      'cricket': '🏏',
      'football': '⚽',
      'tennis': '🎾',
      'casino': '🎰',
      'multi-market': '🔔',
      'sports-book': '🛡️',
      'matka': '🎯',
      'cricket-fight': '🏏',
      'evolution': '🏛️',
      'fifa-cup-winner': '🏆',
      'winner-cup': '🥇',
    };
    
    // Find matching icon or return a default
    for (const key in icons) {
      if (id.includes(key)) {
        return icons[key];
      }
    }
    return '🎮';
  };

  const handleBack = () => {
    navigate('/games');
  };

  const handleStatusToggle = () => {
    if (game) {
      // This would make an API call in a real app
      setGame({
        ...game,
        status: game.status === 'active' ? 'inactive' : 'active'
      });
    }
  };

  const handleSaveChanges = () => {
    // This would save changes via API in a real app
    alert('Changes saved!');
  };

  if (isLoading) {
    return <div className="loading-spinner"></div>;
  }

  if (!game) {
    return (
      <div className="game-detail-container">
        <div className="game-detail-header">
          <button className="btn btn-secondary" onClick={handleBack}>Back to Games</button>
        </div>
        <div className="card">
          <p>Game not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-detail-container">
      <div className="game-detail-header">
        <button className="btn btn-secondary" onClick={handleBack}>Back to Games</button>
        <h1 className="page-title">Game Details</h1>
        <div className="header-actions">
          <button 
            className={`btn ${game.status === 'active' ? 'btn-danger' : 'btn-success'}`}
            onClick={handleStatusToggle}
          >
            {game.status === 'active' ? 'Deactivate Game' : 'Activate Game'}
          </button>
          <button className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>
        </div>
      </div>

      <div className="game-detail-content">
        <div className="card game-info-card">
          <div className="card-header">
            <div className="game-header-icon">
              <span className="game-icon">{game.icon}</span>
              <h2 className="card-title">{game.name}</h2>
            </div>
            <span className={`game-status ${game.status}`}>{game.status}</span>
          </div>
          
          <div className="card-content">
            <div className="game-info-row">
              <div className="game-info-item">
                <label>Minimum Bet</label>
                <input type="text" value={game.minBet} onChange={(e) => setGame({...game, minBet: e.target.value})} />
              </div>
              <div className="game-info-item">
                <label>Maximum Bet</label>
                <input type="text" value={game.maxBet} onChange={(e) => setGame({...game, maxBet: e.target.value})} />
              </div>
              <div className="game-info-item">
                <label>Commission</label>
                <input type="text" value={game.commission} onChange={(e) => setGame({...game, commission: e.target.value})} />
              </div>
            </div>
            
            <div className="game-info-row">
              <div className="game-info-item full-width">
                <label>Description</label>
                <textarea 
                  value={game.description} 
                  onChange={(e) => setGame({...game, description: e.target.value})}
                  rows={4}
                ></textarea>
              </div>
            </div>
            
            <div className="game-info-row">
              <div className="game-info-item">
                <label>Category</label>
                <select value={game.categoryId} onChange={(e) => setGame({...game, categoryId: e.target.value})}>
                  <option value="sports">Sports</option>
                  <option value="casino">Casino</option>
                  <option value="cards">Card Games</option>
                  <option value="specialty">Specialty Games</option>
                </select>
              </div>
              <div className="game-info-item">
                <label>Popular Game</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="popular-toggle"
                    checked={game.isPopular}
                    onChange={() => setGame({...game, isPopular: !game.isPopular})}
                  />
                  <label htmlFor="popular-toggle"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Game Odds</h2>
            <button className="btn btn-secondary btn-sm">Add Odds</button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Outcome</th>
                  <th>Odds Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {game.odds.map((odd, index) => (
                  <tr key={index}>
                    <td>{odd.name}</td>
                    <td>
                      <input 
                        type="text" 
                        value={odd.value} 
                        onChange={(e) => {
                          const updatedOdds = [...game.odds];
                          updatedOdds[index].value = e.target.value;
                          setGame({...game, odds: updatedOdds});
                        }}
                        className="odds-input"
                      />
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Bets</h2>
            <button className="btn btn-primary btn-sm">View All Bets</button>
          </div>
          
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No recent bets for this game</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail; 