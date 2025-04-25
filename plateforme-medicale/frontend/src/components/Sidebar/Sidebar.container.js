import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import SidebarView from './Sidebar.view';

const SidebarContainer = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Utilisateur', role: '' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const menuItems = user.role === 'admin' ? [
    { text: 'Gestion des médecins', path: '/admin/medecins', icon: <PeopleIcon /> },
    { text: 'Gestion des institutions', path: '/admin/institutions', icon: <BusinessIcon /> },
    { text: 'Gestion des accès', path: '/admin/acces', icon: <SecurityIcon /> },
    { text: 'Statistiques', path: '/admin/statistiques', icon: <BarChartIcon /> },
  ] : [];

  return (
    <SidebarView
      user={user}
      menuItems={menuItems}
      handleNavigate={handleNavigate}
      handleLogout={handleLogout}
    />
  );
};

export default SidebarContainer;