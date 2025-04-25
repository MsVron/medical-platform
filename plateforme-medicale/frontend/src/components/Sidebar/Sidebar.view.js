import React from 'react';
import '../styles/Sidebar.css'; // Import the Sidebar CSS
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

const SidebarView = ({ user, menuItems, handleNavigate, handleLogout }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          // CSS is applied via Sidebar.css
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {user.username} - {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                color: 'white',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '4px 12px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            backgroundColor: '#e74c3c',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
            '&:hover': {
              backgroundColor: '#c0392b',
            }
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Drawer>
  );
};

export default SidebarView;