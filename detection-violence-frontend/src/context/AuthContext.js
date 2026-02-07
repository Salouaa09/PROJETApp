// src/context/AuthContext.js
// src/context/AuthContext.js
import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (token) => {
    try {
      console.log('[AuthContext] Requête à /users/me avec token:', token);
      const response = await fetch('http://localhost:8000/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[AuthContext] Utilisateur récupéré avec succès :', userData);
        setUser({ ...userData, token });
      } else {
        const errorText = await response.text();
        console.error('[AuthContext] Erreur dans /users/me :', response.status, errorText);
        logout();
      }
    } catch (error) {
      console.error('[AuthContext] Exception dans fetchUserData :', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []); // Ajoutez toutes les dépendances nécessaires ici si logout est défini ailleurs

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[AuthContext] Token détecté au démarrage :', token);

    if (token) {
      fetchUserData(token);
    } else {
      console.warn('[AuthContext] Aucun token trouvé');
      setLoading(false);
    }
  }, [fetchUserData]); // Maintenant fetchUserData est inclus dans les dépendances

  const login = async (token) => {
    console.log('[AuthContext] Connexion avec token :', token);
    localStorage.setItem('token', token);
    setLoading(true);
    await fetchUserData(token);
  };

  const logout = () => {
    console.warn('[AuthContext] Déconnexion');
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};