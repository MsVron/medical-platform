import React from 'react';
import '../../styles/Login.css';
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
          borderRadius: 5,
          boxShadow: '0 4px 20px rgba(44, 62, 80, 0.1)',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }} id='title'>
          BluePulse
        </Typography>
        <Typography component="h2" variant="h5" sx={{ mb: 3 }} id='subtitle'>
          Connexion
        </Typography>

        {/* ECG Animation from Login.js */}
        <div className="ecg-container">
          <svg className="ecg-line" viewBox="0 0 2000 50" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#4ca1af"
              strokeWidth="2"
              points="
                0,25 100,25 110,5 120,45 130,25 300,25
                310,5 320,45 330,25 500,25
                510,5 520,45 530,25 700,25
                710,5 720,45 730,25 900,25
                910,5 920,45 930,25 1000,25

                1000,25 1100,25 1110,5 1120,45 1130,25 1300,25
                1310,5 1320,45 1330,25 1500,25
                1510,5 1520,45 1530,25 1700,25
                1710,5 1720,45 1730,25 1900,25
                1910,5 1920,45 1930,25 2000,25
              "
            />
          </svg>
        </div>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            mt: 4,
            width: '100%'
          }}
        >
          <TextField
            className="bluepulse-input"
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
            InputLabelProps={{
              shrink: true
            }}
          />
          <TextField
            className="bluepulse-input"
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
            InputLabelProps={{
              shrink: true
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#4ca1af',
              color: 'white',
              '&:hover': {
                bgcolor: '#2c3e50',
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(76, 161, 175, 0.3)',
              borderRadius: '8px',
              padding: '12px 0',
              fontWeight: 'bold'
            }}
          >
            Se connecter
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginView;