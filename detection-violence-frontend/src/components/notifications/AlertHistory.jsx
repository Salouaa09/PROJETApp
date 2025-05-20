// src/components/AlertHistory.jsx

import React, { useState } from 'react';

// Données fictives temporaires
const alerts = [
  {
    id: 1,
    dateTime: '2025-03-01 14:22',
    cameraName: 'Caméra Entrée',
    violenceType: 'Physique',
    summary: 'Une bagarre détectée à l’entrée principale.',
  },
  {
    id: 2,
    dateTime: '2025-03-05 18:40',
    cameraName: 'Caméra Parking',
    violenceType: 'Physique',
    summary: 'Comportement suspect détecté dans le parking.',
  },
  {
    id: 3,
    dateTime: '2025-04-10 11:05',
    cameraName: 'Caméra Hall',
    violenceType: 'Physique',
    summary: 'Altercation verbale détectée dans le hall.',
  },
];

const AlertHistory = () => {
  const [view, setView] = useState('timeline'); // 'timeline' ou 'table'
  const [period, setPeriod] = useState('year'); // 'year', 'month', 'week'

  const filteredAlerts = alerts; // Plus tard : filtrer selon la période

  return (
    <div className="bg-[#0f172a] p-6 rounded-2xl shadow-2xl backdrop-blur-md border border-blue-600/30 min-h-[80vh]">
      <div className="max-w-5xl mx-auto text-white">

        {/* En-tête avec filtres */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            📁 <span>Historique des Alertes</span>
          </h2>

          <div className="flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-[#1e293b] p-2 rounded-lg border border-gray-600 text-white"
            >
              <option value="year">Par Année</option>
              <option value="month">Par Mois</option>
              <option value="week">Par Semaine</option>
            </select>

            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="bg-[#1e293b] p-2 rounded-lg border border-gray-600 text-white"
            >
              <option value="timeline">Timeline</option>
              <option value="table">Tableau</option>
            </select>
          </div>
        </div>

        {/* Vue Timeline */}
        {view === 'timeline' ? (
          <div className="space-y-6">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="relative pl-8 border-l-4 border-blue-700 group">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-2 top-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-gray-400">{alert.dateTime}</p>
                <p className="text-lg font-semibold text-blue-300 mt-1">{alert.cameraName}</p>
                <p className="text-sm text-blue-100 mt-1">{alert.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          // Vue Tableau
          <div className="overflow-x-auto">
            <table className="w-full mt-6 table-auto border-collapse">
              <thead>
                <tr className="bg-blue-900 text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Caméra</th>
                  <th className="p-3">Type de violence</th>
                  <th className="p-3">Résumé</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.id} className="border-t border-blue-800 hover:bg-blue-800/30 transition">
                    <td className="p-3">{alert.dateTime}</td>
                    <td className="p-3">{alert.cameraName}</td>
                    <td className="p-3">{alert.violenceType}</td>
                    <td className="p-3">{alert.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AlertHistory;
