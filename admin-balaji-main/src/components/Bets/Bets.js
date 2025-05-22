import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Casino as BetsIcon } from '@mui/icons-material';
import DashboardLayout from '../Layout/DashboardLayout';
import axios from 'axios';

const Bets = () => {
  const [bets, setBets] = useState([]);
  const [totalBets, setTotalBets] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('https://backbalaji.dynexbet.com/api/betting/grouped/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Transform the nested data structure
        let allBets = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          allBets = response.data.data.reduce((acc, user) => {
            if (Array.isArray(user.bets)) {
              const userBets = user.bets.map(bet => ({
                ...bet,
                userName: user.name,
                userId: user.user_id
              }));
              return [...acc, ...userBets];
            }
            return acc;
          }, []);
        }
        
        setBets(allBets);
        setTotalBets(allBets.length);
      } catch (err) {
        setError('Failed to fetch bets');
        console.error('Error fetching bets:', err);
      }
    };

    fetchBets();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'settled':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBetTypeColor = (betType) => {
    if (!betType) return 'default';
    switch (betType.toLowerCase()) {
      case 'yes':
        return 'success';
      case 'no':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'primary';
    }
  };

  const formatAmount = (amount) => {
    if (!amount || amount === '0.00') return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          All Bets
        </Typography>

        {/* Total Bets Card */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#1a237e', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <BetsIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{totalBets}</Typography>
                  <Typography variant="subtitle1">Total Bets</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bets Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="bets table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>User ID</strong></TableCell>
                <TableCell><strong>User Name</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Bet Type</strong></TableCell>
                <TableCell><strong>Odd Type</strong></TableCell>
                <TableCell><strong>Runs</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Market ID</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(bets) && bets.length > 0 ? (
                bets.map((bet) => (
                  <TableRow
                    key={bet.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{bet.userId || 'N/A'}</TableCell>
                    <TableCell>{bet.userName || 'N/A'}</TableCell>
                    <TableCell>{formatAmount(bet.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={(bet.bet_type || 'N/A').toUpperCase()}
                        color={getBetTypeColor(bet.bet_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{bet.odd_type || 'N/A'}</TableCell>
                    <TableCell>{bet.runs || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={(bet.settlement_status || 'N/A').toUpperCase()}
                        color={getStatusColor(bet.settlement_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{bet.market_id || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No bets found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Bets; 