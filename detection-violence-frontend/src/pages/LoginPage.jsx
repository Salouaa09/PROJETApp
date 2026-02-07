import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false); // ← pour le bouton "?"

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ username: email, password }),
      });
      if (!response.ok) throw new Error('Email ou mot de passe incorrect');
      const data = await response.json();
      await login(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans text-white">
      {/* Vidéo de fond */}
      <video
        src="/vid.mp4"
        type="video/mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/40" />

      {/* Citation en haut à gauche */}
      <div className="absolute top-6 left-6 z-20 flex items-start space-x-3 animate-fade-in">
        <span className="text-blue-500 text-2xl">🛡️</span>
        <p className="text-lg italic text-gray-200 leading-snug">
          Toujours présents. Constamment vigilants.
        </p>
      </div>

      {/* Bouton "?" en haut à droite */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center z-20"
        title="À propos"
      >
        ?
      </button>

      {/* Modal d'information */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
          <div className="bg-white text-black p-6 rounded-lg max-w-md w-full relative">
            <h2 className="text-xl font-bold mb-4">À propos de DVPSystem</h2>
            <p className="mb-4">
              DVPSystem est une solution intelligente de surveillance qui détecte en temps réel les actes de violence à partir des flux vidéo.
              Grâce à des technologies avancées et adaptatives, notre système anticipe les défis de sécurité d’aujourd’hui tout en s’adaptant aux besoins de demain.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Contenu central */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-6">
        {!showForm && (
          <div className="w-full md:w-1/2 px-4 mb-12 md:mb-0">
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Surveillez, détectez et agissez instantanément contre tout acte de violence,
              grâce au Deep Learning en temps réel.
            </p>
            <button
  onClick={() => setShowForm(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-xl font-semibold transition transform hover:scale-105 shadow-lg"
>
  Connectez-vous ici
</button>

          </div>
        )}

        {showForm && (
          <div className="w-full md:w-1/3 px-4 animate-fade-in">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Connexion</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Adresse e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mot de passe"
                  />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Se connecter
                </button>
                <div className="text-sm text-center mt-2">
                  <button
                    type="button"
                    onClick={() => alert('Fonction oubliée à implémenter')}
                    className="text-gray-400 hover:text-blue-300 underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-400 z-10">
        © 2025 DVPSystem — Tous droits réservés. <br />
        <a
          href="mailto:devsupport@dvpsystem.com"
          className="text-blue-400 hover:underline"
        >
          Contacter l'équipe de développement
        </a>
      </footer>
    </div>
  );
};

export default LoginPage;
