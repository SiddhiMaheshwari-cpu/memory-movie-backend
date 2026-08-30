import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { registerUser } from "../../api/auth.api";

function Register() {
  const navigate = useNavigate();

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await registerUser(formData);
      console.log("✅ Registration Success:", response.data);
      navigate("/login");
    } catch (error) {
      console.log("❌ Registration Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          color: #5dd8e2;
          text-transform: uppercase;
          margin: 0 0 35px 0;
          z-index: 10;
          text-shadow: 0 0 10px rgba(93,216,226,0.3);
        }

        .glass-terminal-box {
          position: relative;
          z-index: 10;
          background: rgba(15, 22, 26, 0.6);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .input-group-col {
          margin-bottom: 20px;
          text-align: left;
        }

        .input-label-meta {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #718387;
          margin-bottom: 6px;
        }

        .solid-white-input {
          width: 100%;
          background: #ffffff;
          color: #000000;
          border: none;
          padding: 13px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          border-radius: 2px;
          box-sizing: border-box;
          transition: box-shadow 0.3s ease;
        }

        .solid-white-input:focus {
          box-shadow: 0 0 15px rgba(93,216,226,0.5);
        }

        .solid-white-input::placeholder {
          color: #a0a0a0;
          font-weight: 400;
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
          margin-top: 10px;
          margin-bottom: 16px;
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

        .btn-primary:disabled {
          background: #a0a0a0;
          cursor: not-allowed;
        }

        .auth-switch {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #718387;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 20px;
        }

        .auth-switch span {
          color: #5dd8e2;
          cursor: pointer;
          font-weight: 700;
        }

        .auth-switch span:hover {
          text-decoration: underline;
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
        <p className="subtitle-technical">Production Setup • Clearance Onboarding</p>

        {/* The Glass Terminal Box */}
        <div className="glass-terminal-box">
          <form onSubmit={handleSubmit}>
            
            <div className="input-group-col">
              <label className="input-label-meta">Operator Name</label>
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className="solid-white-input"
                required
              />
            </div>

            <div className="input-group-col">
              <label className="input-label-meta">Credential ID (Email)</label>
              <input
                type="email"
                name="email"
                placeholder="director@studio.com"
                value={formData.email}
                onChange={handleChange}
                className="solid-white-input"
                required
              />
            </div>

            <div className="input-group-col">
              <label className="input-label-meta">Access Code (Password)</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="solid-white-input"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Initializing...</>
              ) : (
                "Initialize Sequence"
              )}
            </button>

            <div className="auth-switch">
              Already commissioned? <span onClick={() => navigate('/login')}>Authenticate →</span>
            </div>

          </form>
        </div>

        <div className="global-footer">
          © 2026 AETHERIS CINEMATIC AI. SYSTEM READY.
        </div>

      </div>
    </>
  );
}

export default Register;