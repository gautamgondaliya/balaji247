import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import axios from 'axios';
import DashboardLayout from '../Layout/DashboardLayout';
import './BettingResults.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BettingResults = () => {
  const [pendingBets, setPendingBets] = useState([]);
  const [backLayBets, setBackLayBets] = useState([]);
  const [yesNoBets, setYesNoBets] = useState([]);
  const [activeView, setActiveView] = useState('all'); // 'all', 'backlay', or 'yesno'
  const [betSummary, setBetSummary] = useState({
    totalBets: 0,
    totalAmount: 0,
    totalPotentialWin: 0,
    totalPotentialLoss: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);
  const [settlementType, setSettlementType] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedBets, setSelectedBets] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkSettleDialog, setBulkSettleDialog] = useState(false);
  const [bulkSettleType, setBulkSettleType] = useState('');

  // Get the auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch all bets
  const fetchBets = async () => {
    try {
      setLoading(true);
      console.log('Fetching betting data from API...');
      const response = await axios.get(`${BASE_URL}/betting/grouped/all`, getAuthHeaders());
      console.log('API response:', response.data);
      
      if (response.data.success) {
        // Handle grouped data format (users with bets arrays)
        let allPendingBets = [];
        
        // Process each user and their bets
        response.data.data.forEach(userData => {
          console.log(`Processing bets for user: ${userData.user_id || 'unknown'}`);
          
          // Check if user has bets and bets is an array
          if (userData.bets && Array.isArray(userData.bets)) {
            // Filter for pending bets from this user
            const userPendingBets = userData.bets.filter(bet => bet.settlement_status === 'pending');
            
            // Add user info to each bet for display in table
            const betsWithUserInfo = userPendingBets.map(bet => ({
              ...bet,
              display_user_id: userData.user_id || bet.user_id,
              display_name: userData.name || ''
            }));
            
            allPendingBets = [...allPendingBets, ...betsWithUserInfo];
          }
        });
        
        console.log(`Found ${allPendingBets.length} pending bets total`);
        
        // Sort pending bets to show latest first (by created_at date)
        const sortedBets = allPendingBets.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        // Separate bets into two groups based on bet type
        const backLayGroup = sortedBets.filter(bet => 
          (bet.bet_type?.toLowerCase() === 'back' || 
          bet.bet_type?.toLowerCase() === 'lay') &&
          !(bet.current_bet_name?.toLowerCase().includes('yes') || 
            bet.current_bet_name?.toLowerCase().includes('no'))
        );
        
        // Filter for Yes/No bets more comprehensively
        const yesNoGroup = sortedBets.filter(bet => 
          // Check in multiple fields for yes/no indicators
          bet.current_bet_name?.toLowerCase().includes('yes') || 
          bet.current_bet_name?.toLowerCase().includes('no') ||
          bet.odd_type?.toLowerCase() === 'yes' || 
          bet.odd_type?.toLowerCase() === 'no'
        );
        
        // Calculate summary statistics
        const totalAmount = sortedBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
        const totalPotentialWin = sortedBets.reduce((sum, bet) => sum + parseFloat(bet.potential_win || 0), 0);
        const totalPotentialLoss = sortedBets.reduce((sum, bet) => sum + parseFloat(bet.potential_loss || 0), 0);
        
        setBetSummary({
          totalBets: sortedBets.length,
          totalAmount,
          totalPotentialWin,
          totalPotentialLoss
        });
        
        setBackLayBets(backLayGroup);
        setYesNoBets(yesNoGroup);
        setPendingBets(sortedBets);
        // Reset selections when data changes
        setSelectedBets([]);
        setSelectAll(false);
      } else {
        console.error('API returned error:', response.data.message);
        setError('Failed to fetch bets');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching bets');
      console.error('Error fetching bets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
    // No automatic refresh - removed interval
  }, []);

  // Handle dialog open for bet settlement confirmation
  const handleOpenDialog = (bet, type) => {
    setCurrentBet(bet);
    setSettlementType(type);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBet(null);
  };

  // Update bet settlement status
  const updateBetSettlement = async () => {
    if (!currentBet || !settlementType) return;
    
    try {
      // Convert our internal 'win'/'loss' to the API's expected 'yes'/'no' values
      const apiStatus = settlementType === 'win' ? 'yes' : 'no';
      console.log(`Settling bet ${currentBet.id} with status: ${apiStatus}`);
      
      const response = await axios.post(
        `${BASE_URL}/betting/settle`, 
        {
          bet_id: currentBet.id,
          status: apiStatus // 'yes' for win, 'no' for loss
        },
        getAuthHeaders()
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Update local state by removing the settled bet
        setPendingBets(prev => 
          prev.filter(bet => bet.id !== currentBet.id)
        );
        
        // Show success message
        setSnackbarMessage(`Bet marked as ${settlementType === 'win' ? 'Winner' : 'Loser'} successfully`);
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        // Show error message
        setSnackbarMessage(response.data.message || `Failed to settle bet`);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error(`Error settling bet:`, err);
      console.error('Error details:', err.response || err.message);
      setSnackbarMessage(err.response?.data?.message || `Error settling bet`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      handleCloseDialog();
    }
  };

  // Handle selecting a bet
  const handleSelectBet = (betId) => {
    setSelectedBets(prev => {
      if (prev.includes(betId)) {
        // Remove from selection
        return prev.filter(id => id !== betId);
      } else {
        // Add to selection
        return [...prev, betId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedBets([]);
    } else {
      // Select all
      setSelectedBets(pendingBets.map(bet => bet.id));
    }
    setSelectAll(!selectAll);
  };

  // Open bulk settlement dialog
  const handleOpenBulkDialog = (type) => {
    if (selectedBets.length === 0) {
      setSnackbarMessage("Please select at least one bet");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      return;
    }
    setBulkSettleType(type);
    setBulkSettleDialog(true);
  };

  // Close bulk settlement dialog
  const handleCloseBulkDialog = () => {
    setBulkSettleDialog(false);
  };

  // Process bulk settlement
  const processBulkSettlement = async () => {
    if (selectedBets.length === 0) return;

    try {
      const apiStatus = bulkSettleType === 'win' ? 'yes' : 'no';
      let successCount = 0;
      let failCount = 0;

      // Process each bet sequentially
      for (const betId of selectedBets) {
        try {
          const response = await axios.post(
            `${BASE_URL}/betting/settle`,
            {
              bet_id: betId,
              status: apiStatus
            },
            getAuthHeaders()
          );

          if (response.data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
          console.error(`Error settling bet ${betId}:`, err);
        }
      }

      // Update UI and show message
      if (successCount > 0) {
        // Refresh data to get updated status
        fetchBets();

        setSnackbarMessage(`Successfully settled ${successCount} bets. Failed: ${failCount}`);
        setSnackbarSeverity(failCount > 0 ? 'warning' : 'success');
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage('Failed to settle bets');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Error in bulk settlement:', err);
      setSnackbarMessage('Error processing bulk settlement');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      handleCloseBulkDialog();
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Format date to show only the date part
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom className="results-title">
          Results Declaration
        </Typography>
        
        {/* Bet Summary Card */}
        <Card className="bet-summary-card" elevation={2}>
          <CardContent>
            <Typography className="bet-summary-title" variant="h6">Bet Summary</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <div className="bet-summary-item">
                  <span className="bet-summary-label">Total Bets:</span>
                  <span className="bet-summary-value total">{betSummary.totalBets}</span>
                </div>
              </Grid>
              <Grid item xs={12} md={3}>
                <div className="bet-summary-item">
                  <span className="bet-summary-label">Total Amount:</span>
                  <span className="bet-summary-value total">₹{betSummary.totalAmount.toLocaleString()}</span>
                </div>
              </Grid>
              <Grid item xs={12} md={3}>
                <div className="bet-summary-item">
                  <span className="bet-summary-label">Potential Win:</span>
                  <span className="bet-summary-value win">₹{betSummary.totalPotentialWin.toLocaleString()}</span>
                </div>
              </Grid>
              <Grid item xs={12} md={3}>
                <div className="bet-summary-item">
                  <span className="bet-summary-label">Potential Loss:</span>
                  <span className="bet-summary-value loss">₹{betSummary.totalPotentialLoss.toLocaleString()}</span>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2">
            Pending Bets ({pendingBets.length}) - Back/Lay: {backLayBets.length}, Yes/No: {yesNoBets.length}
          </Typography>
        </Box>
        
        <div className="bet-filter-button-group">
          <Button
            variant="contained"
            className={activeView === 'all' ? 'active' : ''}
            color={activeView === 'all' ? 'secondary' : 'primary'}
            onClick={() => setActiveView('all')}
          >
            ALL BETS
          </Button>
          <Button
            variant="contained"
            className={activeView === 'backlay' ? 'active' : ''}
            color={activeView === 'backlay' ? 'secondary' : 'primary'}
            onClick={() => setActiveView('backlay')}
          >
            BACK/LAY
          </Button>
          <Button
            variant="contained"
            className={activeView === 'yesno' ? 'active' : ''}
            color={activeView === 'yesno' ? 'secondary' : 'primary'}
            onClick={() => setActiveView('yesno')}
          >
            YES/NO
          </Button>
          <Button
            variant="contained"
            color="primary"
            className="refresh-button"
            onClick={fetchBets}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={loading}
          >
            {loading ? 'REFRESHING...' : 'REFRESH BETS'}
          </Button>
        </div>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          {loading && pendingBets.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : pendingBets.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
              No pending bets to settle
            </Typography>
          ) : (
            <>
              {/* Bulk action buttons */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1">
                    {selectedBets.length} of {pendingBets.length} bets selected
                  </Typography>
                </Box>
                <Box>
                  <Button 
                    variant="contained" 
                    color="success" 
                    disabled={selectedBets.length === 0}
                    onClick={() => handleOpenBulkDialog('win')}
                    sx={{ mr: 1 }}
                  >
                    Mark Selected as WIN
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    disabled={selectedBets.length === 0}
                    onClick={() => handleOpenBulkDialog('loss')}
                  >
                    Mark Selected as LOSS
                  </Button>
                </Box>
              </Box>

              {/* Table for Back/Lay Bets */}
              {backLayBets.length > 0 && (activeView === 'all' || activeView === 'backlay') && (
                <>
                  <Typography variant="h6" className="section-title">
                    Back/Lay Bets
                  </Typography>
                  <TableContainer className="table-container">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={backLayBets.every(bet => selectedBets.includes(bet.id))}
                              onChange={() => {
                                const allBackLayIds = backLayBets.map(bet => bet.id);
                                if (allBackLayIds.every(id => selectedBets.includes(id))) {
                                  setSelectedBets(selectedBets.filter(id => !allBackLayIds.includes(id)));
                                } else {
                                  setSelectedBets([...new Set([...selectedBets, ...allBackLayIds])]);
                                }
                              }}
                              indeterminate={backLayBets.some(bet => selectedBets.includes(bet.id)) && !backLayBets.every(bet => selectedBets.includes(bet.id))}
                            />
                          </TableCell>
                          <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
                          {/* <TableCell><Typography variant="subtitle2">User ID</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Market ID</Typography></TableCell> */}
                          <TableCell><Typography variant="subtitle2">Bet Details</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Amount</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Potential Win</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Potential Loss</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Bet Type</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Runs</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Odd Type</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {backLayBets.map((bet) => (
                          <TableRow 
                            key={bet.id} 
                            hover
                            selected={selectedBets.includes(bet.id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedBets.includes(bet.id)}
                                onChange={() => handleSelectBet(bet.id)}
                              />
                            </TableCell>
                            <TableCell>{formatDate(bet.created_at)}</TableCell>
                            {/* <TableCell>{bet.display_user_id || bet.user_id}</TableCell>
                            <TableCell>{bet.market_id}</TableCell> */}
                            <TableCell>{bet.current_bet_name || 'N/A'}</TableCell>
                            <TableCell>₹{parseFloat(bet.amount || 0).toLocaleString()}</TableCell>
                            <TableCell>₹{parseFloat(bet.potential_win || 0).toLocaleString()}</TableCell>
                            <TableCell>₹{parseFloat(bet.potential_loss || 0).toLocaleString()}</TableCell>
                            <TableCell><strong>{bet.bet_type}</strong></TableCell>
                            <TableCell>{bet.runs}</TableCell>
                            <TableCell>{bet.odd_type}</TableCell>
                            <TableCell>{bet.settlement_status}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenDialog(bet, 'win')}
                                >
                                  Win
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDialog(bet, 'loss')}
                                >
                                  Loss
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {/* Table for Yes/No Bets */}
              {yesNoBets.length > 0 && (activeView === 'all' || activeView === 'yesno') && (
                <>
                  <Typography variant="h6" className="section-title">
                    Yes/No Bets
                  </Typography>
                  <TableContainer className="table-container">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={yesNoBets.every(bet => selectedBets.includes(bet.id))}
                              onChange={() => {
                                const allYesNoIds = yesNoBets.map(bet => bet.id);
                                if (allYesNoIds.every(id => selectedBets.includes(id))) {
                                  setSelectedBets(selectedBets.filter(id => !allYesNoIds.includes(id)));
                                } else {
                                  setSelectedBets([...new Set([...selectedBets, ...allYesNoIds])]);
                                }
                              }}
                              indeterminate={yesNoBets.some(bet => selectedBets.includes(bet.id)) && !yesNoBets.every(bet => selectedBets.includes(bet.id))}
                            />
                          </TableCell>
                          <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">User ID</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Market ID</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Bet Details</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Amount</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Potential Win</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Potential Loss</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Bet Type</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Runs</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Odd Type</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                          <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {yesNoBets.map((bet) => (
                          <TableRow 
                            key={bet.id} 
                            hover
                            selected={selectedBets.includes(bet.id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedBets.includes(bet.id)}
                                onChange={() => handleSelectBet(bet.id)}
                              />
                            </TableCell>
                            <TableCell>{formatDate(bet.created_at)}</TableCell>
                            <TableCell>{bet.display_user_id || bet.user_id}</TableCell>
                            <TableCell>{bet.market_id}</TableCell>
                            <TableCell>{bet.current_bet_name || 'N/A'}</TableCell>
                            <TableCell>₹{parseFloat(bet.amount || 0).toLocaleString()}</TableCell>
                            <TableCell>₹{parseFloat(bet.potential_win || 0).toLocaleString()}</TableCell>
                            <TableCell>₹{parseFloat(bet.potential_loss || 0).toLocaleString()}</TableCell>
                            <TableCell><strong>{bet.bet_type}</strong></TableCell>
                            <TableCell>{bet.runs}</TableCell>
                            <TableCell><strong>{bet.odd_type}</strong></TableCell>
                            <TableCell>{bet.settlement_status}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenDialog(bet, 'win')}
                                >
                                  Win
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDialog(bet, 'loss')}
                                >
                                  Loss
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
              {/* No bets found message */}
              {((activeView === 'all' && backLayBets.length === 0 && yesNoBets.length === 0) ||
                (activeView === 'backlay' && backLayBets.length === 0) ||
                (activeView === 'yesno' && yesNoBets.length === 0)) && (
                <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                  No bets found in either category
                </Typography>
              )}
            </>
          )}
        </Paper>
        
        {/* Single Bet Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
        >
          <DialogTitle>
            {settlementType === 'win' ? 'Mark Bet as Winner' : 'Mark Bet as Loser'}
          </DialogTitle>
          <DialogContent className="dialog-content">
            <DialogContentText>
              Are you sure you want to mark this bet as a {settlementType === 'win' ? 'winner' : 'loser'}?
              
              <div className="dialog-bet-details">
                <div className="dialog-bet-detail-item">
                  <strong>User ID:</strong> {currentBet?.display_user_id || currentBet?.user_id || 'N/A'}
                </div>
                <div className="dialog-bet-detail-item">
                  <strong>Market ID:</strong> {currentBet?.market_id}
                </div>
                <div className="dialog-bet-detail-item">
                  <strong>Bet Details:</strong> {currentBet?.current_bet_name || 'N/A'}
                </div>
                <div className="dialog-bet-detail-item">
                  <strong>Amount:</strong> ₹{parseFloat(currentBet?.amount || 0).toLocaleString()}
                </div>
                <div className="dialog-bet-detail-item">
                  <strong>Bet Type:</strong> {currentBet?.bet_type}
                </div>
                <div className="dialog-bet-detail-item">
                  <strong>Runs:</strong> {currentBet?.runs}
                </div>
                <div className="dialog-bet-detail-item">
                  <strong>Odd Type:</strong> {currentBet?.odd_type}
                </div>
              </div>
              
              <div className={`settlement-summary ${settlementType === 'win' ? 'win-summary' : 'loss-summary'}`}>
                <Typography variant="subtitle1" gutterBottom>
                  {settlementType === 'win' ? 'Win Settlement Summary' : 'Loss Settlement Summary'}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <div className="dialog-bet-detail-item">
                  <strong>Original Bet Amount:</strong> ₹{parseFloat(currentBet?.amount || 0).toLocaleString()}
                </div>
                {settlementType === 'win' ? (
                  <div className="dialog-bet-detail-item">
                    <strong>Win Amount:</strong> ₹{parseFloat(currentBet?.potential_win || 0).toLocaleString()}
                  </div>
                ) : (
                  <div className="dialog-bet-detail-item">
                    <strong>Loss Amount:</strong> ₹{parseFloat(currentBet?.potential_loss || 0).toLocaleString()}
                  </div>
                )}
                <Divider sx={{ my: 1 }} />
                <div className="dialog-bet-detail-item">
                  <strong>Final Settlement:</strong> 
                  {settlementType === 'win' ? (
                    <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      ₹{parseFloat(currentBet?.potential_win || 0).toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                      -₹{parseFloat(currentBet?.potential_loss || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={updateBetSettlement} 
              color={settlementType === 'win' ? 'success' : 'error'}
              variant="contained"
              autoFocus
            >
              Confirm {settlementType === 'win' ? 'Win' : 'Loss'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Bulk Settlement Confirmation Dialog */}
        <Dialog
          open={bulkSettleDialog}
          onClose={handleCloseBulkDialog}
        >
          <DialogTitle>
            {bulkSettleType === 'win' ? 'Mark Selected Bets as Winners' : 'Mark Selected Bets as Losers'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to mark {selectedBets.length} bet(s) as {bulkSettleType === 'win' ? 'winners' : 'losers'}?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBulkDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={processBulkSettlement} 
              color={bulkSettleType === 'win' ? 'success' : 'error'}
              variant="contained"
              autoFocus
            >
              Confirm {bulkSettleType === 'win' ? 'Win' : 'Loss'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default BettingResults;
