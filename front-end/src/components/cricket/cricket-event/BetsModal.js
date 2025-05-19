import React, { useState } from 'react';
import './EventDetailPage.css';
import SadFile from "../../../assets/Images/sad_file.webp"

const TABS = [
  { key: 'MATCHED', label: 'MATCHED' },
  { key: 'BOOKMAKER', label: 'BOOKMAKER' },
  { key: 'FANCY', label: 'FANCY' },
];

const BetsModal = ({ open, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('MATCHED');
  if (!open) return null;
  return (
    <div className="bets-modal-overlay">
      <div className="bets-modal">
        <div className="bets-modal-header">
          <span>Open Bets</span>
          <button className="bets-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="bets-modal-options">
          <label className="bets-modal-checkbox">
            <input type="checkbox" /> Average Odds
          </label>
        </div>
        <div className="bets-modal-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`bets-modal-tab${selectedTab === tab.key ? ' active' : ''}`}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bets-modal-table-header">
          <div>Selection</div>
          <div>Odds</div>
          <div>Stake</div>
          <div>Date/Time</div>
        </div>
        <div className="bets-modal-nodata">
         <img src={SadFile} alt="" />
          <div className="bets-modal-nodata-title">No Data Found!</div>
          <div className="bets-modal-nodata-desc">We Can't Find Any Item Matching Your Search.</div>
        </div>
      </div>
    </div>
  );
};

export default BetsModal; 