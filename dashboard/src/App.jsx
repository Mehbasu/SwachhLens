import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import ComplaintsList from './pages/ComplaintsList';
import ComplaintDetail from './pages/ComplaintDetail';
import Analytics from './pages/Analytics';
import GetStartedPage from './pages/GetStartedPage';

// Simple Auth Protection Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('swachhlens_auth_token');
  
  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('swachhlens_auth_token');
      localStorage.removeItem('swachhlens_role');
      return <Navigate to="/welcome" replace />;
    }
  } catch (e) {
    localStorage.removeItem('swachhlens_auth_token');
    localStorage.removeItem('swachhlens_role');
    return <Navigate to="/welcome" replace />;
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
