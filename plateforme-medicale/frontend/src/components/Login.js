import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        nom_utilisateur: username.trim(),
        mot_de_passe: password.trim(),
      });
      console.log('Login response:', response.data);

      // Log user data before storing
      const userData = {
        id: response.data.user.id,
        username: response.data.user.nom_utilisateur,
        role: response.data.user.role,
        prenom: response.data.user.prenom,
        nom: response.data.user.nom,
        id_specifique_role: response.data.user.id_specifique_role // Add for debugging
      };
      console.log('Storing in localStorage:', {
        token: response.data.token,
        user: userData,
      });

      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role
      console.log('User role:', response.data.user.role);
      if (['super_admin', 'admin'].includes(response.data.user.role)) {
        console.log('Navigating to /admin');
        navigate('/admin', { replace: true });
      } else if (response.data.user.role === 'medecin') {
        console.log('Navigating to /medecin');
        navigate('/medecin', { replace: true });
      } else if (response.data.user.role === 'patient') {
        console.log('Navigating to /patient');
        navigate('/patient', { replace: true });
      } else if (response.data.user.role === 'institution') {
        console.log('Navigating to /institution');
        navigate('/institution', { replace: true });
      } else {
        console.log('Unknown role, no navigation');
        setError('Rôle utilisateur non reconnu');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data);
      setError(error.response?.data?.message || 'Erreur lors de la connexion');
    }
  };

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

export default Login;