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
        
        const response = await axios.get(`https://zplay1.in/pb/api/v1/events/matchDetails/${id}`);
        
        if (!response.data.success || !response.data.data) {
          throw new Error('Invalid response format');
        }
        
        setEventData(response.data.data);
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

  // Process and organize the data from the new API structure
  const processApiData = () => {
    const matchData = eventData.match || {};
    const fancyOddData = matchData.fancyOddData || {};
    const bookmakerOddData = matchData.bookmakerOddData || {};
    const matchOddData = matchData.matchOddData || [];
    
    // Group markets by type for display
    const markets = {};
    
    // Process Session Markets
    if (fancyOddData.ml) {
      markets.SESSION_MARKETS = fancyOddData.ml.filter(market => 
        market.cat === 'session_markets' || 
        (market.mn && market.mn.toLowerCase().includes('session'))
      );
      
      // Process Over Session Markets
      markets.OVER_SESSION_MARKET = fancyOddData.ml.filter(market => 
        market.cat === 'over_by_over_session_markets' || 
        (market.mn && (
          market.mn.toLowerCase().includes('over session') || 
          market.mn.toLowerCase().includes('over run')
        ))
      );
    }
    
    // Process Fall of Wicket
    if (fancyOddData.ml) {
      markets.FALL_OF_WICKET = fancyOddData.ml.filter(market => 
        market.cat === 'fall_of_wicket' || 
        (market.mn && market.mn.toLowerCase().includes('wkt'))
      );
    }
    
    // Process Other Markets
    if (fancyOddData.ml) {
      markets.OTHER_MARKETS = fancyOddData.ml.filter(market => 
        market.cat === 'other_markets'
      );
    }
    
    // Process Total Advance
    if (fancyOddData.ml) {
      markets.TOTAL_ADVANCE = fancyOddData.ml.filter(market => 
        market.cat === 'total_advance'
      );
    }
    
    // Process Odd Even Markets
    if (fancyOddData.ml) {
      markets.ODD_EVEN_MARKETS = fancyOddData.ml.filter(market => 
        market.cat === 'odd_even_markets' || 
        (market.mn && (
          market.mn.toLowerCase().includes('odd') || 
          market.mn.toLowerCase().includes('total run odd') ||
          market.mn.toLowerCase().includes('inning') && market.mn.toLowerCase().includes('over') && market.mn.toLowerCase().includes('odd')
        ))
      );
    }
    
    // Process Bookmaker
    if (bookmakerOddData.ml) {
      markets.BOOKMAKER = bookmakerOddData.ml;
    }
    
    // Process Match Odds
    if (matchOddData.length > 0) {
      markets.WINNING_ODDS = matchOddData;
    }
    
    return { markets, matchData };
  };
  
  // Helper to check if "BALL RUNNING" should be displayed
  const isBallRunning = (market) => {
    return market.sn === "BALL RUNNING" || market.msg === "BALL RUNNING" || market.sn === "SUSPEND";
  };

  // Helper to render BALL RUNNING indicator consistently across all market types
  const renderBallRunning = () => (
    <div className="ball-running-banner">
      BALL RUNNING
    </div>
  );

  // Group markets by type for display - Legacy function, now replaced by processApiData
  // This is kept for backward compatibility only
  const groupMarketsByType = (catalogues) => {
    if (!catalogues || !Array.isArray(catalogues)) {
      return {};
    }
    
    const groups = {};
    catalogues.forEach(market => {
      if (!groups[market.marketType]) {
        groups[market.marketType] = [];
      }
      groups[market.marketType].push(market);
    });
    return groups;
  };

  // Get market data
  const { markets, matchData } = processApiData();

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
    // Safely get runners with fallback to empty array
    const runners = (market.sl || market.runners || []);
    
    return (
      <table className="odds-table">
        <thead>
          <tr style={{ background: '#f7f8fa' }}>
            <th>Selection</th>
            <th className="back">Back</th>
            <th className="lay">Lay</th>
          </tr>
        </thead>
        <tbody>
          {runners.map((runner, idx) => {
            return (
              <tr key={idx}>
                <td>{runner.sln || runner.name || runner.RN || ''}</td>
                {/* Back price */}
                <td className="back"
                    onClick={() => {
                    setSelectedMarketIndex(market.mi || market.marketId || market.id);
                    setSelectedBet({ 
                      marketIndex: market.mi || market.marketId || market.id, 
                      market, 
                      odd: { 
                        ...runner, 
                        type: 'back', 
                        price: runner.b || (runner.ex?.b?.[0]?.p) || '', 
                        vol: '' 
                      } 
                    });
                        setStake('');
                    }}
                  >
                  <div className="odds-table-value">{runner.b || (runner.ex?.b?.[0]?.p) || '-'}</div>
                  </td>
                {/* Lay price */}
                <td className="lay"
                    onClick={() => {
                    setSelectedMarketIndex(market.mi || market.marketId || market.id);
                    setSelectedBet({ 
                      marketIndex: market.mi || market.marketId || market.id, 
                      market, 
                      odd: { 
                        ...runner, 
                        type: 'lay', 
                        price: runner.l || (runner.ex?.l?.[0]?.p) || '', 
                        vol: '' 
                      } 
                    });
                        setStake('');
                    }}
                  >
                  <div className="odds-table-value">{runner.l || (runner.ex?.l?.[0]?.p) || '-'}</div>
                  </td>
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
    <div className="market-section">
      <div className="market-header">
        SESSION MARKETS
      </div>
      {/* Header row for NO/YES */}
      <div className="market-header-row">
        <div className="market-header-content">
          <div className="market-header-label"></div>
          <div className="market-header-values">
            <div className="market-header-no">NO</div>
            <div className="market-header-yes">YES</div>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      </div>
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
            <div className="market-bookmark-checkmark"><CheckmarkIcon /></div>
          </div>
          <div className="market-content">
            <div className="market-name">{market.mn}</div>
            <div className="market-values-container">
              {isBallRunning(market) ? (
                renderBallRunning()
              ) : (
                <>
                  {/* NO odds */}
                  <div className="odds-button-no"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'no', price: market.rn, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.rn || '-'}</div>
                    <div className="odds-volume">{market.on || 100}</div>
                  </div>
                  {/* YES odds */}
                  <div className="odds-button-yes"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'yes', price: market.ry, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.ry || '-'}</div>
                    <div className="odds-volume">{market.oy || 100}</div>
                  </div>
                </>
              )}
            </div>
            {/* Max Bet/Market info */}
            <div className="market-limits">
              <div>Max Bet: {market.mins || 100}</div>
              <div>Max Market: {market.mml || 500000}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render FALL_OF_WICKET markets
  const renderFallOfWicketMarkets = (markets) => (
    <div className="market-section">
      <div className="market-header">
        FALL OF WICKET
      </div>
      {/* Header row for NO/YES */}
      <div className="market-header-row">
        <div className="market-header-content">
          <div className="market-header-label"></div>
          <div className="market-header-values">
            <div className="market-header-no">NO</div>
            <div className="market-header-yes">YES</div>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      </div>
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name">{market.mn}</div>
            <div className="market-values-container">
              {isBallRunning(market) ? (
                renderBallRunning()
              ) : (
                <div className="odds-button-container">
                  {/* NO odds */}
                  <div className="odds-button-no"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'no', price: market.rn, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.rn || '-'}</div>
                    <div className="odds-volume">{market.on || 100}</div>
                  </div>
                  {/* YES odds */}
                  <div className="odds-button-yes"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'yes', price: market.ry, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.ry || '-'}</div>
                    <div className="odds-volume">{market.oy || 100}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render OVER_SESSION_MARKET in custom style with header row
  const renderOverSessionMarkets = (markets) => (
    <div className="market-section">
      <div className="market-header">
        OVER SESSION MARKET
      </div>
      {/* Header row for NO/YES */}
      <div className="market-header-row">
        <div className="market-header-content">
          <div className="market-header-label"></div>
          <div className="market-header-values">
            <div className="market-header-no">NO</div>
            <div className="market-header-yes">YES</div>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      </div>
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name">{market.mn}</div>
            <div className="market-values-container">
              {isBallRunning(market) ? (
                renderBallRunning()
              ) : (
                <div className="odds-button-container">
                  {/* NO odds */}
                  <div className="odds-button-no"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'no', price: market.rn, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.rn || '-'}</div>
                    <div className="odds-volume">{market.on || 100}</div>
                  </div>
                  {/* YES odds */}
                  <div className="odds-button-yes"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'yes', price: market.ry, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.ry || '-'}</div>
                    <div className="odds-volume">{market.oy || 100}</div>
                  </div>
                </div>
              )}
            </div>
            {/* Max Bet/Market info */}
            <div className="market-limits">
              <div>Max Bet: {market.mins || 100}</div>
              <div>Max Market: {market.mml || 500000}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render ODD_EVEN_MARKETS in custom style with header row
  const renderOddEvenMarkets = (markets) => (
    <div style={{ marginBottom: 32 }}>
      <div style={{ background: '#c3003c', color: '#fff', fontWeight: 700, fontSize: 20, padding: '10px 20px', borderTopLeftRadius: 6, borderTopRightRadius: 6, marginBottom: 0 }}>
        ODD EVEN MARKETS
      </div>
      {markets.map((market, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', background: '#fff', borderBottom: '1px solid #eee', padding: '18px 0 10px 0', position: 'relative' }}>
          <div style={{ width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 10 }}>
            <BookmarkIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 300, fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{market.mn}</div>
            <div style={{ display: 'flex', minWidth: 220 }}>
              {/* Pink (lay) box */}
              <div 
                style={{ 
                  background: '#ffcdd2', 
                  color: '#c3003c', 
                  fontWeight: 700, 
                  fontSize: 22, 
                  padding: '10px 24px', 
                  borderRadius: 6, 
                  marginRight: 8, 
                  textAlign: 'center', 
                  minWidth: 100,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedMarketIndex(market.mi);
                  setSelectedBet({ 
                    marketIndex: market.mi, 
                    market, 
                    odd: { 
                      type: 'lay', 
                      price: market.ry || market.rn, 
                      vol: '' 
                    } 
                  });
                  setStake('');
                }}
              >
                <div>{market.ry || '-'}</div>
                <div style={{ fontSize: 14, color: '#222', fontWeight: 400 }}>{market.oy || 100}</div>
              </div>
              {/* Blue (back) box */}
              <div 
                style={{ 
                  background: '#bbdefb', 
                  color: '#1976d2', 
                  fontWeight: 700, 
                  fontSize: 14, 
                  padding: '10px 24px', 
                  borderRadius: 6, 
                  textAlign: 'center', 
                  minWidth: 100,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedMarketIndex(market.mi);
                  setSelectedBet({ 
                    marketIndex: market.mi, 
                    market, 
                    odd: { 
                      type: 'back', 
                      price: market.rn || market.ly, 
                      vol: '' 
                    } 
                  });
                  setStake('');
                }}
              >
                <div>{market.rn || '-'}</div>
                <div style={{ fontSize: 14, color: '#222', fontWeight: 400 }}>{market.on || 100}</div>
              </div>
            </div>
            {/* Max Bet/Market info */}
            <div style={{ marginLeft: 32, color: '#222', fontSize: 15, fontWeight: 400, width: 200, textAlign: 'right' }}>
              <div>Max Bet: {market.mins || 100}</div>
              <div>Max Market: {market.mml || market.ms || 25000}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render OTHER_MARKETS in custom style with header row
  const renderOtherMarkets = (markets) => (
    <div className="market-section">
      <div className="market-header">
        OTHER MARKETS
      </div>
      {/* Header row for NO/YES */}
      <div className="market-header-row">
        <div className="market-header-content">
          <div className="market-header-label" style={{ width: 280 }}></div>
          <div className="market-header-values">
            <div className="market-header-no">NO</div>
            <div className="market-header-yes">YES</div>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      </div>
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name-large">{market.mn}</div>
            <div className="market-values-container">
              {isBallRunning(market) ? (
                renderBallRunning()
              ) : (
                <div className="odds-button-container">
                  {/* NO odds */}
                  <div className="odds-button-no odds-button-compact"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'no', price: market.rn, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.rn || '-'}</div>
                    <div className="odds-volume">{market.on || 100}</div>
                  </div>
                  {/* YES odds */}
                  <div className="odds-button-yes odds-button-compact"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'yes', price: market.ry, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.ry || '-'}</div>
                    <div className="odds-volume">{market.oy || 100}</div>
                  </div>
                </div>
              )}
            </div>
            {/* Max Bet/Market info */}
            <div className="market-limits">
              <div>Max Bet: {market.mins || 100}</div>
              <div>Max Market: {market.mml || market.ms || 25000}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render TOTAL_ADVANCE in custom style with header row
  const renderTotalAdvanceMarkets = (markets) => (
    <div className="market-section">
      <div className="market-header">
        TOTAL ADVANCE
      </div>
      {/* Header row for NO/YES */}
      <div className="market-header-row">
        <div className="market-header-content">
          <div className="market-header-label" style={{ width: 280 }}></div>
          <div className="market-header-values">
            <div className="market-header-no">NO</div>
            <div className="market-header-yes">YES</div>
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      </div>
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name-large">{market.mn}</div>
            <div className="market-values-container">
              {isBallRunning(market) ? (
                renderBallRunning()
              ) : (
                <div className="odds-button-container">
                  {/* NO odds */}
                  <div className="odds-button-no odds-button-compact"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'no', price: market.rn, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.rn || '-'}</div>
                    <div className="odds-volume">{market.on || 100}</div>
                  </div>
                  {/* YES odds */}
                  <div className="odds-button-yes odds-button-compact"
                    onClick={() => {
                      setSelectedMarketIndex(market.mi);
                      setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'yes', price: market.ry, vol: '' } });
                      setStake('');
                    }}
                  >
                    <div className="odds-value">{market.ry || '-'}</div>
                    <div className="odds-volume">{market.oy || 100}</div>
                  </div>
                </div>
              )}
            </div>
            {/* Max Bet/Market info */}
            <div className="market-limits">
              <div>Max Bet: {market.mins || 100}</div>
              <div>Max Market: {market.mml || market.ms || 25000}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render all market groups
  const renderMarketGroups = () => {
    return Object.entries(markets).map(([marketType, marketList]) => {
      if (!marketList || marketList.length === 0) return null;
      
      if (marketType === 'SESSION_MARKETS') {
        return (
          <div className="event-market-section" key={marketType}>
            {renderSessionMarkets(marketList)}
          </div>
        );
      }
      
      if (marketType === 'FALL_OF_WICKET') {
        return (
          <div className="event-market-section" key={marketType}>
            {renderFallOfWicketMarkets(marketList)}
          </div>
        );
      }
      
      if (marketType === 'OVER_SESSION_MARKET') {
        return (
          <div className="event-market-section" key={marketType}>
            {renderOverSessionMarkets(marketList)}
          </div>
        );
      }
      
      if (marketType === 'ODD_EVEN_MARKETS') {
        return (
          <div className="event-market-section" key={marketType}>
            {renderOddEvenMarkets(marketList)}
          </div>
        );
      }
      
      if (marketType === 'OTHER_MARKETS') {
        return (
          <div className="event-market-section" key={marketType}>
            {renderOtherMarkets(marketList)}
          </div>
        );
      }
      
      if (marketType === 'TOTAL_ADVANCE') {
        return (
          <div className="event-market-section" key={marketType}>
            {renderTotalAdvanceMarkets(marketList)}
          </div>
        );
      }
      
      // Default rendering for other groups
      return (
        <div className="event-market-section" key={marketType} style={{ marginBottom: 32 }}>
          <div className="event-title-name-all">
            <div className="event-market-title">{getMarketDisplayName(marketType)}</div>
          </div>
          {marketList.map((market) => (
            <div className="event-market-row" key={market.mi || market.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {/* Render based on market type */}
              {marketType === 'BOOKMAKER' && market.sl ? renderOddsTable(market) : 
               marketType === 'WINNING_ODDS' ? (
                renderOddsTable(market)
               ) : (
                isBallRunning(market) ? (
                  renderBallRunning()
                ) : (
                  <div className="odds-button-container" style={{ margin: '10px 0' }}>
                    {/* NO odds */}
                    <div className="odds-button-no"
                      onClick={() => {
                        setSelectedMarketIndex(market.mi);
                        setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'no', price: market.rn, vol: '' } });
                        setStake('');
                      }}
                    >
                      <div className="odds-value">{market.rn || '-'}</div>
                      <div className="odds-volume">{market.on || 100}</div>
                    </div>
                    {/* YES odds */}
                    <div className="odds-button-yes"
                      onClick={() => {
                        setSelectedMarketIndex(market.mi);
                        setSelectedBet({ marketIndex: market.mi, market, odd: { type: 'yes', price: market.ry, vol: '' } });
                        setStake('');
                      }}
                    >
                      <div className="odds-value">{market.ry || '-'}</div>
                      <div className="odds-volume">{market.oy || 100}</div>
                    </div>
                  </div>
                )
               )}
              <div className="event-market-meta" style={{ marginLeft: '10px', textAlign: 'right' }}>
                <div>Min: {market.mins || market.min_stake_limit || 100} | Max: {market.ms || market.max_bet || 100000}</div>
                <div>Max Market: {market.mml || market.max_market_limit || 500000}</div>
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
              ({new Date(eventData.match.eventDate).toLocaleString('en-US', {
                month: 'numeric', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
              })})
            </span>
            <span className="event-detail-name">
              {eventData.match.eventName}
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
              {eventData.match.leaguesName} - {eventData.match.eventName}
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