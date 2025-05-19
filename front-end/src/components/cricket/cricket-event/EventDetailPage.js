import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './EventDetailPage.css';
import BetsModal from './BetsModal';
import PlaceBet from './PlaceBet';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const TABS = [
  { key: 'FANCY', label: 'Fancy' },
  { key: 'PREMIUM_FANCY', label: 'Premium Fancy' },
  { key: 'LINE_MARKETS', label: 'Line Markets' },
  { key: 'SESSION_MARKETS', label: 'Session Markets' },
  { key: 'OVER_SESSION_MARKET', label: 'Over Session Market' },
  { key: 'BALL_BY_BALL', label: 'Ball By Ball' },
  { key: 'FALL_OF_WICKET', label: 'Fall Of Wicket' },
  { key: 'OTHER_MARKETS', label: 'Other Markets' },
  { key: 'TOTAL_ADVANCE', label: 'Total Advance' },
  { key: 'METER_MARKETS', label: 'Meter Markets' },
  { key: 'KHADO_MARKETS', label: 'Khado Markets' },
  { key: 'ODD_EVEN_MARKETS', label: 'Odd Event Markets' },
  { key: 'BOOKMAKER', label: 'Bookmaker' },
  { key: 'WINNING_ODDS', label: 'Winning Odds' },
];

