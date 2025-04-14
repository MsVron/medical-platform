import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const PatientHome = () => {
  return (
    <Container>
      <Box sx={{ mt: 4, p: 3, bgcolor: '#fff0f5', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Espace Patient
        </Typography>
        <Typography variant="body1">
          Bienvenue sur votre espace patient de la plateforme médicale.
        </Typography>
      </Box>
    </Container>
  );
};

export default PatientHome;
