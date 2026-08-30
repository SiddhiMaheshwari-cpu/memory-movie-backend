import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Shield, Loader2 } from "lucide-react";

import { loginUser } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
        highlightColor: 0x1d4a52, /* Deep glowing teal */
        midtoneColor: 0x0a1517,   /* Dark cinematic moody shade */
        lowlightColor: 0x000000,
        baseColor: 0x05070a,      /* Deep terminal black */
        blurFactor: 0.85,
        speed: 1.20,              /* Smooth living movement */
        zoom: 1.10
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    }
  }, [vantaEffect]);

  const [formData, setFormData] = useState({
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
      const response = await loginUser(formData);
      console.log("✅ Backend Response:", response.data);

      login(
        response.data.user,
        response.data.accessToken
      );

      navigate("/dashboard");

    } catch (error) {
      console.log("❌ Login Error:", error.response?.data || error.message);
      alert("Authentication failed. Please verify credentials.");
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

        /* Typography matching screenshot 1 */
        .title-aetheris {
          font-family: 'Playfair Display', serif;
          font-size: 64px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0 0 8px 0;
          text-shadow: 0 10px 30px rgba(0,0,0,0.9);
          z-index: 10;
        }

        .subtitle-technical {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #5dd8e2;
          text-transform: uppercase;
          margin: 0 0 40px 0;
          z-index: 10;
          text-shadow: 0 0 10px rgba(93,216,226,0.3);
        }

        /* Glass Form Box matching screenshot 1 */
        .glass-terminal-box {
          position: relative;
          z-index: 10;
          background: rgba(15, 22, 26, 0.55);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 50px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* Input Rows */
        .input-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .input-icon {
          color: #718387;
          flex-shrink: 0;
        }

        .solid-white-input {
          flex: 1;
          background: #ffffff;
          color: #000000;
          border: none;
          padding: 14px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          border-radius: 2px;
          transition: box-shadow 0.3s ease;
        }

        .solid-white-input:focus {
          box-shadow: 0 0 15px rgba(93,216,226,0.5);
        }

        .solid-white-input::placeholder {
          color: #a0a0a0;
          font-weight: 400;
        }

        .forgot-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #5dd8e2;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          text-align: right;
          margin-top: -12px;
          margin-bottom: 8px;
        }

        /* Buttons */
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

        .btn-secondary {
          width: 100%;
          background: transparent;
          color: #718387;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          color: #ffffff;
          border-color: rgba(93, 216, 226, 0.4);
          background: rgba(93, 216, 226, 0.05);
        }

        /* Footer */
        .terminal-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 30px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #4a5a5e;
          text-transform: uppercase;
          letter-spacing: 0.1em;
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
        
        {/* 🔴 THE LIVING 3D FOG BACKGROUND 🔴 */}
        <div ref={bgRef} className="fixed inset-0 z-0 w-full h-full opacity-90"></div>

        {/* Header matching screenshot 1 */}
        <h1 className="title-aetheris">AETHERIS</h1>
        <p className="subtitle-technical">Secure Access Terminal</p>

        {/* The Glass Terminal Box */}
        <div className="glass-terminal-box">
          <form onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className="input-row">
              <Mail className="w-5 h-5 input-icon" strokeWidth={1.5} />
              <input
                type="email"
                name="email"
                placeholder=""
                value={formData.email}
                onChange={handleChange}
                className="solid-white-input"
                required
              />
            </div>

            {/* Forgot Link */}
            <a href="#" className="forgot-link">Forgot?</a>

            {/* Password Input */}
            <div className="input-row">
              <Lock className="w-5 h-5 input-icon" strokeWidth={1.5} />
              <input
                type="password"
                name="password"
                placeholder=""
                value={formData.password}
                onChange={handleChange}
                className="solid-white-input"
                required
              />
            </div>

            {/* Initialize Session Button */}
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating</>
              ) : (
                "Initialize Session"
              )}
            </button>

            {/* Request Clearance Button (Navigates to Register/Signup) */}
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/signup')}
            >
              Request Clearance
            </button>

            {/* Form Footer */}
            <div className="terminal-footer">
              <Shield className="w-3 h-3" />
              <span>End-to-End Encrypted Session</span>
            </div>

          </form>
        </div>

        {/* Global Footer */}
        <div className="global-footer">
          © 2026 AETHERIS CINEMATIC AI. SYSTEM READY.
        </div>

      </div>
    </>
  );
}

export default Login;