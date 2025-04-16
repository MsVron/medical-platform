import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminHome = () => {
  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord Administrateur
      </Typography>
      <Typography variant="body1">
        Bienvenue sur votre espace administrateur de la plateforme médicale.
      </Typography>
    </Box>
  );
};

export default AdminHome;