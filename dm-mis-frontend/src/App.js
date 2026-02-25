import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import VillageOfficerDashboard from './pages/VillageOfficerDashboard';
import GenericDashboard from './pages/GenericDashboard';
import HomePage from './pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/village-dashboard"
            element={
              <ProtectedRoute allowedRoles={['VILLAGE_OFFICER']}>
                <VillageOfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generic-dashboard"
            element={
              <ProtectedRoute allowedRoles={['STATE_OFFICER', 'DISTRICT_OFFICER', 'TALUKA_OFFICER']}>
                <GenericDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<h1>403 - Access Denied</h1>} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;