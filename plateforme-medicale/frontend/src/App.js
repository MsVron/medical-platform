import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminHome from './components/AdminHome';
import MedecinHome from './components/MedecinHome';
import PatientHome from './components/PatientHome';
import InstitutionHome from './components/InstitutionHome';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminHome />
          </ProtectedRoute>
        } />

        <Route path="/medecin" element={
          <ProtectedRoute allowedRoles={['medecin', 'admin']}>
            <MedecinHome />
          </ProtectedRoute>
        } />

        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient', 'admin']}>
            <PatientHome />
          </ProtectedRoute>
        } />

        <Route path="/institution" element={
          <ProtectedRoute allowedRoles={['institution', 'admin']}>
            <InstitutionHome />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;