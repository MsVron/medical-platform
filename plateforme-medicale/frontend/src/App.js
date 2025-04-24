import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminHome from './components/AdminHome';
//import MedecinHome from './components/MedecinHome';
import PatientHome from './components/PatientHome';
import InstitutionHome from './components/InstitutionHome';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ManageAdmins from './components/ManageAdmins';
import ManageMedecins from './components/ManageMedecins';
import { Container, Typography, Box } from '@mui/material';
import MedecinDashboard from './components/MedecinDashboard';

// Admin-specific pages
// const ManageDoctors = () => (
//   <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
//     <Typography variant="h4" gutterBottom>
//       Gestion des médecins
//     </Typography>
//     <Typography>Page pour gérer les médecins (à implémenter).</Typography>
//   </Box>
// );

const ManageInstitutions = () => (
  <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
    <Typography variant="h4" gutterBottom>
      Gestion des institutions
    </Typography>
    <Typography>Page pour gérer les institutions (à implémenter).</Typography>
  </Box>
);

const ManageAccess = () => (
  <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
    <Typography variant="h4" gutterBottom>
      Gestion des accès
    </Typography>
    <Typography>Page pour gérer les accès (à implémenter).</Typography>
  </Box>
);

const ManagePatients = () => (
  <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
    <Typography variant="h4" gutterBottom>
      Gestion des patients
    </Typography>
    <Typography>Page pour gérer les patients (à implémenter).</Typography>
  </Box>
);

const Statistics = () => (
  <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
    <Typography variant="h4" gutterBottom>
      Statistiques
    </Typography>
    <Typography>Page pour les statistiques (à implémenter).</Typography>
  </Box>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <ManageAdmins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medecins"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <ManageMedecins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/institutions"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <ManageInstitutions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <ManagePatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/acces"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <ManageAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistiques"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medecin"
            element={
              <ProtectedRoute allowedRoles={['medecin', 'super_admin', 'admin']}>
                <MedecinDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medecin/patients"
            element={
              <ProtectedRoute allowedRoles={['medecin', 'super_admin']}>
                <ManagePatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient', 'super_admin']}>
                <PatientHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution"
            element={
              <ProtectedRoute allowedRoles={['institution', 'super_admin', 'admin']}>
                <InstitutionHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/patients"
            element={
              <ProtectedRoute allowedRoles={['institution', 'super_admin', 'admin']}>
                <ManagePatients />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;