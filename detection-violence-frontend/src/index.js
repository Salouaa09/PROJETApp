// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind ici
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './components/notifications/AlertContext'; // ✅ Import du AlertProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>          {/* ✅ AuthProvider en premier */}
        <AlertProvider>       {/* ✅ AlertProvider à l'intérieur */}
          <App />
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
