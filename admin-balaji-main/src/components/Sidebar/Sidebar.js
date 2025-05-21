import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Language as ViewSiteIcon,
  Casino as BetsIcon,
  EmojiEvents as ResultsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const [expandedMenus, setExpandedMenus] = React.useState({});

  const toggleSubMenu = (menuText) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'All Bets', icon: <BetsIcon />, path: '/bets' },
    { 
      text: 'Payments', 
      icon: <PaymentIcon />, 
      hasSubMenu: true,
      subMenuItems: [
        { text: 'Deposit Requests', path: '/payments/deposits' },
        { text: 'Withdrawal Requests', path: '/payments/withdrawals' }
      ]
    },
    { text: 'Results Declaration', icon: <ResultsIcon />, path: '/results' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            color: '#9c27b0',
            fontWeight: 'bold',
            letterSpacing: 1,
            mb: 2,
          }}
        >
          BALAJI 247
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>
          Admin Panel
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: '#9c27b0',
            width: 40,
            height: 40,
            mr: 2,
          }}
        >
          {user.name?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#fff' }}>
            Administrator
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            Super admin
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              button
              onClick={() => item.hasSubMenu ? toggleSubMenu(item.text) : navigate(item.path)}
              sx={{
                borderRadius: '8px',
                mb: 1,
                backgroundColor:
                  !item.hasSubMenu && location.pathname === item.path
                    ? 'rgba(156, 39, 176, 0.2)'
                    : item.hasSubMenu && location.pathname.includes(item.text.toLowerCase())
                    ? 'rgba(156, 39, 176, 0.2)'
                    : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: '40px' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                  },
                }}
              />
              {item.hasSubMenu && (
                expandedMenus[item.text] ? <ArrowUpIcon sx={{ color: '#fff' }} /> : <ArrowDownIcon sx={{ color: '#fff' }} />
              )}
            </ListItem>
            
            {item.hasSubMenu && (
              <Collapse in={expandedMenus[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subMenuItems.map((subItem) => (
                    <ListItem
                      button
                      key={subItem.text}
                      onClick={() => navigate(subItem.path)}
                      sx={{
                        pl: 4,
                        py: 0.5,
                        borderRadius: '8px',
                        mb: 1,
                        backgroundColor:
                          location.pathname === subItem.path
                            ? 'rgba(156, 39, 176, 0.2)'
                            : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={subItem.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.85rem',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            mt: 2,
            '&:hover': {
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#fff', minWidth: '40px' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.9rem',
              },
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar; 