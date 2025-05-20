import React, { useEffect } from 'react';

const AlertDynamicFilters = ({ filters, setFilters }) => {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [filters]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-[#0f172a] text-white p-4 rounded-xl mb-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-md">
      {/* ⏱️ Période */}
      <div className="flex items-center gap-2">
        <i data-lucide="calendar-range" className="w-5 h-5 text-blue-400"></i>
        <select name="periode" onChange={handleChange} value={filters.periode} className="bg-[#1e293b] text-sm rounded-lg p-2 border border-gray-600">
          <option value="">Toute période</option>
          <option value="today">Aujourd’hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois-ci</option>
          <option value="custom">Plage personnalisée</option>
        </select>
      </div>

      {/* 🎥 Caméra */}
      <div className="flex items-center gap-2">
        <i data-lucide="video" className="w-5 h-5 text-blue-400"></i>
        <input
          name="camera"
          type="text"
          value={filters.camera}
          onChange={handleChange}
          placeholder="Caméra"
          className="bg-[#1e293b] text-sm p-2 rounded-lg border border-gray-600 placeholder-gray-400"
        />
      </div>

      {/* ⚠️ Gravité */}
      <div className="flex items-center gap-2">
        <i data-lucide="alert-triangle" className="w-5 h-5 text-yellow-400"></i>
        <select name="severity" onChange={handleChange} value={filters.severity} className="bg-[#1e293b] text-sm rounded-lg p-2 border border-gray-600">
          <option value="">Gravité</option>
          <option value="Critique">Critique</option>
          <option value="Élevée">Élevée</option>
          <option value="Modérée">Modérée</option>
          <option value="Faible">Faible</option>
        </select>
      </div>

      {/* ✅ État */}
      <div className="flex items-center gap-2">
        <i data-lucide="check-circle" className="w-5 h-5 text-green-400"></i>
        <select name="status" onChange={handleChange} value={filters.status} className="bg-[#1e293b] text-sm rounded-lg p-2 border border-gray-600">
          <option value="">État</option>
          <option value="traite">Traité</option>
          <option value="non-traite">Non traité</option>
        </select>
      </div>
    </div>
  );
};

export default AlertDynamicFilters;
