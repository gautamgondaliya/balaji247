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
} from '@mui/material';
import axios from 'axios';
import DashboardLayout from '../Layout/DashboardLayout';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://backbalaji.dynexbet.com/api';

const BettingResults = () => {
  const [pendingBets, setPendingBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);
  const [settlementType, setSettlementType] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
        setPendingBets(allPendingBets);
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
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchBets, 30000);
    
    return () => clearInterval(intervalId);
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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Results Declaration
        </Typography>
        
        <Paper sx={{ p: 2, mt: 2 }}>
          {loading ? (
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">User ID</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Market ID</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Amount</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Bet Type</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Odd Type</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingBets.map((bet) => (
                    <TableRow key={bet.id} hover>
                      <TableCell>{formatDate(bet.created_at)}</TableCell>
                      <TableCell>
                        {bet.display_user_id && bet.display_user_id.startsWith('UN') ? bet.display_user_id : 'N/A'}
                      </TableCell>
                      <TableCell>{bet.market_id}</TableCell>
                      <TableCell>₹{parseFloat(bet.amount).toLocaleString()}</TableCell>
                      <TableCell>{bet.bet_type}</TableCell>
                      <TableCell>{bet.odd_type}</TableCell>
                      <TableCell>{bet.settlement_status}</TableCell>
                      <TableCell>
                        <Box>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small" 
                            onClick={() => handleOpenDialog(bet, 'win')}
                            sx={{ mr: 1 }}
                          >
                            Win
                          </Button>
                          <Button 
                            variant="contained" 
                            color="error" 
                            size="small"
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
          )}
        </Paper>
        
        {/* Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
        >
          <DialogTitle>
            {settlementType === 'win' ? 'Mark Bet as Winner' : 'Mark Bet as Loser'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to mark this bet as a {settlementType === 'win' ? 'winner' : 'loser'}?
              <Box mt={2}>
                <Typography variant="body2">
                  <strong>User ID:</strong> {currentBet?.display_user_id || currentBet?.user_id || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Market ID:</strong> {currentBet?.market_id}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> ₹{parseFloat(currentBet?.amount || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Bet Type:</strong> {currentBet?.bet_type}
                </Typography>
              </Box>
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
