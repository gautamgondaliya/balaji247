import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Games.css';

const Games = () => {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);

  // Sample games data - would come from API in a real app
  const gameCategories = [
    { label: 'Multi Market', icon: '🔔', status: 'active' },
    { label: 'Cricket', icon: '🏏', status: 'active' },
    { label: 'Football', icon: '⚽', status: 'active' },
    { label: 'Tennis', icon: '🎾', status: 'active' },
    { label: 'Sports Book', icon: '🛡️', status: 'active' },
    { label: 'Matka', icon: '🎯', status: 'inactive' },
    { label: 'Cricket Fight', icon: '🏏', status: 'active' },
    { label: 'Casino', icon: '🎰', status: 'active' },
    { label: 'Evolution', icon: '🏛️', status: 'inactive' },
    { label: 'FIFA CUP WINNER', icon: '🏆', status: 'active' },
    { label: 'WINNER CUP', icon: '🥇', status: 'active' },
  ];

  const handleGameClick = (game) => {
    setActiveGame(game);
    
    // Special handling for Cricket to go to the Cricket Dashboard
    if (game.label === 'Cricket') {
      navigate('/games/cricket-dashboard');
    } else {
      // Navigate to the game detail view with a URL-friendly game ID
      navigate(`/games/${game.label.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const handleStatusToggle = (game, e) => {
    e.stopPropagation(); // Prevent triggering the game click handler
    // This would make an API call to toggle the game status in a real app
    console.log(`Toggle status for ${game.label} from ${game.status} to ${game.status === 'active' ? 'inactive' : 'active'}`);
  };

  const handleAddNewGame = () => {
    // Navigate to game creation page (would be implemented in a real app)
    // navigate('/games/new');
  };

  return (
    <div className="games-container">
      <div className="games-header">
        <h1 className="page-title">Game Management</h1>
        <button className="btn btn-primary" onClick={handleAddNewGame}>Add New Game</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Games</h2>
          <div className="games-filter">
            <input type="text" placeholder="Search games..." className="search-input" />
            <select className="status-filter">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="games-grid">
          {gameCategories.map((game, index) => (
            <div 
              key={index} 
              className={`game-card ${activeGame === game ? 'active' : ''} ${game.status}`}
              onClick={() => handleGameClick(game)}
            >
              <div className="game-icon">{game.icon}</div>
              <div className="game-details">
                <h3 className="game-title">{game.label}</h3>
                <div className={`game-status ${game.status}`}>
                  {game.status}
                </div>
              </div>
              <div className="game-actions">
                <button 
                  className={`toggle-status-btn ${game.status === 'active' ? 'active' : 'inactive'}`}
                  onClick={(e) => handleStatusToggle(game, e)}
                >
                  {game.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="edit-game-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGameClick(game);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Game Categories</h2>
        </div>
        <div className="game-categories-list">
          {gameCategories.map((category, index) => (
            <div 
              key={index} 
              className={`game-category-item ${category.status}`}
              onClick={() => handleGameClick(category)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.label}</span>
              <span className={`category-status ${category.status}`}>
                {category.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games; 