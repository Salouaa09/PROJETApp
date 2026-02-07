//CameraPages.jsx 
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const CamerasPage = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const intervalRef = useRef(null);

  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (error) {
        console.error("Erreur lors de l'activation de la caméra :", error);
      }
    } else {
      streamRef.current?.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
      setAlertVisible(false);
    }
  };

  useEffect(() => {
    if (!isCameraOn) return;

    const recordAndSend = () => {
      recordedChunksRef.current = [];
      const stream = videoRef.current.srcObject;
      if (!stream) return;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const formData = new FormData();
        formData.append("file", blob, "clip.webm");
        formData.append("model", "i3d_two_streams");

        try {
          const res = await fetch("http://localhost:8000/predict", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          const violenceDetected = data.predictions.some(pred =>
            pred.toLowerCase().includes("violence")
          );

          setAlertVisible(violenceDetected);

          if (violenceDetected) {
            setTimeout(() => setAlertVisible(false), 5000);
          }
        } catch (e) {
          console.error("Erreur analyse vidéo :", e);
        }
      };

      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000);
    };

    recordAndSend();

    intervalRef.current = setInterval(recordAndSend, 6000);

    return () => {
      clearInterval(intervalRef.current);
      mediaRecorderRef.current?.stop();
    };
  }, [isCameraOn]);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden font-sans">

      {/* Image de fond */}
      <img 
        src="/images/dashboard-background.jpg" 
        alt="Surveillance Background" 
        className="absolute inset-0 w-full h-full object-cover brightness-75 pointer-events-none" 
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/40"></div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">

        {/* Titre */}
        <div className="flex flex-col items-center mt-4">
          <h1 className="text-3xl font-bold text-white">Flux caméra en direct</h1>

          {/* Description + tooltip */}
          <div className="flex items-center gap-2 mt-4 max-w-2xl text-center">
            <p className="text-gray-300 text-sm md:text-base">
              Cette page vous permet d’activer votre caméra en direct afin d’observer et analyser les flux en temps réel.
            </p>
            <div className="relative group cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                ?
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-gray-800 text-gray-100 text-xs p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Cette interface permet d’activer ou de désactiver votre caméra pour visualiser le flux vidéo en temps réel. Les flux peuvent ensuite être analysés pour détecter la violence.
              </div>
            </div>
          </div>
        </div>

        {/* Alerte Violence détectée */}
        {alertVisible && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg z-50">
            Violence detected !
          </div>
        )}

        {/* Vidéo */}
        <div className="flex justify-center mt-8">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-xl rounded-xl shadow-lg border border-gray-700"
          />
        </div>

        {/* Bouton caméra */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleToggleCamera}
            className={`px-6 py-2 rounded-xl font-semibold text-white transition ${
              isCameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCameraOn ? 'Désactiver ma caméra' : 'Activer ma caméra'}
          </button>
        </div>

        {/* Lien retour dashboard */}
        <div className="mt-auto flex justify-center pt-10">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-sky-400" />
            <span>Retour au Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};


export default CamerasPage;