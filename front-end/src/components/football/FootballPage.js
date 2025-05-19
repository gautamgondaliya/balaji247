import React from 'react';
import './FootballPage.css';

const matches = [
  {
    title: "MANCHESTER UNITED V LIVERPOOL",
    subtitle: "(ENGLISH PREMIER LEAGUE, 2025)",
    status: "LIVE",
    date: "14 May 7:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
  {
    title: "REAL MADRID V BARCELONA",
    subtitle: "(LA LIGA, 2025)",
    status: "LIVE",
    date: "15 May 9:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["2.10", "blue"], ["3.40", "pink"], ["-", "blue"], ["-", "pink"], ["1.80", "blue"], ["2.00", "pink"]],
  },
  {
    title: "BAYERN MUNICH V BORUSSIA DORTMUND",
    subtitle: "(BUNDESLIGA, 2025)",
    status: "LIVE",
    date: "16 May 6:30 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["1.90", "blue"], ["2.50", "pink"], ["-", "blue"], ["-", "pink"], ["2.20", "blue"], ["2.60", "pink"]],
  },
  {
    title: "JUVENTUS V AC MILAN",
    subtitle: "(SERIE A, 2025)",
    status: "LIVE",
    date: "16 May 10:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
  {
    title: "PSG V MONACO",
    subtitle: "(LIGUE 1, 2025)",
    status: "LIVE",
    date: "17 May 8:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
];

const iconMap = {
  F: <span title="Favorite" style={{fontWeight: 'bold'}}>F</span>,
  TV: <span title="TV" role="img" aria-label="tv">📺</span>,
  BM: <span title="BM" className="football-bm">BM</span>,
  P: <span title="Premium" className="football-premium">P</span>,
  "🎮": <span title="Game" role="img" aria-label="game">🎮</span>,
};

const FootballPage = () => (
  <div className="football-table">
    <div className="football-table-header-row">
      <div className="football-table-header-left">
        <span className="football-header-icon">⚽</span>
        <span className="football-header-title">FOOTBALL</span>
        <button className="football-header-tab active">+ LIVE</button>
        <button className="football-header-tab">+ VIRTUAL</button>
      </div>
      <div className="football-table-header-right">
        <div className="football-odds-header">
          <div className="stack-1">
            <span>1</span>
          </div>
          <div className="stack-1">
            <span>X</span>
          </div>
          <div className="stack-1">
            <span>2</span>
          </div>
        </div>
      </div>
    </div>
    {matches.map((match, idx) => (
      <div className="football-table-row" key={idx}>
        <div className="football-table-left">
          <div className="football-title-section">
            <div className="football-match-title">{match.title}</div>
            <div className="football-match-subtitle">{match.subtitle}</div>
          </div>
          <div className="football-match-status-row">
            <span className="football-match-status">LIVE</span>
            <span className="football-match-date">{match.date}</span>
            <span className="football-match-icons">
              {match.icons.map((icon, i) => (
                <span key={i} className="football-match-icon">{iconMap[icon] || icon}</span>
              ))}
            </span>
          </div>
        </div>
        <div className="football-table-right">
          {[0, 2, 4].map((col, i) => (
            <div className="football-odds-col" key={i}>
              <button className={`football-odd-btn football-odd-${match.odds[col][1]}`}>
                <span>{match.odds[col][0]}</span>
              </button>
              <button className={`football-odd-btn football-odd-${match.odds[col+1][1]}`}>
                <span>{match.odds[col+1][0]}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default FootballPage; 