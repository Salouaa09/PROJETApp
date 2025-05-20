import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'groupe.pfe.isil@gmail.com' && password === 'groupepfeisil') {
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans text-white">
      {/* ✅ Vidéo de fond */}
      <video
        src="/vid.mp4"
        type="video/mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />
      {/* ✅ Overlay sombre comme Dashboard */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/40" />

      {/* ✅ Contenu principal */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-6">
        {!showForm && (
          <div className="w-full md:w-1/2 px-4 mb-12 md:mb-0">
            <h1 className="text-4xl font-bold mb-4">DVPSystem</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Surveillez, détectez et agissez instantanément contre tout acte de violence,
              grâce au Deep Learning en temps réel.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl text-lg font-semibold transition"
            >
              Connectez-vous pour commencer
            </button>
          </div>
        )}

        {showForm && (
          <div className="w-full md:w-1/3 px-4 animate-fade-in">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Connexion</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
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
                {/* Mot de passe */}
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
                {/* Erreur */}
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                {/* Bouton */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Se connecter
                </button>
                {/* Lien oublié */}
                <div className="text-sm text-center mt-2">
                  <a href="#" className="text-gray-400 hover:text-blue-300">
                    Mot de passe oublié ?
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
