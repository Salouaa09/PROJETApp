import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CamerasPage from './pages/CamerasPage';
import TestVideoPage from './pages/TestVideoPage';
import NotificationsPage from './pages/NotificationsPage';
import HistoriquePage from './pages/HistoriquePage';
import AdminDashboard from './pages/AdminDashboard';
import CarteAlerte from './pages/CarteAlerte';
import ViewCamsPage from './pages/ViewCamsPage';  // Pour la page Voir CAMs
// Optional: layout wrapper (navbar/sidebar, etc.)
const Layout = () => (
  <div className="min-h-screen bg-gray-100 text-gray-900">
    {/* Tu peux ajouter une Navbar ici si tu veux */}
    <Outlet />
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Toutes les pages principales avec layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cameras" element={<CamerasPage />} />
        <Route path="/test-video" element={<TestVideoPage />} />
        <Route path="/test-video/:modelId" element={<TestVideoPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/history" element={<HistoriquePage />} />
        <Route path="/carte-alerte" element={<CarteAlerte />} />
        <Route path="/admin" element={<AdminDashboard />} />
         <Route path="/view-cams" element={<ViewCamsPage />} />  {/* Route nouvelle page CAMs */}
      </Route>
    </Routes>
  );
};

export default App;
