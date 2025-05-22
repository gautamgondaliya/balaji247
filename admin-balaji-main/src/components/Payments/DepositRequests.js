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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';
import DashboardLayout from '../Layout/DashboardLayout';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://backbalaji.dynexbet.com/api';

const DepositRequests = () => {
  const [depositRequests, setDepositRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [actionType, setActionType] = useState('');
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

  // Fetch deposit requests
  const fetchDepositRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/deposit`, getAuthHeaders());
      
      if (response.data.success) {
        setDepositRequests(response.data.data);
      } else {
        setError('Failed to fetch deposit requests');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching deposit requests');
      console.error('Error fetching deposit requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositRequests();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchDepositRequests, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle dialog open for action confirmation
  const handleOpenDialog = (request, action) => {
    setCurrentRequest(request);
    setActionType(action);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRequest(null);
  };

  // Update deposit request status
  const updateDepositStatus = async () => {
    if (!currentRequest || !actionType) return;
    
    try {
      // Use 'accept' instead of 'accepted' as per API expectation
      const status = actionType === 'accept' ? 'accept' : 'reject';
      
      const response = await axios.post(
        `${BASE_URL}/deposit/status`, 
        {
          deposit_request_id: currentRequest.id, // Use the API's expected field name
          status: status
        },
        getAuthHeaders()
      );
      
      if (response.data.success) {
        if (actionType === 'accept') {
          // Update local state to show accepted status
          setDepositRequests(prev => 
            prev.map(req => 
              req.id === currentRequest.id ? { ...req, status: 'accepted' } : req
            )
          );
          
          // Show success message
          setSnackbarMessage('Deposit request accepted successfully');
        } else {
          // Remove the rejected request from the list
          setDepositRequests(prev => 
            prev.filter(req => req.id !== currentRequest.id)
          );
          
          // Show success message
          setSnackbarMessage('Deposit request removed successfully');
        }
        
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        // Show error message
        setSnackbarMessage(response.data.message || `Failed to ${actionType} deposit request`);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error(`Error ${actionType}ing deposit request:`, err);
      setSnackbarMessage(err.response?.data?.message || `Error ${actionType}ing deposit request`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      handleCloseDialog();
    }
  };

  // Format date (custom implementation without date-fns)
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  // Status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Deposit Requests
        </Typography>
        
        <Paper sx={{ p: 2, mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : depositRequests.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
              No deposit requests found
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">User ID</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Amount</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Transaction ID</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {depositRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.id.substring(0, 8)}...</TableCell>
                      <TableCell>{(request.userId || request.user_id || '').substring(0, 8)}...</TableCell>
                      <TableCell>₹{parseFloat(request.amount).toLocaleString()}</TableCell>
                      <TableCell>{request.transaction_id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          color={getStatusColor(request.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <Box>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              onClick={() => handleOpenDialog(request, 'accept')}
                              sx={{ mr: 1 }}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDialog(request, 'reject')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
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
            {actionType === 'accept' ? 'Accept Deposit Request' : 'Reject Deposit Request'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to {actionType} this deposit request?
              <Box mt={2}>
                <Typography variant="body2">
                  <strong>Amount:</strong> ₹{currentRequest?.amount}
                </Typography>
                <Typography variant="body2">
                  <strong>Transaction ID:</strong> {currentRequest?.transaction_id}
                </Typography>
                <Typography variant="body2">
                  <strong>User ID:</strong> {currentRequest?.userId || currentRequest?.user_id || 'N/A'}
                </Typography>
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={updateDepositStatus} 
              color={actionType === 'accept' ? 'success' : 'error'}
              variant="contained"
              autoFocus
            >
              Confirm {actionType === 'accept' ? 'Accept' : 'Reject'}
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

export default DepositRequests;
