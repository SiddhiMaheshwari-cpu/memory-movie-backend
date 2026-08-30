import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Image, Film, Mic, MessageSquare, ArrowRight, Loader2, CheckCircle2, UploadCloud, AlertCircle } from "lucide-react";

function Upload() {
  const navigate = useNavigate();
  const movieId = localStorage.getItem("movieId");

  const [file, setFile] = useState([]);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState([]);
  const [chat, setChat] = useState([]);

  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [vantaEffect, setVantaEffect] = useState(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && window.VANTA && bgRef.current) {
      setVantaEffect(window.VANTA.FOG({
        el: bgRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0x1d4a52,
        midtoneColor: 0x0a1517,
        lowlightColor: 0x000000,
        baseColor: 0x05070a,
        blurFactor: 0.90,
        speed: 1.00,
        zoom: 1.20
      }));
    }
    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === "function") {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  const goToStudio = () => {
    navigate("/studio");
  };

  const isMovieValid = () => {
    if (!movieId || movieId === "null" || movieId === "undefined") {
      showToast("Movie ID is missing! Please go back and create a movie first. ❌", "error");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!isMovieValid()) return;
    if (!file || file.length === 0) { 
      showToast("Please select a photo first ⚠️", "error"); 
      return; 
    }
    try {
      setLoadingPhoto(true);
      const formData = new FormData();
      for (const f of file) formData.append("file", f);
      formData.append("description", "Memory Photo");
      formData.append("emotion", "Happy");
      await api.post(`/movies/${movieId}/photos`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Photos Ingested Successfully ✅");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload photos ❌", "error");
    } finally { 
      setLoadingPhoto(false); 
    }
  };

  const handleVideoUpload = async () => {
    if (!isMovieValid()) return;
    if (!video || video.length === 0) { 
      showToast("Select videos first ⚠️", "error"); 
      return; 
    }
    try {
      setLoadingVideo(true);
      const formData = new FormData();
      for (const v of video) formData.append("file", v);
      formData.append("description", "Memory Video");
      formData.append("emotion", "Happy");
      await api.post(`/movies/${movieId}/videos`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Videos Ingested Successfully ✅");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload videos ❌", "error");
    } finally { 
      setLoadingVideo(false); 
    }
  };

  const uploadAudio = async () => {
    if (!isMovieValid()) return;
    if (!audio || audio.length === 0) { 
      showToast("Select audio file first ⚠️", "error"); 
      return; 
    }
    try {
      setLoadingAudio(true);
      const data = new FormData();
      for (const a of audio) data.append("file", a);
      data.append("transcript", "Voice Memory");
      await api.post(`/movies/${movieId}/audio`, data, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Audio Streams Ingested Successfully ✅");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload audio ❌", "error");
    } finally { 
      setLoadingAudio(false); 
    }
  };

  const uploadChat = async () => {
    if (!isMovieValid()) return;
    if (!chat || chat.length === 0) { 
      showToast("Select chat screenshots first ⚠️", "error"); 
      return; 
    }
    try {
      setLoadingChat(true);
      const data = new FormData();
      for (const c of chat) data.append("file", c);
      data.append("description", "WhatsApp Chat");
      await api.post(`/movies/${movieId}/chat-screenshots`, data, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Chat Logs Ingested Successfully ✅");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload chats ❌", "error");
    } finally { 
      setLoadingChat(false); 
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        body {
          margin: 0;
          padding: 0;
          background-color: #05070a;
          color: #f8f9fa;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* Toast Notification Styling */
        .toast-container {
          position: fixed;
          top: 30px;
          right: 30px;
          z-index: 200;
          background: rgba(15, 23, 27, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(93, 216, 226, 0.4);
          color: #ffffff;
          padding: 14px 22px;
          border-radius: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }

        .toast-container.error {
          border-color: rgba(255, 100, 100, 0.5);
          background: rgba(25, 12, 12, 0.9);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .console-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 50px 24px;
        }

        .console-header {
          text-align: center;
          z-index: 10;
          margin-bottom: 40px;
          max-width: 700px;
        }

        .console-title {
          font-family: 'Playfair Display', serif;
          font-size: 40px;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin: 0 0 12px 0;
          color: #ffffff;
        }

        .console-subtitle {
          color: #718387;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          line-height: 1.6;
        }

        .modules-grid {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
          margin-bottom: 35px;
        }

        @media (max-width: 768px) {
          .modules-grid {
            grid-template-columns: 1fr;
          }
        }

        .module-card {
          background: linear-gradient(145deg, rgba(12, 18, 20, 0.8) 0%, rgba(5, 9, 10, 0.95) 100%);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.7);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.3s ease;
        }

        .module-card:hover {
          border-color: rgba(93, 216, 226, 0.25);
        }

        .module-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .module-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .module-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(93, 216, 226, 0.08);
          border: 1px solid rgba(93, 216, 226, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5dd8e2;
        }

        .module-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
          color: #ffffff;
          margin: 0;
        }

        .module-status {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #718387;
        }

        .module-desc {
          color: #8a9b9f;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .module-action-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .file-select-wrapper {
          flex: 1;
          position: relative;
          background: rgba(0, 0, 0, 0.3);
          border: 1px dashed rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .file-select-wrapper:hover {
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(93, 216, 226, 0.4);
        }

        .file-select-wrapper input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .file-placeholder {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn {
          background-color: #f8f9fa;
          color: #081012;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .upload-btn:hover {
          background-color: #e2e8f0;
        }

        .control-bar {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(145deg, rgba(12, 18, 20, 0.8) 0%, rgba(5, 9, 10, 0.95) 100%);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 20px 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }

        .control-info {
          font-size: 12px;
          color: #718387;
          letter-spacing: 0.1em;
          font-weight: 300;
          text-transform: uppercase;
        }

        .proceed-btn {
          background: #ffffff;
          color: #000000;
          font-size: 14px;
          font-weight: 500;
          padding: 14px 28px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .proceed-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-container ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-[#5dd8e2]" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="console-container">
        
        {/* Living 3D Fog Background */}
        <div ref={bgRef} className="fixed inset-0 z-0 w-full h-full opacity-90"></div>

        <div className="console-header">
          <h1 className="console-title">Production Ingestion Console</h1>
          <p className="console-subtitle">Feed your visual, kinetic, acoustic, and textual memory assets to the Aetheris AI engine.</p>
        </div>

        {/* 2x2 Grid of Production Modules */}
        <div className="modules-grid">
          
          {/* Module 1: Photos */}
          <div className="module-card">
            <div>
              <div className="module-top">
                <div className="module-title-group">
                  <div className="module-icon-box"><Image className="w-5 h-5" /></div>
                  <h3 className="module-name">Visual Archives</h3>
                </div>
                <span className="module-status">{file.length > 0 ? `${file.length} selected` : 'Ready'}</span>
              </div>
              <p className="module-desc">Upload core reference photography streams to establish aesthetic mapping.</p>
            </div>

            <div className="module-action-row">
              <div className="file-select-wrapper">
                <span className="file-placeholder">
                  <UploadCloud className="w-4 h-4 text-[#5dd8e2]" />
                  {file.length > 0 ? `${file.length} file(s) attached` : 'Choose photos...'}
                </span>
                <input type="file" accept="image/*" multiple onChange={(e) => setFile(Array.from(e.target.files))} />
              </div>
              <button type="button" onClick={handleUpload} className="upload-btn">
                {loadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
              </button>
            </div>
          </div>

          {/* Module 2: Videos */}
          <div className="module-card">
            <div>
              <div className="module-top">
                <div className="module-title-group">
                  <div className="module-icon-box"><Film className="w-5 h-5" /></div>
                  <h3 className="module-name">Kinetic Feeds</h3>
                </div>
                <span className="module-status">{video.length > 0 ? `${video.length} selected` : 'Ready'}</span>
              </div>
              <p className="module-desc">Upload temporal video recordings to extract motion anchors and sequence flow.</p>
            </div>

            <div className="module-action-row">
              <div className="file-select-wrapper">
                <span className="file-placeholder">
                  <UploadCloud className="w-4 h-4 text-[#5dd8e2]" />
                  {video.length > 0 ? `${video.length} file(s) attached` : 'Choose videos...'}
                </span>
                <input type="file" accept="video/*" multiple onChange={(e) => setVideo(Array.from(e.target.files))} />
              </div>
              <button type="button" onClick={handleVideoUpload} className="upload-btn">
                {loadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
              </button>
            </div>
          </div>

          {/* Module 3: Audio */}
          <div className="module-card">
            <div>
              <div className="module-top">
                <div className="module-title-group">
                  <div className="module-icon-box"><Mic className="w-5 h-5" /></div>
                  <h3 className="module-name">Acoustic Resonance</h3>
                </div>
                <span className="module-status">{audio.length > 0 ? `${audio.length} selected` : 'Ready'}</span>
              </div>
              <p className="module-desc">Upload voice notes or atmosphere audio to set score cadence and tone.</p>
            </div>

            <div className="module-action-row">
              <div className="file-select-wrapper">
                <span className="file-placeholder">
                  <UploadCloud className="w-4 h-4 text-[#5dd8e2]" />
                  {audio.length > 0 ? `${audio.length} file(s) attached` : 'Choose audio...'}
                </span>
                <input type="file" accept="audio/*" multiple onChange={(e) => setAudio(Array.from(e.target.files))} />
              </div>
              <button type="button" onClick={uploadAudio} className="upload-btn">
                {loadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
              </button>
            </div>
          </div>

          {/* Module 4: Chats */}
          <div className="module-card">
            <div>
              <div className="module-top">
                <div className="module-title-group">
                  <div className="module-icon-box"><MessageSquare className="w-5 h-5" /></div>
                  <h3 className="module-name">Conversational Logs</h3>
                </div>
                <span className="module-status">{chat.length > 0 ? `${chat.length} selected` : 'Ready'}</span>
              </div>
              <p className="module-desc">Upload chat screenshots to extract emotional dialogues and story arcs.</p>
            </div>

            <div className="module-action-row">
              <div className="file-select-wrapper">
                <span className="file-placeholder">
                  <UploadCloud className="w-4 h-4 text-[#5dd8e2]" />
                  {chat.length > 0 ? `${chat.length} file(s) attached` : 'Choose chats...'}
                </span>
                <input type="file" accept="image/*" multiple onChange={(e) => setChat(Array.from(e.target.files))} />
              </div>
              <button type="button" onClick={uploadChat} className="upload-btn">
                {loadingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
              </button>
            </div>
          </div>

        </div>

        {/* Master Control Bar */}
        <div className="control-bar">
          <span className="control-info">All assets synchronized with active project partition</span>
          <button type="button" onClick={goToStudio} className="proceed-btn">
            Proceed to AI Studio <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </>
  );
}

export default Upload;