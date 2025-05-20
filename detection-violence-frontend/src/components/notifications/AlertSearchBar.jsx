// src/components/AlertSearchBar.jsx
import React from 'react';
import { Search, Calendar, Camera, AlarmClock, FileSearch, Type } from 'lucide-react';

const AlertSearchBar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const inputClass =
    "bg-[#1e293b] text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 w-full";

  return (
    <div
      className="bg-[#0f172a] p-6 rounded-2xl shadow-2xl text-white space-y-6 backdrop-blur-md"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-400" />
        Recherche Avancée
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="type"
            value={filters.type}
            onChange={handleChange}
            placeholder="Type de violence"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="camera"
            value={filters.camera}
            onChange={handleChange}
            placeholder="Nom de la caméra"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <AlarmClock className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="severity"
            value={filters.severity}
            onChange={handleChange}
            placeholder="Gravité"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <FileSearch className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="keywords"
            value={filters.keywords}
            onChange={handleChange}
            placeholder="Mots-clés"
            className={inputClass}
          />
        </div>
      </div>

    </div>
  );
};

export default AlertSearchBar;
