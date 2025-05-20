import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertList from '../components/notifications/AlertList';
import AlertSearchBar from '../components/notifications/AlertSearchBar';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const NotificationsPage = () => {
  const [filters, setFilters] = useState({
    date: '',
    type: '',
    camera: '',
    severity: '',
    keywords: '',
  });

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden font-sans">

      {/* Image de fond */}
      <img 
        src="/images/dashboard-background.jpg" 
        alt="Notifications Background" 
        className="absolute inset-0 w-full h-full object-cover brightness-75 pointer-events-none" 
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col min-h-screen p-8">

        {/* Aide en haut à droite */}
        <div className="absolute top-6 right-6 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition cursor-pointer border border-gray-600 shadow-lg relative">
            <HelpCircle size={20} className="text-sky-400" />
            {/* Tooltip */}
            <div className="absolute top-full mt-2 right-0 w-64 text-sm text-gray-200 bg-gray-900 border border-gray-700 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Cette page vous permet de consulter, rechercher et filtrer les dernières alertes de détection de violence générées par le système.
            </div>
          </div>
        </div>

        {/* Titre et intro */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-3">Notifications</h1>
          <p className="text-gray-300 text-base">
            Consultez et analysez les dernières alertes enregistrées par notre système de surveillance intelligent. Utilisez les filtres pour affiner votre recherche selon vos besoins.
          </p>
        </div>

        {/* Zone de recherche */}
        <div className="flex-grow">
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-md p-6 transition-all duration-300">
            <AlertSearchBar filters={filters} setFilters={setFilters} />
          </div>

          {/* Liste des alertes */}
          <div className="mt-8">
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 rounded-2xl shadow-md p-6 transition-all duration-300">
              <AlertList filters={filters} />
            </div>
          </div>
        </div>

        {/* Bouton de retour */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition"
          >
            <ArrowLeft size={18} className="text-gray-400 hover:text-sky-400" />
            <span>Retour au Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
