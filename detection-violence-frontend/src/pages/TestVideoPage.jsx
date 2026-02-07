// TestVideoPage.jsx
import React, { useState, useRef } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const models = [
  { 
    key: 'i3d_two_streams', 
    label: 'I3D Two-Streams',
    description: 'Modèle avancé analysant à la fois les apparences spatiales et le flux optique pour une détection précise de violence dans les vidéos.'
  },
  { 
    key: 'i3d', 
    label: 'I3D',
    description: 'Version classique analysant les volumes 3D pour détecter les comportements violents dans les séquences vidéo.'
  },
  { 
    key: 'cnn_lstm', 
    label: 'CNN-LSTM',
    description: 'Combine réseaux de neurones convolutifs et mémoires à long terme pour analyser les séquences temporelles de violence.'
  },
];

function TestVideoPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [annotatedVideoPath, setAnnotatedVideoPath] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const handleCardClick = (model) => {
    setSelectedModel(model);
    resetVideo();
  };

  const resetVideo = () => {
    setFile(null);
    setVideoURL('');
    setFilename('');
    setResults(null);
    setAnnotatedVideoPath('');
    setDownloadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const vid = e.target.files[0];
    if (vid) {
      setFile(vid);
      setVideoURL(URL.createObjectURL(vid));
      setFilename(vid.name);
      setResults(null);
      setAnnotatedVideoPath('');
      setDownloadProgress(0);
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
      
      let predictions = [];
      if (selectedModel === 'i3d_two_streams') {
        if (Array.isArray(data.predictions)) {
          predictions = data.predictions.map(pred => {
            const match = pred.match(/\[(.*?)\]\s+score\s*:\s*([\d.]+)\s+Etat\s*:\s*(.*)/i);
            return match ? {
              interval: match[1],
              score: (parseFloat(match[2]) * 100).toFixed(1),
              state: match[3].trim()
            } : null;
          }).filter(Boolean);
        }
        if (data.annotated_video_path) {
          setAnnotatedVideoPath(`http://localhost:8000${data.annotated_video_path}`);
        }
      } else {
        predictions = [{
          score: (data.probability * 100).toFixed(1),
          state: data.is_violent ? 'Violence détectée' : 'Aucune violence'
        }];
      }
      
      setResults({
        filename: filename,
        predictions: predictions,
        model: selectedModel
      });
      
      if (selectedModel !== 'i3d_two_streams') setAnnotatedVideoPath('');
    } catch (err) {
      console.error(err);
      setResults({
        filename: filename,
        error: 'Une erreur est survenue lors de l\'analyse.'
      });
      setAnnotatedVideoPath('');
    } finally {
      setLoading(false);
    }
  };

  // Téléchargement avec progression
  async function downloadAnnotatedVideo() {
    try {
      setDownloadProgress(0);
      const resp = await fetch(annotatedVideoPath);
      if (!resp.ok) throw new Error('Erreur réseau');
      const contentLength = resp.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : null;
      const reader = resp.body.getReader();
      let received = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) {
          setDownloadProgress((received / total) * 100);
        }
      }
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const parts = annotatedVideoPath.split('/');
      const filename = parts[parts.length - 1];
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadProgress(100);
    } catch (err) {
      console.error('Erreur téléchargement', err);
      setDownloadProgress(0);
    }
  }

  const renderResults = () => {
    if (!results) return null;
    
    return (
      <div className="mt-4 bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-600/30 animate-fade-in">
        <h4 className="text-2xl font-extrabold mb-4 text-white">Résultats :</h4>
        <div className="text-lg font-medium text-blue-300 mb-4">
          Nom fichier: {results.filename}
        </div>
        
        {results.error ? (
          <div className="text-lg font-medium text-white">
            {results.error}
          </div>
        ) : (
          <div className="bg-white/5 p-4 rounded-lg">
            {results.model === 'i3d_two_streams' ? (
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-blue-300">Intervalles analysés:</h5>
                <div className="grid grid-cols-3 gap-2 mb-2 font-medium text-blue-300">
                  <span>Intervalle</span>
                  <span className="text-center">Score</span>
                  <span className="text-right">État</span>
                </div>
                {results.predictions.map((pred, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                    <span>{pred.interval}</span>
                    <span className="text-center">{pred.score}%</span>
                    <span className={`text-right font-bold ${
                      pred.state.includes('Violence') ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {pred.state}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-300">Score:</span>
                  <span>{results.predictions[0].score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">État:</span>
                  <span className={`font-bold ${
                    results.predictions[0].state.includes('Violence') ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {results.predictions[0].state}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tester une Vidéo</h1>
          <p className="text-gray-300 mt-2 mx-auto max-w-2xl">
            Analysez vos vidéos pour détecter automatiquement les comportements violents 
            en sélectionnant l'un de nos modèles spécialisés ci-dessous.
          </p>
          <div className="relative inline-block mt-4">
            <button 
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
              className="text-gray-400 hover:text-blue-400 transition"
            >
              <HelpCircle size={24} />
            </button>
            {showHelp && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 p-4 rounded-lg shadow-xl z-50">
                <p className="text-sm text-white">
                  Cette page permet d'analyser des vidéos pour détecter des scènes de violence.
                  Sélectionnez un modèle, chargez une vidéo et cliquez sur "Analyser".
                  Les résultats apparaîtront avec les scores de détection.
                </p>
              </div>
            )}
          </div>
        </div>

        {!selectedModel ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full">
              {models.map((m) => (
                <div
                  key={m.key}
                  className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-600/30 cursor-pointer hover:scale-105 transition-all flex flex-col items-center text-center h-full"
                  onClick={() => handleCardClick(m.key)}
                >
                  <div className="bg-blue-900/30 rounded-full p-4 mb-4">
                    <span className="text-xl font-semibold">{m.label.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">{m.label}</h3>
                  <p className="text-gray-300 text-sm flex-grow">{m.description}</p>
                </div>
              ))}
            </div>
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

              {renderResults()}

              {annotatedVideoPath && (
                <div className="mt-6 space-y-2">
                  <button
                    onClick={downloadAnnotatedVideo}
                    disabled={downloadProgress > 0 && downloadProgress < 100}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition font-bold text-center disabled:opacity-50"
                  >
                    {downloadProgress > 0 && downloadProgress < 100
                      ? `Téléchargement : ${downloadProgress.toFixed(0)}%`
                      : '📥 Télécharger la vidéo annotée'}
                  </button>
                  <p className="text-sm text-gray-300 text-center italic">
                    Ouvrez le fichier téléchargé pour le lire dans votre lecteur vidéo (VLC, etc.)
                  </p>
                </div>
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
