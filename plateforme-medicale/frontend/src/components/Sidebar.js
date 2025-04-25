import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css'
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

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Utilisateur', role: '' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const menuItems = user.role === 'admin' ? [
    { text: 'Gestion des médecins', path: '/admin/medecins', icon: <PeopleIcon /> },
    { text: 'Gestion des institutions', path: '/admin/institutions', icon: <BusinessIcon /> },
    { text: 'Gestion des accès', path: '/admin/acces', icon: <SecurityIcon /> },
    { text: 'Statistiques', path: '/admin/statistiques', icon: <BarChartIcon /> },
  ] : [];

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
            <ListItemButton onClick={() => navigate(item.path)}>
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

export default Sidebar;