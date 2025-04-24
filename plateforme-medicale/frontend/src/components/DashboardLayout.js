import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Button, Divider } from '@mui/material';
import { AdminPanelSettings, MedicalServices, Person, Business, Lock, BarChart, ExitToApp } from '@mui/icons-material';

const getUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        prenom: user.prenom || 'Guest',
        nom: user.nom || '',
        role: user.role || 'admin',
      };
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return {
    prenom: 'Guest',
    nom: '',
    role: 'admin',
  };
};

const sidebarItems = {
  super_admin: [
    { text: 'Gestion des administrateurs', path: '/admin/admins', icon: <AdminPanelSettings /> },
    { text: 'Gestion des médecins', path: '/admin/medecins', icon: <MedicalServices /> },
    { text: 'Gestion des institutions', path: '/admin/institutions', icon: <Business /> },
    { text: 'Gestion des patients', path: '/admin/patients', icon: <Person /> },
    { text: 'Gestion des accès', path: '/admin/acces', icon: <Lock /> },
    { text: 'Statistiques', path: '/admin/statistiques', icon: <BarChart /> },
  ],
  admin: [
    { text: 'Gestion des médecins', path: '/admin/medecins', icon: <MedicalServices /> },
    { text: 'Gestion des institutions', path: '/admin/institutions', icon: <Business /> },
    { text: 'Statistiques', path: '/admin/statistiques', icon: <BarChart /> },
  ],
  medecin: [
    { text: 'Mon espace', path: '/medecin', icon: <MedicalServices /> },
  ],
  patient: [
    { text: 'Mon espace', path: '/patient', icon: <Person /> },
  ],
  institution: [
    { text: 'Mon espace', path: '/institution', icon: <Business /> },
    { text: 'Nos patients', path: '/institution/patients', icon: <Person /> },
  ],
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
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
            {user.prenom} {user.nom}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
          </Typography>
        </Box>
        <Divider />
        <List>
          {sidebarItems[user.role]?.map((item) => (
            <ListItem
              button
              key={item.text}
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': {
                  bgcolor: '#1976d2',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToApp />}
            fullWidth
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#fafafa',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;