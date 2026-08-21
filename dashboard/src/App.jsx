import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import ComplaintsList from './pages/ComplaintsList';
import ComplaintDetail from './pages/ComplaintDetail';
import Analytics from './pages/Analytics';
import GetStartedPage from './pages/GetStartedPage';
import LocationSetupPage from './pages/LocationSetupPage';

// Simple Auth Protection Guard
function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('swachhlens_auth_token');
  
  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  const state = localStorage.getItem('swachhlens_state');
  const district = localStorage.getItem('swachhlens_district');

  // If no state or district, force them to setup location
  if ((!state || !district) && location.pathname !== '/setup-location') {
      return <Navigate to="/setup-location" replace />;
  }

  // If they already have jurisdiction, don't let them access setup-location again
  if (state && district && location.pathname === '/setup-location') {
      return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<GetStartedPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route 
          path="/setup-location" 
          element={
            <ProtectedRoute>
              <LocationSetupPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
