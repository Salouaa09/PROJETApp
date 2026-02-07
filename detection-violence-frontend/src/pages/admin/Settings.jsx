import React, { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/admin/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    })
      .then(async (res) => {
        if (res.status === 403) {
          const data = await res.json();
          setError(data.detail || "Accès interdit.");
          return;
        }
        if (!res.ok) throw new Error("Une erreur est survenue");
        const data = await res.json();
        setUsers(data);
      })
      .catch(err => {
        setError(err.message || "Erreur réseau");
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (res.status === 204) {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success("Utilisateur supprimé avec succès");
      } else if (res.status === 404) {
        toast.error("Utilisateur introuvable");
      } else {
        toast.error("Échec de la suppression");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <h1 className="text-3xl font-bold text-blue-300 mb-6">Gestion des utilisateurs</h1>

      {error ? (
        <div className="bg-red-800 text-red-100 p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div key={user.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow hover:shadow-lg transition">
                <h2 className="text-lg font-semibold text-white">{user.email}</h2>
                <p className="text-sm text-gray-400">Rôle : {user.role}</p>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowConfirmModal(true);
                  }}
                  className="mt-4 flex items-center gap-2 text-red-400 hover:text-red-500 text-sm"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="/admin/add-user"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
            >
              <Plus size={18} /> Ajouter un utilisateur
            </a>
          </div>
        </>
      )}

      {/* Retour au dashboard */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-sky-400" />
          <span>Retour au dashboard</span>
        </Link>
      </div>

      {/* Modale de confirmation */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-sm w-full text-center">
            <h2 className="text-xl text-white font-semibold mb-4">Confirmer la suppression</h2>
            <p className="text-gray-300 mb-6">
              Voulez-vous vraiment supprimer l’utilisateur <strong>{selectedUser.email}</strong> ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await handleDelete(selectedUser.id);
                  setShowConfirmModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
