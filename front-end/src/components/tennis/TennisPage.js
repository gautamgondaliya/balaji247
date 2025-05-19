import React from 'react';
import './TennisPage.css';

const matches = [
  {
    title: "NOVAK DJOKOVIC V RAFAEL NADAL",
    subtitle: "(FRENCH OPEN, 2025)",
    status: "LIVE",
    date: "18 May 2:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["1.45", "blue"], ["2.80", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
  {
    title: "CARLOS ALCARAZ V DANIIL MEDVEDEV",
    subtitle: "(WIMBLEDON, 2025)",
    status: "LIVE",
    date: "19 May 4:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["1.90", "blue"], ["1.90", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
  {
    title: "IGA SWIATEK V ARYNA SABALENKA",
    subtitle: "(US OPEN, 2025)",
    status: "LIVE",
    date: "20 May 6:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["1.60", "blue"], ["2.30", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
  {
    title: "STEFANOS TSITSIPAS V ALEXANDER ZVEREV",
    subtitle: "(AUSTRALIAN OPEN, 2025)",
    status: "LIVE",
    date: "21 May 8:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
  {
    title: "ONS JABEUR V COCO GAUFF",
    subtitle: "(WTA FINALS, 2025)",
    status: "LIVE",
    date: "22 May 5:00 PM",
    icons: ["F", "TV", "BM", "P"],
    odds: [["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"], ["-", "blue"], ["-", "pink"]],
  },
];

const iconMap = {
  F: <span title="Favorite" style={{fontWeight: 'bold'}}>F</span>,
  TV: <span title="TV" role="img" aria-label="tv">📺</span>,
  BM: <span title="BM" className="tennis-bm">BM</span>,
  P: <span title="Premium" className="tennis-premium">P</span>,
  "🎾": <span title="Tennis" role="img" aria-label="tennis">🎾</span>,
};

const TennisPage = () => (
  <div className="tennis-table">
    <div className="tennis-table-header-row">
      <div className="tennis-table-header-left">
        <span className="tennis-header-icon">🎾</span>
        <span className="tennis-header-title">TENNIS</span>
        <button className="tennis-header-tab active">+ LIVE</button>
        <button className="tennis-header-tab">+ VIRTUAL</button>
      </div>
      <div className="tennis-table-header-right">
        <div className="tennis-odds-header">
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
      <div className="tennis-table-row" key={idx}>
        <div className="tennis-table-left">
          <div className="tennis-title-section">
            <div className="tennis-match-title">{match.title}</div>
            <div className="tennis-match-subtitle">{match.subtitle}</div>
          </div>
          <div className="tennis-match-status-row">
            <span className="tennis-match-status">LIVE</span>
            <span className="tennis-match-date">{match.date}</span>
            <span className="tennis-match-icons">
              {match.icons.map((icon, i) => (
                <span key={i} className="tennis-match-icon">{iconMap[icon] || icon}</span>
              ))}
            </span>
          </div>
        </div>
        <div className="tennis-table-right">
          {[0, 2, 4].map((col, i) => (
            <div className="tennis-odds-col" key={i}>
              <button className={`tennis-odd-btn tennis-odd-${match.odds[col][1]}`}>
                <span>{match.odds[col][0]}</span>
              </button>
              <button className={`tennis-odd-btn tennis-odd-${match.odds[col+1][1]}`}>
                <span>{match.odds[col+1][0]}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default TennisPage; 