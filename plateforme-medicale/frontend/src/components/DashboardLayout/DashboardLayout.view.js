import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Button, Divider } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';

const DashboardLayoutView = ({ user, sidebarItems, handleLogout }) => {
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

export default DashboardLayoutView;