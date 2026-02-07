import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const AddUser = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l’ajout de l’utilisateur');
      }
      alert('Utilisateur ajouté avec succès');
      setTimeout(() => {
        navigate('/admin/settings');
      }, 100);
      
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l’ajout');
    }
  };


  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 text-center">
          Ajouter un utilisateur
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="ex: user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Mot de passe</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Utilisateur standard</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition-all"
          > <LogOut size={18} className="text-gray-400 group-hover:text-sky-400" />
            <span>Ajouter</span>
          </button>
          {/* Lien retour au admin */}
          <div className="mt-8 flex justify-center">
                 <Link
                 to="/settings"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition"
                 >
             <span>Retour</span>
            </Link>
        </div>
        </form>

      </div>
    </div>
    
  );
};

export default AddUser;
