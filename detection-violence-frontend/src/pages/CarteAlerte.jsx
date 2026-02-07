import React from "react";
import { useAlerts } from'../components/notifications/AlertContext';

const CarteAlerte = () => {
  const { alerts } = useAlerts();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6">Historique des alertes de violence</h2>
      {alerts.length === 0 && (
        <p className="text-gray-400">Aucune alerte détectée pour l'instant.</p>
      )}

      <ul className="space-y-4 max-w-3xl mx-auto">
        {alerts.map(({ id, date, camera, score, message }) => (
          <li
            key={id}
            className="flex items-center justify-between bg-gray-800 rounded-lg p-4 shadow-md"
          >
            <div>
              <p className="font-semibold">{message}</p>
              <p className="text-sm text-gray-300">
                {camera} — {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-red-600 font-bold text-white text-sm">
              {`Score: ${(score * 100).toFixed(2)}%`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarteAlerte;
