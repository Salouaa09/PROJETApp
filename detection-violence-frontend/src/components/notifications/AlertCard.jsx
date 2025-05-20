// src/components/notifications/AlertCard.jsx
import React from 'react';
import StatusBadge from './StatusBadge';

const AlertCard = ({ alert }) => {
  return (
    <div className="bg-blue-950/50 backdrop-blur-md p-4 rounded-2xl shadow-lg text-white border border-blue-900 hover:scale-[1.01] transition-transform">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-bold text-blue-300">{alert.cameraName}</h2>
          <span className="text-sm text-blue-400 block">{alert.dateTime}</span>
        </div>
        <StatusBadge status={alert.status} />
      </div>

      <p className="text-sm text-blue-200">🧠 Violence : <strong>{alert.violenceType}</strong></p>
      <p className="text-sm text-blue-200">📈 Score : <strong>{alert.confidence}%</strong></p>
      <p className="text-blue-100 mt-2">{alert.summary}</p>

      <button className="mt-4 text-blue-300 hover:text-white font-semibold underline">
        Voir détails
      </button>
    </div>
  );
};

export default AlertCard;





