import React from 'react';
import '../styles/Sidebar.css';
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
          bgcolor: '#f5f5f5',
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
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
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
        >
          Déconnexion
        </Button>
      </Box>
    </Drawer>
  );
};

export default SidebarView;