//ViewCamsPage.js
import React, { useState } from 'react';

export default function VoirCamsPage() {
  const [videoURL, setVideoURL] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateVideo = async () => {
    setLoading(true);
    try {
      // 1. Appeler l'API pour générer la vidéo annotée
      const res = await fetch('http://localhost:8000/annotated_videos/', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.annotated_video_path) {
        // 2. Mettre à jour l'URL (le backend doit retourner par ex: "/annotated/video.mp4")
        setVideoURL(`http://localhost:8000${data.annotated_video_path}`);
      } else {
        alert('Aucune vidéo générée');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Voir Caméras (I3D Two-Streams)</h1>

      <button
        onClick={handleGenerateVideo}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl mb-6"
        disabled={loading}
      >
        {loading ? 'Génération en cours...' : 'Voir cams'}
      </button>

      {videoURL && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Vidéo annotée :</h2>
          <video src={videoURL} controls className="w-full max-h-[500px] rounded-xl shadow" />
        </div>
      )}
    </div>
  );
}