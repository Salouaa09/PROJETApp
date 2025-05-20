// src/components/AlertList.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Camera, BrainCircuit, Search, TrendingUp } from 'lucide-react';
import { alerts } from './mockData';

const ITEMS_PER_PAGE = 5;

const statusStyles = {
  non_lue: { text: 'Non lue', color: 'bg-blue-600' },
  en_cours: { text: 'En cours d’analyse', color: 'bg-yellow-500' },
  traite: { text: 'Traité / Archivé', color: 'bg-green-600' },
};

const AlertList = ({ filters = {} }) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filteredAlerts = alerts.filter(alert => {
    const { date, type, camera, severity, keywords } = filters;
    return (
      (!date || alert.datetime.includes(date)) &&
      (!type || alert.type.toLowerCase().includes(type.toLowerCase())) &&
      (!camera || alert.camera.toLowerCase().includes(camera.toLowerCase())) &&
      (!severity || alert.severity?.toLowerCase().includes(severity.toLowerCase())) &&
      (!keywords || alert.summary.toLowerCase().includes(keywords.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAlerts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-gray-700">
      <div className="max-w-5xl mx-auto text-white">

        {/* Header */}
        <div className="flex justify-start items-center mb-6">
          <h1 className="text-3xl font-bold">Liste des alertes détectées</h1>
        </div>

        {/* Liste des alertes */}
        <div className="space-y-4">
          {paginatedAlerts.map(alert => (
            <div key={alert.id} className="bg-gray-900 bg-opacity-50 p-5 rounded-2xl shadow-md border border-gray-700 hover:border-blue-600 transition">
              <div className="flex justify-between items-center">

                {/* Infos alerte */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 text-sm">
                    <Calendar size={16} /> {alert.datetime}
                  </div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Camera size={16} /> {alert.camera}
                  </div>
                  <div className="flex items-center gap-2 text-red-500 font-semibold">
                    <BrainCircuit size={16} /> {alert.type}
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <Search size={16} /> {alert.summary}
                  </div>
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <TrendingUp size={16} /> Confiance : {alert.confidence}%
                  </div>
                </div>

                {/* Statut et bouton */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${statusStyles[alert.status]?.color || 'bg-gray-500'}`}>
                    {statusStyles[alert.status]?.text || 'Statut inconnu'}
                  </span>
                  <button 
                    onClick={() => navigate(`/alert/${alert.id}`)}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-1 transition transform hover:scale-105"
                  >
                    <Eye size={16} /> Voir détails
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-8 text-white">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg disabled:opacity-40 transition"
              disabled={page === 1}
            >
              Précédent
            </button>
            <span>Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg disabled:opacity-40 transition"
              disabled={page === totalPages}
            >
              Suivant
            </button>
          </div>
        )}

      </div>
    </div>
  );
};




export default AlertList;
