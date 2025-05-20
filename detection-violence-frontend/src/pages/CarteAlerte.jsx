import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarteAlerte = () => {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Erreur de chargement des alertes :', error);
    }
  };

  const filteredAlerts = alerts
    .filter((alert) =>
      alert.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.violenceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.dateTime.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.dateTime) - new Date(b.dateTime);
      } else {
        return new Date(b.dateTime) - new Date(a.dateTime);
      }
    });

  return (
    <div className="w-full min-h-screen bg-[#0f172a] p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">📋 Carte des Alertes</h1>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          Retour au Dashboard
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Recherche par caméra, type, date..."
          className="bg-[#1e293b] p-2 rounded-lg w-1/2 border border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-[#1e293b] p-2 rounded-lg border border-gray-600"
        >
          <option value="desc">Plus récent</option>
          <option value="asc">Plus ancien</option>
        </select>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-blue-900">
            <th className="p-2">Date/Heure</th>
            <th className="p-2">Caméra</th>
            <th className="p-2">Type</th>
            <th className="p-2">Confiance (%)</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlerts.map((alert, idx) => (
            <tr key={idx} className="border-t border-blue-800 hover:bg-blue-800/30">
              <td className="p-2">{alert.dateTime}</td>
              <td className="p-2">{alert.cameraName}</td>
              <td className="p-2">{alert.violenceType}</td>
              <td className="p-2">{alert.confidenceScore}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CarteAlerte;
