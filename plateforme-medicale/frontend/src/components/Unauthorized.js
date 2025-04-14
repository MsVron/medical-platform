import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Accès non autorisé
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;