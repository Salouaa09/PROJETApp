import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function ViewCamsPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const url = params.get('url'); // on passe cam_url

  if (!url) {
    return <p>Pas de vidéo CAM fournie.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button
        className="flex items-center text-gray-300 hover:text-white mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Retour
      </button>
      <h1 className="text-2xl font-bold mb-4">Vidéo de Surveillance Annotée</h1>
      <video
        src={url}
        controls
        className="w-full rounded-xl border-2 border-red-600"
      />
    </div>
  );
}

export default ViewCamsPage;
 