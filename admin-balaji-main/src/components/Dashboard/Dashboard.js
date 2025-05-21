import React from 'react';
import { Typography, Box } from '@mui/material';
import DashboardLayout from '../Layout/DashboardLayout';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the SPORTSQUARE Admin Panel
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard; 