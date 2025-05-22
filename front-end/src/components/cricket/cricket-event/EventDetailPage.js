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
    return <div className="loading-message">Loading event details...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!eventData) {
    return <div className="event-not-found-message">Event not found.</div>;
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

  // Helper to get runner names from runnerName array if available
  const getRunnerName = (runner, runnerNames) => {
    // First try to get name from runner object
    if (runner.sln || runner.name || runner.RN) {
      return runner.sln || runner.name || runner.RN;
    }
    // Then try to get from runnerName array
    const matchingRunner = runnerNames.find(r => r.SID === runner.si || r.SID === runner.sid);
    if (matchingRunner) {
      return matchingRunner.RN;
    }
    return '';
  };

  // Helper to render odds table with multiple prices/volumes
  const renderOddsTable = (market) => {
    // Safely get runners with fallback to empty array
    const runners = (market.sl || market.runners || []);
    
    // Get runner names from runnerName array if available
    const runnerNames = market.runnerName || [];
    
    return (
      <table className="odds-table">
        <thead>
          <tr className="odds-table-header-row">
            <th>Selection</th>
            <th className="back">Back</th>
            <th className="lay">Lay</th>
          </tr>
        </thead>
        <tbody>
          {runners.map((runner, idx) => {
            const runnerName = getRunnerName(runner, runnerNames);
            return (
              <tr key={idx}>
                <td>{runnerName}</td>
                {/* Back price */}
                <td className="back"
                    onClick={() => {
                    setSelectedMarketIndex(market.mi || market.marketId || market.id);
                    setSelectedBet({ 
                      marketIndex: market.mi || market.marketId || market.id, 
                      market: {
                        ...market,
                        mn: market.mn || market.marketName || market.name
                      }, 
                      odd: { 
                        ...runner, 
                        type: 'back', 
                        price: runner.b || (runner.ex?.b?.[0]?.p) || '', 
                        vol: '',
                        name: runnerName
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
                      market: {
                        ...market,
                        mn: market.mn || market.marketName || market.name
                      }, 
                      odd: { 
                        ...runner, 
                        type: 'lay', 
                        price: runner.l || (runner.ex?.l?.[0]?.p) || '', 
                        vol: '',
                        name: runnerName
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
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
            <div className="market-bookmark-checkmark"><CheckmarkIcon /></div>
          </div>
          <div className="market-content">
            <div className="market-name">{market.mn}</div>
            {isBallRunning(market) ? (
              renderBallRunning()
            ) : (
              <div className="session-market-container">
                <div className="odds-table-container">
                  <table className="odds-table">
                    <thead>
                      <tr>
                        <th className="no-header">NO</th>
                        <th className="yes-header">YES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="no" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'no', 
                                price: market.rn, 
                                vol: '',
                                name: 'NO'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.rn || '-'}</div>
                          <div className="odds-table-volume">{market.on || 100}</div>
                        </td>
                        <td className="yes" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'yes', 
                                price: market.ry, 
                                vol: '',
                                name: 'YES'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.ry || '-'}</div>
                          <div className="odds-table-volume">{market.oy || 100}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
            <div className="market-bookmark-checkmark"><CheckmarkIcon /></div>
          </div>
          <div className="market-content">
            <div className="market-name-large">{market.mn}</div>
            {isBallRunning(market) ? (
              renderBallRunning()
            ) : (
              <div className="session-market-container">
                <div className="odds-table-container">
                  <table className="odds-table">
                    <thead>
                      <tr>
                        <th className="no-header">NO</th>
                        <th className="yes-header">YES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="no" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'no', 
                                price: market.rn, 
                                vol: '',
                                name: 'NO'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.rn || '-'}</div>
                          <div className="odds-table-volume">{market.on || 100}</div>
                        </td>
                        <td className="yes" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'yes', 
                                price: market.ry, 
                                vol: '',
                                name: 'YES'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.ry || '-'}</div>
                          <div className="odds-table-volume">{market.oy || 100}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name">{market.mn}</div>
            {isBallRunning(market) ? (
              renderBallRunning()
            ) : (
              <div className="session-market-container">
                <div className="odds-table-container">
                  <table className="odds-table">
                    <thead>
                      <tr>
                        <th className="no-header">NO</th>
                        <th className="yes-header">YES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="no" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'no', 
                                price: market.rn, 
                                vol: '',
                                name: 'NO'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.rn || '-'}</div>
                          <div className="odds-table-volume">{market.on || 100}</div>
                        </td>
                        <td className="yes" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'yes', 
                                price: market.ry, 
                                vol: '',
                                name: 'YES'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.ry || '-'}</div>
                          <div className="odds-table-volume">{market.oy || 100}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Render ODD_EVEN_MARKETS in custom style with header row
  const renderOddEvenMarkets = (markets) => (
    <div className="odd-even-markets-container">
      <div className="odd-even-markets-header">
        ODD EVEN MARKETS
      </div>
      {markets.map((market, idx) => (
        <div key={idx} className="odd-even-market-row">
          <div className="odd-even-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="odd-even-market-content">
            <div className="odd-even-market-name">{market.mn}</div>
            <div className="odd-even-odds-container">
              {/* Pink (lay) box */}
              <div 
                className="odd-even-lay-box"
                onClick={() => {
                  setSelectedMarketIndex(market.mi);
                  setSelectedBet({ 
                    marketIndex: market.mi, 
                    market: {
                      ...market,
                      mn: market.mn || market.marketName || market.name
                    }, 
                    odd: { 
                      type: 'lay', 
                      price: market.ry || market.rn, 
                      vol: '',
                      name: 'YES'
                    } 
                  });
                  setStake('');
                }}
              >
                <div>{market.ry || '-'}</div>
                <div className="odd-even-volume">{market.oy || 100}</div>
              </div>
              {/* Blue (back) box */}
              <div 
                className="odd-even-back-box"
                onClick={() => {
                  setSelectedMarketIndex(market.mi);
                  setSelectedBet({ 
                    marketIndex: market.mi, 
                    market: {
                      ...market,
                      mn: market.mn || market.marketName || market.name
                    }, 
                    odd: { 
                      type: 'back', 
                      price: market.rn || market.ly, 
                      vol: '',
                      name: 'NO'
                    } 
                  });
                  setStake('');
                }}
              >
                <div>{market.rn || '-'}</div>
                <div className="odd-even-volume">{market.on || 100}</div>
              </div>
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
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name-large">{market.mn}</div>
            {isBallRunning(market) ? (
              renderBallRunning()
            ) : (
              <div className="session-market-container">
                <div className="odds-table-container">
                  <table className="odds-table">
                    <thead>
                      <tr>
                        <th className="no-header">NO</th>
                        <th className="yes-header">YES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="no" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'no', 
                                price: market.rn, 
                                vol: '',
                                name: 'NO'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.rn || '-'}</div>
                          <div className="odds-table-volume">{market.on || 100}</div>
                        </td>
                        <td className="yes" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'yes', 
                                price: market.ry, 
                                vol: '',
                                name: 'YES'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.ry || '-'}</div>
                          <div className="odds-table-volume">{market.oy || 100}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
      {markets.map((market, idx) => (
        <div key={idx} className="market-row">
          <div className="market-bookmark-container">
            <BookmarkIcon />
          </div>
          <div className="market-content">
            <div className="market-name">{market.mn}</div>
            {isBallRunning(market) ? (
              renderBallRunning()
            ) : (
              <div className="session-market-container">
                <div className="odds-table-container">
                  <table className="odds-table">
                    <thead>
                      <tr>
                        <th className="no-header">NO</th>
                        <th className="yes-header">YES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="no" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'no', 
                                price: market.rn, 
                                vol: '',
                                name: 'NO'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.rn || '-'}</div>
                          <div className="odds-table-volume">{market.on || 100}</div>
                        </td>
                        <td className="yes" onClick={() => {
                            setSelectedMarketIndex(market.mi);
                            setSelectedBet({ 
                              marketIndex: market.mi, 
                              market: {
                                ...market,
                                mn: market.mn || market.marketName || market.name
                              }, 
                              odd: { 
                                type: 'yes', 
                                price: market.ry, 
                                vol: '',
                                name: 'YES'
                              } 
                            });
                            setStake('');
                          }}
                        >
                          <div className="odds-table-value">{market.ry || '-'}</div>
                          <div className="odds-table-volume">{market.oy || 100}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Render all market groups
  const renderMarketGroups = () => {
    // Create an array to hold all market sections in the desired order
    const marketSections = [];
    
    // 1. First render BOOKMAKER if available
    if (markets['BOOKMAKER'] && markets['BOOKMAKER'].length > 0) {
      marketSections.push(
        <div className="event-market-section" key="BOOKMAKER" style={{ marginBottom: 32 }}>
          <div className="event-title-name-all">
            <div className="event-market-title">{getMarketDisplayName('BOOKMAKER')}</div>
          </div>
          {markets['BOOKMAKER'].map((market) => (
            <div className="event-market-row" key={market.mi || market.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {renderOddsTable(market)}
            </div>
          ))}
        </div>
      );
    }
    
    // 2. Then render WINNING_ODDS if available
    if (markets['WINNING_ODDS'] && markets['WINNING_ODDS'].length > 0) {
      marketSections.push(
        <div className="event-market-section" key="WINNING_ODDS" style={{ marginBottom: 32 }}>
          <div className="event-title-name-all">
            <div className="event-market-title">{getMarketDisplayName('WINNING_ODDS')}</div>
          </div>
          {markets['WINNING_ODDS'].map((market) => (
            <div className="event-market-row" key={market.mi || market.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {renderOddsTable(market)}
            </div>
          ))}
        </div>
      );
    }
    
    // 3. Then render all other markets in their original order
    Object.entries(markets).forEach(([marketType, marketList]) => {
      // Skip BOOKMAKER and WINNING_ODDS as they were already rendered
      if (marketType === 'BOOKMAKER' || marketType === 'WINNING_ODDS' || !marketList || marketList.length === 0) {
        return;
      }
      
      if (marketType === 'SESSION_MARKETS') {
        marketSections.push(
          <div className="event-market-section" key={marketType}>
            {renderSessionMarkets(marketList)}
          </div>
        );
      } else if (marketType === 'FALL_OF_WICKET') {
        marketSections.push(
          <div className="event-market-section" key={marketType}>
            {renderFallOfWicketMarkets(marketList)}
          </div>
        );
      } else if (marketType === 'OVER_SESSION_MARKET') {
        marketSections.push(
          <div className="event-market-section" key={marketType}>
            {renderOverSessionMarkets(marketList)}
          </div>
        );
      } else if (marketType === 'ODD_EVEN_MARKETS') {
        marketSections.push(
          <div className="event-market-section" key={marketType}>
            {renderOddEvenMarkets(marketList)}
          </div>
        );
      } else if (marketType === 'OTHER_MARKETS') {
        marketSections.push(
          <div className="event-market-section" key={marketType}>
            {renderOtherMarkets(marketList)}
          </div>
        );
      } else if (marketType === 'TOTAL_ADVANCE') {
        marketSections.push(
          <div className="event-market-section" key={marketType}>
            {renderTotalAdvanceMarkets(marketList)}
          </div>
        );
      } else {
        // Default rendering for other groups
        marketSections.push(
          <div className="event-market-section" key={marketType} style={{ marginBottom: 32 }}>
            <div className="event-title-name-all">
              <div className="event-market-title">{getMarketDisplayName(marketType)}</div>
            </div>
            {marketList.map((market) => (
              <div className="event-market-row" key={market.mi || market.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                {isBallRunning(market) ? (
                  renderBallRunning()
                ) : (
                  <div className="session-market-container">
                    <div className="odds-table-container">
                      <table className="odds-table">
                        <thead>
                          <tr>
                            <th className="no-header">NO</th>
                            <th className="yes-header">YES</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {/* NO column/cell */}
                            <td className="no" onClick={() => {
                                setSelectedMarketIndex(market.mi);
                                setSelectedBet({ 
                                  marketIndex: market.mi, 
                                  market: {
                                    ...market,
                                    mn: market.mn || market.marketName || market.name
                                  }, 
                                  odd: { 
                                    type: 'no', 
                                    price: market.rn, 
                                    vol: '',
                                    name: 'NO'
                                  } 
                                });
                                setStake('');
                              }}
                            >
                              <div className="odds-table-value">{market.rn || '-'}</div>
                              <div className="odds-table-volume">{market.on || 100}</div>
                            </td>
                            {/* YES column/cell */}
                            <td className="yes" onClick={() => {
                                setSelectedMarketIndex(market.mi);
                                setSelectedBet({ 
                                  marketIndex: market.mi, 
                                  market: {
                                    ...market,
                                    mn: market.mn || market.marketName || market.name
                                  }, 
                                  odd: { 
                                    type: 'yes', 
                                    price: market.ry, 
                                    vol: '',
                                    name: 'YES'
                                  } 
                                });
                                setStake('');
                              }}
                            >
                              <div className="odds-table-value">{market.ry || '-'}</div>
                              <div className="odds-table-volume">{market.oy || 100}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
    });
    
    // Return all market sections in the desired order
    return marketSections;
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
          {/* <button className="event-detail-bets-btn" onClick={() => setBetsModalOpen(true)}>BETS(0)</button> */}
        </div>
       {/* <ul className="event-detail-tabs nav nav-tabs" role="tablist">
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
        */}
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