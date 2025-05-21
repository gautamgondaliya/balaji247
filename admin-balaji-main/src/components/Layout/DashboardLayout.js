import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          marginLeft: '0px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 