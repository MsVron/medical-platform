import React from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';

const LoginView = ({
  username,
  password,
  error,
  setUsername,
  setPassword,
  handleSubmit
}) => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Plateforme Médicale
        </Typography>
        <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
          Connexion
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: '#1976d2' }}
          >
            Se connecter
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginView;