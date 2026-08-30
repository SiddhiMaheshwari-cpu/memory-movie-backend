import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, LogIn } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function SignOut() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // 3D Background State for Living Animation
  const [vantaEffect, setVantaEffect] = useState(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && window.VANTA) {
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
      if (vantaEffect) vantaEffect.destroy();
    }
  }, [vantaEffect]);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Backend logout API call (clears cookies / tokens on server)
        await api.post("/auth/logout");
      } catch (error) {
        console.log("Logout API error:", error.response?.data || error.message);
      } finally {
        // Clear local storage and state
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("movieId");

        if (logout) {
          logout();
        }
      }
    };

    performLogout();
  }, [logout]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          background-color: #05070a;
          overflow: hidden;
        }

        .terminal-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .title-aetheris {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0 0 6px 0;
          text-shadow: 0 10px 30px rgba(0,0,0,0.9);
          z-index: 10;
        }

        .subtitle-technical {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #ffb4ab; /* Amber/Red tint for termination state */
          text-transform: uppercase;
          margin: 0 0 35px 0;
          z-index: 10;
          text-shadow: 0 0 10px rgba(255,180,171,0.3);
        }

        .glass-terminal-box {
          position: relative;
          z-index: 10;
          background: rgba(15, 22, 26, 0.6);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 45px 40px;
          width: 100%;
          max-width: 440px;
          text-align: center;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .terminate-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #c4c7c8;
          letter-spacing: 0.1em;
          margin-top: 16px;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .btn-primary {
          width: 100%;
          background: #ffffff;
          color: #000000;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 16px;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #e0e0e0;
          box-shadow: 0 0 20px rgba(255,255,255,0.4);
        }

        .global-footer {
          position: absolute;
          bottom: 20px;
          z-index: 10;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
        }
      `}</style>

      <div className="terminal-container">
        
        {/* Living 3D Fog Background */}
        <div ref={bgRef} className="fixed inset-0 z-0 w-full h-full opacity-90"></div>

        {/* Header */}
        <h1 className="title-aetheris">AETHERIS</h1>
        <p className="subtitle-technical">Terminal Session Terminated</p>

        {/* The Glass Terminal Box */}
        <div className="glass-terminal-box">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-10 h-10 text-[#ffb4ab]" />
          </div>
          
          <p className="terminate-text">
            Security tokens successfully purged. Your studio session has been securely closed.
          </p>

          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            <LogIn className="w-4 h-4" /> Re-Authenticate
          </button>
        </div>

        <div className="global-footer">
          © 2026 AETHERIS CINEMATIC AI. SYSTEM OFFLINE.
        </div>

      </div>
    </>
  );
}

export default SignOut;