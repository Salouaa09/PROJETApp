import React from 'react';
import { useNavigate } from 'react-router-dom';
import AlertHistory from '../components/notifications/AlertHistory';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const HistoriquePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gray-950 text-white font-sans overflow-hidden">

      {/* 🖼 Image de fond avec effet "verre dépoli" */}
      <img
        src="/images/dashboard-background.jpg"
        alt="Historique Background"
        className="absolute inset-0 w-full h-full object-cover brightness-75 pointer-events-none"
      />

      {/* 🎭 Overlay avec effet de flou */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/30 backdrop-blur-sm" />

      {/* 💬 Contenu principal */}
      <div className="relative z-10 flex flex-col min-h-screen p-8 animate-fade-in-up">

        {/* 🛟 Bouton d'aide */}
        <div className="absolute top-6 right-6 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700/40 hover:bg-gray-600/40 transition cursor-pointer border border-gray-600 shadow-lg relative backdrop-blur">
            <HelpCircle size={20} className="text-sky-400" />
            <div className="absolute top-full mt-2 right-0 w-64 text-sm text-gray-100 bg-gray-900/90 border border-gray-700 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Cette page affiche l'historique complet des alertes détectées par le système.
            </div>
          </div>
        </div>

        {/*  Titre */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-3">Historique des Alertes</h1>
          <p className="text-gray-300 text-base">
            Consultez l'ensemble des événements passés détectés par notre système pour analyser les tendances et comportements suspects.
          </p>
        </div>

        {/*  Contenu stylé avec effet de flou et fond semi-transparent */}
        <div className="flex-grow">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-600/30 transition-all duration-300">
            <AlertHistory />
          </div>
        </div>

        {/* 🔙 Bouton retour */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-sky-400 transition"
          >
            <ArrowLeft size={18} />
            <span>Retour au Dashboard</span>
          </button>
        </div>
      </div>

      {/* ✨ Animation d'apparition */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HistoriquePage;
