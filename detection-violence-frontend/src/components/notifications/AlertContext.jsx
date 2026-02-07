//components/notifications/AlertContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (alert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

// Hook custom pour utiliser le contexte
export const useAlerts = () => useContext(AlertContext);