const EventDetailPage = () => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('SESSION_MARKETS');
  const [betsModalOpen, setBetsModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [stake, setStake] = useState('');
  const [selectedMarketIndex, setSelectedMarketIndex] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    let intervalId;
    
    const fetchEventData = async () => {
      // Skip if we fetched within the last second (prevent overlapping requests)
      const now = Date.now();
      if (now - lastFetchTime < 1000) return;
      
      try {
        // Only show loading state on first fetch
        if (!eventData) setLoading(true);
        
        const response = await axios.get(`http://localhost:5000/api/event-details/${id}`);
        
        const data = response.data;
        if (!data.data) {
          throw new Error('Invalid response format');
        }
        
        setEventData(data.data);
        setLastFetchTime(now);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      // Initial fetch
      fetchEventData();
      
      // Set up interval for subsequent fetches
      intervalId = setInterval(fetchEventData, 3000);
    }
    
    // Clean up interval on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, lastFetchTime]);

  // Log state changes
  useEffect(() => {
    console.log('Event Data:', eventData);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [eventData, loading, error]);

  if (loading) {
    return <div style={{ padding: 40, color: '#888' }}>Loading event details...</div>;
  }

  if (error) {
    return <div style={{ padding: 40, color: '#f44336' }}>Error: {error}</div>;
  }

  if (!eventData) {
    return <div style={{ padding: 40, color: '#888' }}>Event not found.</div>;
  }

  // Group markets by type for display
  const groupMarketsByType = (catalogues) => {
    const groups = {};
    catalogues.forEach(market => {
      if (!groups[market.marketType]) {
        groups[market.marketType] = [];
      }
      groups[market.marketType].push(market);
    });
    return groups;
  };

  const marketGroups = groupMarketsByType(eventData.catalogues);

  // Helper to get market display name
  const getMarketDisplayName = (marketType, marketName) => {
    switch (marketType) {
      case 'MATCH_ODDS': return 'Match Odds';
      case 'BOOKMAKER': return 'Bookmaker';
      case 'SESSION_MARKETS': return 'Session Markets';
      case 'ODDS': return marketName || 'Odds';
      default: return marketName || marketType;
    }
  };

  // Parse books from metadata
  let books = {};
  try {
    if (eventData.metadata && eventData.metadata.books) {
      books = JSON.parse(eventData.metadata.books);
    }
  } catch (e) {
    books = {};
  }

  // Helper to extract odds and volumes for a runner in a market
  const getRunnerPrices = (marketId, runnerId) => {
    const marketBook = books[marketId];
    if (!marketBook) return { back: [], lay: [] };
    // Example: "1.230630840|0|OPEN|False|05/18/2025 08:52:51|1747558396704|False|71386514~ACTIVE~3.75:1.98:*3.7:3000.04:*3.65:3033.7:~3.8:539.17:*3.85:651.73:*3.9:904.74:,42821394~ACTIVE~3.95:1631.71:*3.9:1915.25:*3.85:120:~4:538.11:*4.1:4720.61:*4.2:8250.81:,2954281~ACTIVE~4.2:1055.53:*4.1:920:*4:2830.07:~4.3:2019.43:*4.4:2048.83:*4.9:1:,38528100~ACTIVE~5.6:270.06:*5.5:499.43:*5.4:146.99:~5.7:318.71:*5.8:280.09:*5.9:394.23:,..."
    // Split by ',' to get each runner
    const parts = marketBook.split('|');
    const runnersStr = parts[7] || '';
    const runnerArr = runnersStr.split(',');
    const runnerStr = runnerArr.find(r => r.startsWith(runnerId + '~'));
    if (!runnerStr) return { back: [], lay: [] };
    // Format: runnerId~STATUS~back1:vol1:*back2:vol2:...~lay1:vol1:*lay2:vol2:...
    const runnerParts = runnerStr.split('~');
    // Back prices are in runnerParts[2], lay in runnerParts[3]
    const parsePrices = (str) => {
      if (!str) return [];
      return str.split('*').map(pair => {
        const [price, vol] = pair.split(':');
        return { price, vol };
      }).filter(p => p.price);
    };
    return {
      back: parsePrices(runnerParts[2]),
      lay: parsePrices(runnerParts[3])
    };
  };

  // Helper to render odds table with multiple prices/volumes
  const renderOddsTable = (market) => {
    return (
      <table className="odds-table" style={{ width: '100%', marginTop: 8, marginBottom: 8, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f7f8fa' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Selection</th>
            {[0,1,2].map(i => (
              <th key={'back'+i} style={{ background: '#bbdefb', color: '#222', padding: 6 }}>Back</th>
            ))}
            {[0,1,2].map(i => (
              <th key={'lay'+i} style={{ background: '#ffcdd2', color: '#222', padding: 6 }}>Lay</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {market.runners.map((runner, idx) => {
            const prices = getRunnerPrices(market.marketId, runner.id.toString());
            return (
              <tr key={runner.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 6 }}>{runner.name}</td>
                {/* Back prices */}
                {Array(3).fill(0).map((_, i) => (
                  <td key={'back'+i} style={{ background: '#bbdefb', textAlign: 'center', padding: 6, cursor: prices.back[i] ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (prices.back[i]) {
                        setSelectedMarketIndex(market.marketId);
                        setSelectedBet({ marketIndex: market.marketId, oddIndex: i, market, odd: { ...runner, type: 'back', price: prices.back[i].price, vol: prices.back[i].vol } });
                        setStake('');
                      }
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{prices.back[i]?.price || '-'}</div>
                    <div style={{ fontSize: 12, color: '#222' }}>{prices.back[i]?.vol || ''}</div>
                  </td>
                ))}
                {/* Lay prices */}
                {Array(3).fill(0).map((_, i) => (
                  <td key={'lay'+i} style={{ background: '#ffcdd2', textAlign: 'center', padding: 6, cursor: prices.lay[i] ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (prices.lay[i]) {
                        setSelectedMarketIndex(market.marketId);
                        setSelectedBet({ marketIndex: market.marketId, oddIndex: i, market, odd: { ...runner, type: 'lay', price: prices.lay[i].price, vol: prices.lay[i].vol } });
                        setStake('');
                      }
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{prices.lay[i]?.price || '-'}</div>
                    <div style={{ fontSize: 12, color: '#222' }}>{prices.lay[i]?.vol || ''}</div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Helper: SVG icons for bookmark and checkmark
  const BookmarkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" fill="none"/><path d="M5 3C4.44772 3 4 3.44772 4 4V17.382C4 17.9362 4.68437 18.2346 5.10557 17.8284L10 13.2426L14.8944 17.8284C15.3156 18.2346 16 17.9362 16 17.382V4C16 3.44772 15.5523 3 15 3H5Z" stroke="#c3003c" strokeWidth="1.5" fill="none"/></svg>
  );
  const CheckmarkIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fff"/><path d="M8 15.5L12.5 20L20 10" stroke="#2ecc40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );

  // Render SESSION_MARKETS in custom style with header row
  const renderSessionMarkets = (markets) => (
    <div style={{ marginBottom: 32 }}>
      <div style={{ background: '#c3003c', color: '#fff', fontWeight: 700, fontSize: 20, padding: '10px 20px', borderTopLeftRadius: 6, borderTopRightRadius: 6, marginBottom: 0 }}>
        SESSION MARKETS
      </div>
      {/* Header row for NO/YES */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #eee', padding: '0 0 0 60px', minHeight: 40 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 180 }}></div>
          <div style={{ display: 'flex', minWidth: 120 }}>
            <div style={{ width: 80, textAlign: 'center', color: '#222', fontWeight: 700, letterSpacing: 1 }}>NO</div>
            <div style={{ width: 80, textAlign: 'center', color: '#222', fontWeight: 700, letterSpacing: 1 }}>YES</div>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      </div>
      {markets.map((market, idx) => {
        // Assume two runners: NO (first), YES (second)
        const noRunner = market.runners[0];
        const yesRunner = market.runners[1];
        const noPrices = getRunnerPrices(market.marketId, noRunner.id.toString());
        const yesPrices = getRunnerPrices(market.marketId, yesRunner.id.toString());
        return (
          <div key={market.marketId} style={{ display: 'flex', alignItems: 'flex-start', background: '#fff', borderBottom: '1px solid #eee', padding: '18px 0 10px 0', position: 'relative' }}>
            <div style={{ width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 10 }}>
              <BookmarkIcon />
              <div style={{ marginTop: 8 }}><CheckmarkIcon /></div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 180, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>{market.marketName}</div>
              <div style={{ display: 'flex', minWidth: 120 }}>
                {/* NO odds */}
                <div style={{ background: '#ffcdd2', color: '#c3003c', fontWeight: 700, fontSize: 22, padding: '10px 24px', borderRadius: 6, marginRight: 2, textAlign: 'center', minWidth: 60, cursor: noPrices.back[0] ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (noPrices.back[0]) {
                      setSelectedMarketIndex(market.marketId);
                      setSelectedBet({ marketIndex: market.marketId, oddIndex: 0, market, odd: { ...noRunner, type: 'back', price: noPrices.back[0].price, vol: noPrices.back[0].vol } });
                      setStake('');
                    }
                  }}
                >
                  <div>{noPrices.back[0]?.price || '-'}</div>
                  <div style={{ fontSize: 14, color: '#222', fontWeight: 400 }}>{noPrices.back[0]?.vol || ''}</div>
                </div>
                {/* YES odds */}
                <div style={{ background: '#bbdefb', color: '#1976d2', fontWeight: 700, fontSize: 22, padding: '10px 24px', borderRadius: 6, marginLeft: 2, textAlign: 'center', minWidth: 60, cursor: yesPrices.back[0] ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (yesPrices.back[0]) {
                      setSelectedMarketIndex(market.marketId);
                      setSelectedBet({ marketIndex: market.marketId, oddIndex: 0, market, odd: { ...yesRunner, type: 'back', price: yesPrices.back[0].price, vol: yesPrices.back[0].vol } });
                      setStake('');
                    }
                  }}
                >
                  <div>{yesPrices.back[0]?.price || '-'}</div>
                  <div style={{ fontSize: 14, color: '#222', fontWeight: 400 }}>{yesPrices.back[0]?.vol || ''}</div>
                </div>
              </div>
              {/* Max Bet/Market info */}
              <div style={{ marginLeft: 32, color: '#222', fontSize: 15, fontWeight: 400 }}>
                <div>Max Bet: {market.marketCondition.minBet}</div>
                <div>Max Market: {market.marketCondition.maxProfit}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render all market groups
  const renderMarketGroups = () => {
    return Object.entries(marketGroups).map(([marketType, markets]) => {
      if (marketType === 'SESSION_MARKETS') {
        return (
          <div className="event-market-section" key={marketType} style={{ marginBottom: 32 }}>
            {renderSessionMarkets(markets)}
          </div>
        );
      }
      // Default rendering for other groups
      return (
        <div className="event-market-section" key={marketType} style={{ marginBottom: 32 }}>
          <div className="event-title-name-all">
            <div className="event-market-title">{getMarketDisplayName(marketType, markets[0]?.marketName)}</div>
            {markets[0]?.status === 'SUSPENDED' && (
              <span style={{ color: '#c3003c', fontWeight: 700, marginLeft: 16 }}>SUSPENDED</span>
            )}
            {markets[0]?.status === 'OPEN' && (
              <span style={{ color: '#009900', fontWeight: 700, marginLeft: 16 }}>CASHOUT</span>
            )}
          </div>
          {markets.map((market) => (
            <div className="event-market-row" key={market.marketId} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {renderOddsTable(market)}
              <div className="event-market-meta" style={{ marginLeft: '10px', textAlign: 'right' }}>
                <div>Min: {market.marketCondition.minBet} | Max: {market.marketCondition.maxBet}</div>
                <div>Max Market: {market.marketCondition.maxProfit}</div>
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="event-detail-container">
      <ToastContainer />
      <div className="event-detail-container-right">
        <div className="event-detail-header-row">
          <div className="event-detail-header">
            <span className="event-detail-date">
              ({new Date(eventData.event.openDate).toLocaleString('en-US', {
                month: 'numeric', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
              })})
            </span>
            <span className="event-detail-name">
              {eventData.event.name}
            </span>
          </div>
          <button className="event-detail-bets-btn" onClick={() => setBetsModalOpen(true)}>BETS(0)</button>
        </div>
        <ul className="event-detail-tabs nav nav-tabs" role="tablist">
          {TABS.map(tab => (
            <li className="nav-item" role="presentation" key={tab.key}>
              <button
                className={`nav-link event-detail-tab${selectedTab === tab.key ? ' active' : ''}`}
                id={`${tab.key.toLowerCase()}-tab`}
                type="button"
                role="tab"
                aria-selected={selectedTab === tab.key}
                onClick={() => setSelectedTab(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="event-detail-markets">
          {renderMarketGroups()}
        </div>
      </div>
      <div className="event-detail-container-left">
        <div className="event-score-board">
          <div className="event-score-board-title">Score Board</div>
          <div className="event-score-board-content">
            <div className="event-score-placeholder">
              {eventData.competition.name} - {eventData.event.name}
            </div>
          </div>
        </div>
        <PlaceBet 
          selectedBet={selectedBet}
          selectedMarketIndex={selectedMarketIndex}
          setSelectedBet={setSelectedBet}
          setStake={setStake}
          stake={stake}
          setSelectedMarketIndex={setSelectedMarketIndex}
        />
      </div>
      <BetsModal open={betsModalOpen} onClose={() => setBetsModalOpen(false)} />
    </div>
  );
};

export default EventDetailPage;