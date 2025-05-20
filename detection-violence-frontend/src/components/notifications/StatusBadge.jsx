import React from 'react';

const statusStyles = {
  non_lue: 'bg-blue-600 text-white',
  en_cours: 'bg-yellow-400 text-black',
  traite: 'bg-green-600 text-white',
};

const statusLabels = {
  non_lue: '🆕 Non lue',
  en_cours: '🟡 En cours d’analyse',
  traite: '✅ Traité',
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status]}`}>
      {statusLabels[status] || 'Inconnu'}
    </span>
  );
};

export default StatusBadge;
