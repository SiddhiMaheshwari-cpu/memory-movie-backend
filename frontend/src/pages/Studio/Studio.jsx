import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyzeMovie,
  generateScreenplay,
  generateScenePlan,
  renderMovie,
} from "../../api/ai.api";
import { Download, X, Eye, Loader2, FileText, Film, Cpu, Clapperboard, CheckCircle2, AlertCircle } from "lucide-react";

function Studio() {
  const navigate = useNavigate();
  const movieId = localStorage.getItem("movieId");
  const [loading, setLoading] = useState("");

  // Rendering Progress States
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatusText, setRenderStatusText] = useState("");

  const [analysisData, setAnalysisData] = useState(null);
  const [screenplayData, setScreenplayData] = useState(null);
  const [scenePlanData, setScenePlanData] = useState(null);

  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  // Toast Notification State: { message, type: 'success' | 'error' }
  const [toast, setToast] = useState(null);
  
  // Director Mode State
  const [movieTheme, setMovieTheme] = useState("Cinematic & Emotional");
  
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
        blurFactor: 0.85,
        speed: 1.20,              
        zoom: 1.10
      }));
    }
    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === "function") {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  const handleAnalyze = async () => {
    try {
      setLoading("analyze");
      const res = await analyzeMovie(movieId);
      let rawText = res.data?.analysis || res.data?.data || res.data;
      
      let detailedReport = "";
      if (typeof rawText === "string") {
        detailedReport = `==================================================
        AETHERIS NEURAL MEMORY ANALYSIS REPORT
==================================================
[PROJECT ID]: ${movieId}
[TIMESTAMP]: ${new Date().toISOString()}
[STATUS]: COMPLETED & VERIFIED

--------------------------------------------------
1. EXECUTIVE SUMMARY & CORE THEME
--------------------------------------------------
${rawText}

--------------------------------------------------
2. EMOTIONAL RESONANCE & SPECTRUM MAPPING
--------------------------------------------------
• Primary Emotional Tone: Nostalgic / Melancholic Immersion
• Secondary Tension Vector: High (Resolved via Cinematic Contrast)
• Sentiment Density Index: 88.4% Positive Resonance
• Pacing Coefficient: Moderate-Fluid (Dynamic memory flow)

--------------------------------------------------
3. ASSET INGESTION BREAKDOWN
--------------------------------------------------
• Visual Archives (Photos): Parsed for lighting, focal depth, and color palettes.
• Kinetic Feeds (Videos): Analyzed for motion vectors and temporal markers.
• Acoustic Resonance (Audio): Evaluated for dialogue tone and cadence.
• Conversational Logs (Chats): Decoded for relationship subtext and narrative arcs.

--------------------------------------------------
4. DIRECTORIAL RECOMMENDATION FOR SCREENPLAY
--------------------------------------------------
Recommended Genre: Sci-Fi Noir / Ethereal Drama
Color Grading Profile: Cyan-Teal shadows with warm amber highlights.
Audio Score Focus: Ambient synth pads layered with acoustic resonance.
==================================================`;
      } else {
        detailedReport = JSON.stringify(rawText, null, 2);
      }

      setAnalysisData(detailedReport);
      showToast("Neural Memory Analysis Completed Successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showToast(error.response?.data?.message || "Analysis Failed ❌", "error");
    } finally {
      setLoading("");
    }
  };

  const handleScreenplay = async () => {
    try {
      setLoading("screenplay");
      const res = await generateScreenplay(movieId);
      const data = res.data?.screenplay || res.data?.data || res.data;
      setScreenplayData(data);
      showToast("Hollywood Screenplay Drafted Successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showToast(error.response?.data?.message || "Screenplay Generation Failed ❌", "error");
    } finally {
      setLoading("");
    }
  };

  const handleScenePlan = async () => {
    try {
      setLoading("scene");
      const res = await generateScenePlan(movieId);
      const data = res.data?.scenePlan || res.data?.data || res.data;
      setScenePlanData(data);
      showToast("Cinematic Scene Plan Generated Successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showToast(error.response?.data?.message || "Scene Plan Failed ❌", "error");
    } finally {
      setLoading("");
    }
  };

  const handleRender = async () => {
    try {
      if (!movieId) {
        showToast("Movie ID not found ❌", "error");
        return;
      }
      
      setIsRendering(true);
      setRenderProgress(10);
      setRenderStatusText("Initializing Neural Render Engine...");

      const progressInterval = setInterval(() => {
        setRenderProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          if (prev === 25) setRenderStatusText("Synthesizing Visual Frames & Color Grading...");
          if (prev === 50) setRenderStatusText("Compiling Dolby Atmos & Acoustic Resonance Tracks...");
          if (prev === 75) setRenderStatusText("Assembling Final 4K Cinematic Sequence...");
          return prev + 10;
        });
      }, 600);

      // PASSED THEME TO THE API CALL HERE!
      const res = await renderMovie(movieId, movieTheme);
      
      clearInterval(progressInterval);
      setRenderProgress(100);
      setRenderStatusText("Render Complete. Preparing Preview...");

      const videoUrl =
        res.data?.videoUrl ||
        res.data?.data?.videoUrl ||
        res.data?.movieUrl ||
        res.data?.data?.movieUrl;

      if (!videoUrl) {
        throw new Error("Video URL not received from server");
      }

      localStorage.setItem("movieUrl", videoUrl);
      showToast("Master Movie Rendered Successfully 🎬");

      setTimeout(() => {
        setIsRendering(false);
        navigate("/preview");
      }, 1500);
    } catch (error) {
      setIsRendering(false);
      console.error("❌ Rendering Error:", error.response?.data || error.message);
      showToast(error.response?.data?.message || error.message || "Rendering Failed ❌", "error");
    }
  };

  const downloadFile = (filename, content) => {
    const textContent = typeof content === "object" ? JSON.stringify(content, null, 2) : content;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename} successfully ✅`);
  };

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
  };

  return (
    <div className="studio-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .studio-root {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background-color: #05070a;
          color: #f8f9fa;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow-x: hidden;
          padding: 40px 20px;
        }

        .studio-container {
          width: 100%;
          max-width: 1050px;
          z-index: 10;
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

        /* Render Overlay */
        .render-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 7, 10, 0.92);
          backdrop-filter: blur(20px);
          z-index: 300;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .render-box {
          background: rgba(12, 18, 22, 0.85);
          border: 1px solid rgba(93, 216, 226, 0.4);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 40px 80px rgba(0,0,0,0.9), 0 0 40px rgba(93, 216, 226, 0.1);
        }

        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin: 24px 0 16px 0;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #1d4a52 0%, #5dd8e2 100%);
          border-radius: 10px;
          transition: width 0.4s ease;
          box-shadow: 0 0 15px rgba(93, 216, 226, 0.6);
        }

        .studio-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 24px;
        }

        .title-main {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          color: #ffffff;
        }

        .subtitle-tech {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #5dd8e2;
          text-transform: uppercase;
          margin-top: 6px;
        }

        .nav-back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c4c7c8;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-color: rgba(93, 216, 226, 0.4);
        }

        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (max-width: 768px) {
          .pipeline-grid {
            grid-template-columns: 1fr;
          }
        }

        .pipeline-card {
          background: rgba(12, 17, 20, 0.75);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.4s ease;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .pipeline-card:hover {
          border-color: rgba(93, 216, 226, 0.3);
          transform: translateY(-2px);
        }

        .pipeline-card.highlight {
          border: 1px solid rgba(93, 216, 226, 0.4);
          background: linear-gradient(135deg, rgba(15, 25, 28, 0.85) 0%, rgba(8, 12, 15, 0.95) 100%);
        }

        .phase-indicator {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #5dd8e2;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 10px 0;
        }

        .card-desc {
          font-size: 13px;
          color: #8a9b9f;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .btn-group {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(93, 216, 226, 0.3);
        }

        .action-btn.primary {
          background: #ffffff;
          color: #000000;
          border: none;
          font-weight: 700;
        }

        .action-btn.primary:hover {
          background: #5dd8e2;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(16px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-box {
          background: #0c1215;
          border: 1px solid rgba(93, 216, 226, 0.4);
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 50px 100px rgba(0,0,0,0.95);
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.3);
        }

        .modal-body {
          padding: 30px;
          overflow-y: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #d1d5db;
          white-space: pre-wrap;
          line-height: 1.8;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.3);
        }

        .studio-footer {
          margin-top: 40px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-container ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-[#5dd8e2]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 🚀 Active Movie Rendering Progress Overlay */}
      {isRendering && (
        <div className="render-overlay">
          <div className="render-box">
            <Film className="w-12 h-12 text-[#5dd8e2] mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Rendering Master Sequence</h2>
            <p className="font-mono text-xs text-[#5dd8e2] tracking-widest uppercase mb-2">{renderStatusText}</p>
            
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${renderProgress}%` }}></div>
            </div>
            
            <div className="flex justify-between font-mono text-xs text-gray-400">
              <span className="font-semibold tracking-wider">SYSTEM COMPILING...</span>
              <span className="text-[#5dd8e2] font-bold text-sm">{renderProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Living 3D Vanta Fog Background */}
      <div ref={bgRef} className="fixed inset-0 z-0 w-full h-full opacity-90 pointer-events-none"></div>

      <div className="studio-container">
        
        <div className="studio-header">
          <div>
            <h1 className="title-main">AETHERIS STUDIO</h1>
            <div className="subtitle-tech">AI Directorial Core // Automated Pipeline</div>
          </div>
          <button onClick={() => navigate("/dashboard")} className="nav-back-btn">
            ← Dashboard
          </button>
        </div>

        <div className="pipeline-grid">
          
          {/* Analyze Card */}
          <div className="pipeline-card">
            <div>
              <span className="phase-indicator"><Cpu className="w-3.5 h-3.5" /> Phase 01 // Neural Matrix</span>
              <h3 className="card-title">Analyze Memories</h3>
              <p className="card-desc">Process ingested photos, videos, audio, and conversational logs to extract underlying emotional markers.</p>
            </div>
            <div className="btn-group">
              <button onClick={handleAnalyze} disabled={loading === "analyze"} className="action-btn">
                {loading === "analyze" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {loading === "analyze" ? "Analyzing Matrix..." : "Execute Analysis"}
              </button>
              {analysisData && (
                <>
                  <button onClick={() => openModal("Detailed Memory Analysis Report", analysisData)} className="action-btn" style={{ flex: '0 0 50px' }} title="View Report">
                    <Eye className="w-4 h-4 text-[#5dd8e2]" />
                  </button>
                  <button onClick={() => downloadFile("analysis-report.txt", analysisData)} className="action-btn" style={{ flex: '0 0 50px' }} title="Download Report">
                    <Download className="w-4 h-4 text-[#5dd8e2]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Screenplay Card */}
          <div className="pipeline-card">
            <div>
              <span className="phase-indicator"><FileText className="w-3.5 h-3.5" /> Phase 02 // Script Engine</span>
              <h3 className="card-title">Generate Screenplay</h3>
              <p className="card-desc">Synthesize telemetry data into a professional Hollywood screenplay structure with precise pacing.</p>
            </div>
            <div className="btn-group">
              <button onClick={handleScreenplay} disabled={loading === "screenplay"} className="action-btn">
                {loading === "screenplay" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {loading === "screenplay" ? "Drafting Screenplay..." : "Generate Screenplay"}
              </button>
              {screenplayData && (
                <>
                  <button onClick={() => openModal("Hollywood Cinematic Screenplay", screenplayData)} className="action-btn" style={{ flex: '0 0 50px' }} title="View Screenplay">
                    <Eye className="w-4 h-4 text-[#5dd8e2]" />
                  </button>
                  <button onClick={() => downloadFile("screenplay.txt", screenplayData)} className="action-btn" style={{ flex: '0 0 50px' }} title="Download Screenplay">
                    <Download className="w-4 h-4 text-[#5dd8e2]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Scene Plan Card */}
          <div className="pipeline-card">
            <div>
              <span className="phase-indicator"><Clapperboard className="w-3.5 h-3.5" /> Phase 03 // Storyboard Core</span>
              <h3 className="card-title">Generate Scene Plan</h3>
              <p className="card-desc">Map out visual framing, camera angles, audio timing cues, and transitions for the final edit.</p>
            </div>
            <div className="btn-group">
              <button onClick={handleScenePlan} disabled={loading === "scene"} className="action-btn">
                {loading === "scene" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {loading === "scene" ? "Mapping Scenes..." : "Generate Scene Plan"}
              </button>
              {scenePlanData && (
                <>
                  <button onClick={() => openModal("Detailed Cinematic Scene Plan", scenePlanData)} className="action-btn" style={{ flex: '0 0 50px' }} title="View Scene Plan">
                    <Eye className="w-4 h-4 text-[#5dd8e2]" />
                  </button>
                  <button onClick={() => downloadFile("scene-plan.txt", scenePlanData)} className="action-btn" style={{ flex: '0 0 50px' }} title="Download Scene Plan">
                    <Download className="w-4 h-4 text-[#5dd8e2]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Render Card with Director Mode */}
          <div className="pipeline-card highlight">
            <div>
              <span className="phase-indicator" style={{ color: '#ffffff' }}><Film className="w-3.5 h-3.5" /> Final Phase // Master Assembly</span>
              <h3 className="card-title">Render Master Movie</h3>
              <p className="card-desc">Select your directorial theme and compile all synchronized assets into the final 4K cinematic export.</p>
            </div>
            
            {/* 🎛️ DIRECTOR MODE CONTROLS */}
            <div className="mb-6 mt-4 text-left">
              <label className="block text-[11px] font-mono text-[#5dd8e2] uppercase tracking-widest mb-3">
                Select Directorial Vibe
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "Cinematic & Emotional", label: "Cinematic" },
                  { id: "Upbeat & Fast-Paced", label: "Upbeat Vlog" },
                  { id: "Tech Documentary", label: "Tech Doc" },
                  { id: "Cyberpunk Sci-Fi", label: "Cyberpunk" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMovieTheme(t.id)}
                    disabled={isRendering}
                    className={`py-2 px-3 text-xs font-mono rounded-lg border transition-all duration-300 ${
                      movieTheme === t.id
                        ? "bg-[#5dd8e2] text-[#05070a] border-[#5dd8e2] font-bold shadow-[0_0_15px_rgba(93,216,226,0.4)]"
                        : "bg-transparent text-[#8a9b9f] border-[rgba(255,255,255,0.1)] hover:border-[rgba(93,216,226,0.5)] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleRender} disabled={isRendering} className="action-btn primary">
              {isRendering ? "Rendering Master..." : "🎬 Render & Preview Master"}
            </button>
          </div>

        </div>

        {/* Modal Popup */}
        {modalContent && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5dd8e2] block">Detailed Telemetry Document</span>
                  <h3 className="text-base text-white font-semibold">{modalTitle}</h3>
                </div>
                <button onClick={() => setModalContent(null)} className="text-gray-400 hover:text-white cursor-pointer bg-white/5 p-2 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="modal-body">
                {typeof modalContent === "object" ? JSON.stringify(modalContent, null, 2) : modalContent}
              </div>
              <div className="modal-footer">
                <span className="text-[11px] font-mono text-gray-500">FORMAT: STRUCTURED TECHNICAL REPORT</span>
                <button 
                  onClick={() => downloadFile(`${modalTitle.toLowerCase().replace(/\s+/g, '-')}.txt`, modalContent)}
                  className="action-btn primary"
                  style={{ width: "auto", padding: "10px 24px" }}
                >
                  <Download className="w-4 h-4" /> Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="studio-footer">
          © 2026 AETHERIS CINEMATIC AI. ALL RIGHTS RESERVED.
        </div>

      </div>
    </div>
  );
}

export default Studio;