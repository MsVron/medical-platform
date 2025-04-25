import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginView from './Login.view';

const LoginContainer = () => {
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
    <LoginView
      username={username}
      password={password}
      error={error}
      setUsername={setUsername}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};

export default LoginContainer;