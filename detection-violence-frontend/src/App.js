// src/App.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './pages/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CamerasPage from './pages/CamerasPage';
import TestVideoPage from './pages/TestVideoPage';
import NotificationsPage from './pages/NotificationsPage';
import HistoriquePage from './pages/HistoriquePage';
import CarteAlerte from './pages/CarteAlerte';
import ViewCamsPage from './pages/ViewCamsPage';
import Settings from './pages/admin/Settings';
import AddUser from './pages/admin/AddUser';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Layout commun (ex: navbar, sidebar, etc.)
const Layout = () => (
  <div className="min-h-screen bg-gray-100 text-gray-900">
    {/* Tu peux ajouter ici ta Navbar ou Sidebar */}
    <Outlet />
  </div>
);



const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Pages privées protégées avec layout */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={
              <ProtectedRoute requiredRole="admin">
               <Settings />
              </ProtectedRoute>
            } />
            <Route
             path="/admin/add-user"
             element={
               <ProtectedRoute adminOnly={true}>
               <AddUser />
               </ProtectedRoute>
               }
/>
          <Route
            path="/cameras"
            element={
              <ProtectedRoute>
                <CamerasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-video"
            element={
              <ProtectedRoute>
                <TestVideoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-video/:modelId"
            element={
              <ProtectedRoute>
                <TestVideoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historique"
            element={
              <ProtectedRoute>
                <HistoriquePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carte-alerte"
            element={
              <ProtectedRoute>
                <CarteAlerte />
              </ProtectedRoute>
            }
          />
          <Route 
          path="/admin/settings" 
         element={
          <ProtectedRoute adminOnly={true}>
          <Settings />
          </ProtectedRoute>
          }
        />
          <Route
            path="/view-cams"
            element={
              <ProtectedRoute>
                <ViewCamsPage />
              </ProtectedRoute>
            }
          />
        
        </Route>
       
        {/* Optionnel: rediriger les routes inconnues vers login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  
  );
 
};

export default App;
