import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const InstitutionHome = () => {
  return (
    <Container>
      <Box sx={{ mt: 4, p: 3, bgcolor: '#fffacd', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Espace Institution Médicale
        </Typography>
        <Typography variant="body1">
          Bienvenue sur votre espace institution de la plateforme médicale.
        </Typography>
      </Box>
    </Container>
  );
};

export default InstitutionHome;