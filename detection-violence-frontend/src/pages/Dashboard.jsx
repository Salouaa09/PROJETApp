 import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Camera, Video, Bell, AlertTriangle, History, Settings } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden font-sans">

      {/* Image de fond */}
      <img 
        src="/images/dashboard-background.jpg" 
        alt="Surveillance Background" 
        className="absolute inset-0 w-full h-full object-cover brightness-75 pointer-events-none" 
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/40"></div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">

        {/* Titre */}
        <h1 className="text-4xl font-bold text-white mb-2">DVPSystem</h1>
        <p className="text-lg text-gray-300 mb-10 text-center">
          Bienvenue dans le système de détection de violence en temps réel
        </p>

        {/* Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {dashboardItems.map(item => (
            <DashboardCard 
              key={item.title}
              to={item.to}
              title={item.title}
              subtitle={item.subtitle}
              Icon={item.icon}
            />
          ))}
        </div>

        {/* Déconnexion */}
        <Link to="/login" className="mt-12 flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition">
  <LogOut size={18} className="text-gray-400 group-hover:text-sky-400" />
  <span>Déconnexion</span>
</Link>

      </div>
    </div>
  );
};

const dashboardItems = [
  { to: "/cameras", title: "Tester video en direct ", subtitle: "Comparer les performances des modéles L' IA sur des flux vidéo en direct ", icon: Camera },
  { to: "/test-video", title: "Tester une vidéo enregistrée ", subtitle: "Comparer les performances des modéles L' IA sur des vidéo enregistrée ", icon: Video },
  { to: "/notifications", title: "Recherche et filtrage ", subtitle: "Rechercher et affiner les resultats selon vos critères ", icon: Bell },
  { to: "/alerts", title: "Alertes", subtitle: "Afficher les événements détectés", icon: AlertTriangle },
  { to: "/history", title: "Stockage et Sauvgarde ", subtitle: "Archiver les vidéos pour un accés au long terme ", icon: History },
  { to: "/settings", title: "Paramètres", subtitle: "Superviser la gestion des utilisateurs", icon: Settings },
];

const DashboardCard = ({ to, title, subtitle, Icon }) => (
  <Link 
    to={to}
    className="flex flex-col justify-center items-start gap-4 bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg hover:shadow-2xl border border-gray-700"
  >
    <Icon size={32} className="text-blue-400" />
    <div>
      <h2 className="text-xl font-semibold text-blue-300">{title}</h2>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  </Link>
);

export default Dashboard;