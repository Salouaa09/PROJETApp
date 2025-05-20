// TestVideoPage.jsx
import React, { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const models = [
  { key: 'i3d_two_streams', label: 'I3D Two-Streams' },
  { key: 'i3d', label: 'I3D' },
  { key: 'cnn_lstm', label: 'CNN-LSTM' },
];

function TestVideoPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [annotatedVideoPath, setAnnotatedVideoPath] = useState('');

  const handleCardClick = (model) => {
    setSelectedModel(model);
    resetVideo();
  };

  const resetVideo = () => {
    setFile(null);
    setVideoURL('');
    setFilename('');
    setResults([]);
    setAnnotatedVideoPath('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const vid = e.target.files[0];
    if (vid) {
      setFile(vid);
      setVideoURL(URL.createObjectURL(vid));
      setFilename(vid.name);
      setResults([]);
      setAnnotatedVideoPath('');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !selectedModel) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', selectedModel);
    try {
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      let out = [];
      if (selectedModel === 'i3d_two_streams') {
        out = Array.isArray(data.predictions) ? data.predictions : [];
        if (data.annotated_video_path) {
          setAnnotatedVideoPath(`http://localhost:8000/static/${data.annotated_video_path.split('/').pop()}`);
        } else {
          setAnnotatedVideoPath('');
        }
      } else {
        const { filename: name, probability, is_violent } = data;
        out = [
          `Nom du fichier: ${name}`,
          `Probabilité: ${(probability * 100).toFixed(1)} %`,
          is_violent ? 'Violence détectée' : 'Aucune violence détectée',
        ];
        setAnnotatedVideoPath('');
      }
      setResults(out);
    } catch (err) {
      console.error(err);
      setResults(['Une erreur est survenue lors de l\'analyse.']);
      setAnnotatedVideoPath('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-950 text-white font-sans overflow-hidden">
      <img
        src="/images/dashboard-background.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/40 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col min-h-screen p-6">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Tester une Vidéo</h1>

        {!selectedModel ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {models.map((m) => (
              <div
                key={m.key}
                className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-600/30 cursor-pointer hover:scale-105 transition-all"
                onClick={() => handleCardClick(m.key)}
              >
                <h3 className="text-xl font-semibold text-blue-300 text-center">{m.label}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Modèle : <span className="text-blue-400">{models.find(m => m.key === selectedModel)?.label}</span>
              </h2>
              <button
                onClick={() => {
                  setSelectedModel(null);
                  resetVideo();
                }}
                className="text-sm text-gray-300 hover:text-sky-400 transition"
              >
                ← Choisir un autre modèle
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-600/30 space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
                >
                  {filename ? 'Changer de vidéo' : 'Choisir une vidéo'}
                </button>
                {filename && <span className="ml-4 text-gray-300">{filename}</span>}
              </div>

              {videoURL && (
                <video src={videoURL} controls className="w-full max-h-64 rounded-xl" />
              )}

              <button
                className={`w-full px-4 py-2 rounded-xl ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} text-white transition`}
                onClick={handleAnalyze}
                disabled={loading || !file}
              >
                {loading ? 'Analyse en cours...' : 'Analyser'}
              </button>

              {file && (
                <button
                  onClick={resetVideo}
                  className="mt-4 w-full px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white transition"
                >
                  Choisir une autre vidéo
                </button>
              )}

              {results.length > 0 && (
                <div className="mt-4 bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-600/30 animate-fade-in">
                  <h4 className="text-2xl font-extrabold mb-4 text-white">Résultats :</h4>
                  <ul className="space-y-4">
                    {selectedModel === 'i3d_two_streams'
                      ? results.map((line, idx) => {
                          const match = line.match(/\[(.*?)\]\s+score\s*:\s*([\d.]+)\s+Etat\s*:\s*(.*)/i);
                          if (!match) return null;
                          const interval = match[1];
                          const rawScore = parseFloat(match[2]);
                          const score = `${(rawScore * 100).toFixed(1)} %`;
                          const state = match[3].trim();
                          return (
                            <li key={idx} className="flex justify-between items-center text-lg font-medium text-white border-b border-white/10 pb-2">
                              <span className="text-blue-300">[{interval}]</span>
                              <span>{score}</span>
                              <span className={`font-bold ${state.includes('Violence') ? 'text-red-400' : 'text-green-400'}`}>{state}</span>
                            </li>
                          );
                        })
                      : results.map((line, idx) => (
                          <li key={idx} className="text-lg font-medium text-white border-b border-white/10 pb-2">
                            {line}
                          </li>
                        ))}
                  </ul>
                </div>
              )}

              {annotatedVideoPath && (
                <button
                  onClick={() => window.open(annotatedVideoPath, '_blank')}
                  className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition font-bold"
                >
                  Voir mes cams
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex justify-center py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-sky-400 transition"
          >
            <ArrowLeft size={18} />
            <span>Retour au Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestVideoPage;
