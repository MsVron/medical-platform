import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const MedecinDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/medecin/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error.response?.data?.message || 'Erreur lors de la récupération des données');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Espace Médecin
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Espace Médecin
      </Typography>
      <Typography variant="h6">
        Bienvenue, {data.medecin.prenom} {data.medecin.nom}
      </Typography>
      <Typography>
        Spécialité: {data.medecin.specialite_nom || 'Non spécifiée'}
      </Typography>
      <Typography>
        Institution: {data.medecin.institution_nom || 'Aucune'}
      </Typography>
      {/* Placeholder for future features */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Rendez-vous à venir</Typography>
        <Typography color="textSecondary">
          (Fonctionnalité en cours de développement)
        </Typography>
      </Box>
    </Box>
  );
};

export default MedecinDashboard;