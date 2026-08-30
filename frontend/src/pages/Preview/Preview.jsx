import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Download, Share } from "lucide-react";

function Preview() {
  const navigate = useNavigate();
  const [movieUrl, setMovieUrl] = useState("");

  useEffect(() => {
    const url = localStorage.getItem("movieUrl");
    if (url) {
      setMovieUrl(url);
    }
  }, []);

  if (!movieUrl) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col items-center justify-center p-8">
        <div className="bg-[#201f1f]/60 backdrop-blur-xl border border-white/10 p-10 rounded-2xl max-w-md text-center shadow-2xl">
          <h1 className="font-serif text-3xl font-bold text-white mb-3">Movie Preview</h1>
          <p className="text-[#c4c7c8] text-sm mb-6">Movie render is not available yet or session has expired.</p>
          <button 
            onClick={() => navigate("/studio")}
            className="bg-[#5dd8e2] text-black font-medium px-6 py-3 rounded-lg hover:bg-[#7df4ff] transition-all text-xs uppercase tracking-widest font-mono cursor-pointer"
          >
            Return to Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen selection:bg-[#5dd8e2]/30 selection:text-[#5dd8e2] antialiased overflow-x-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@500&display=swap');

        .glass-panel {
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hairline-border {
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .box-glow-secondary:hover {
          box-shadow: 0 0 30px rgba(93, 216, 226, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-4 bg-[#131313]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_40px_40px_rgba(93,216,226,0.05)]">
        <div className="font-serif text-2xl tracking-tighter text-white uppercase font-bold">Aetheris</div>
        <div className="hidden md:flex gap-8">
          <button onClick={() => navigate("/studio")} className="text-sm text-[#c4c7c8] hover:text-white transition-colors cursor-pointer">Studio</button>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-[#c4c7c8] hover:text-white transition-colors cursor-pointer">Dashboard</button>
          <span className="text-sm text-[#5dd8e2] font-semibold border-b border-[#5dd8e2] pb-1">Gallery Preview</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/logout")}
            className="text-xs font-mono uppercase tracking-widest px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-16 pt-24 md:pt-32 pb-16 flex flex-col gap-12">
        
        {/* Cinematic Video Player Section */}
        <section className="relative w-full aspect-video rounded-xl overflow-hidden glass-panel group shadow-[0_40px_40px_rgba(93,216,226,0.1)] ring-1 ring-white/10 flex items-center justify-center bg-black">
          <video
            src={movieUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </section>

        {/* Movie Details & Actions Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Title & Synopsis */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif text-white mb-3 tracking-tight">Echoes of Neon Rainfall</h1>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#c4c7c8]">
                <span className="px-2.5 py-1 hairline-border rounded bg-white/5">4K HDR</span>
                <span className="px-2.5 py-1 hairline-border rounded bg-white/5">Dolby Atmos</span>
                <span className="px-2.5 py-1 hairline-border rounded bg-white/5">Cinematic Master</span>
                <span className="px-2.5 py-1 bg-[#5dd8e2]/10 text-[#5dd8e2] border border-[#5dd8e2]/30 rounded">AI Generated</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-lg text-base text-[#e5e2e1] leading-relaxed">
              <p>In a sprawling metropolis where the rain never ceases, a synthesized exploration of your core memories comes to life. Featuring reconstructed audio logs, spatial environments, and neural emotional mapping into a visual symphony.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => navigate("/studio")}
                className="flex items-center gap-2 text-sm px-6 py-3 bg-white text-black font-medium rounded hover:bg-[#5dd8e2] transition-all cursor-pointer"
              >
                <Edit className="w-4 h-4" /> Edit in Studio
              </button>

              <a 
                href={movieUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm px-6 py-3 bg-transparent border border-white/20 text-white rounded hover:bg-white/5 transition-all"
              >
                <Download className="w-4 h-4" /> Open / Download (4K)
              </a>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(movieUrl);
                  alert("🔗 Movie URL copied to clipboard!");
                }}
                className="flex items-center gap-2 text-sm px-6 py-3 bg-transparent border border-white/20 text-white rounded hover:bg-white/5 transition-all cursor-pointer"
              >
                <Share className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Right Column: Emotional Analysis & Technical Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Emotional Resonance Card */}
            <div className="glass-panel p-6 rounded-lg box-glow-secondary transition-all duration-300">
              <h3 className="text-sm font-medium text-white uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
                <span className="text-[#5dd8e2]">●</span> Emotional Resonance
              </h3>
              
              <div className="space-y-5 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[#c4c7c8] mb-2">
                    <span>Nostalgic</span>
                    <span className="text-[#5dd8e2]">88%</span>
                  </div>
                  <div className="w-full h-1 bg-[#353534] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5dd8e2] rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#c4c7c8] mb-2">
                    <span>Melancholy</span>
                    <span className="text-[#c6c6c6]">42%</span>
                  </div>
                  <div className="w-full h-1 bg-[#353534] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c6c6c6] rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#c4c7c8] mb-2">
                    <span>Tension / Joy</span>
                    <span className="text-[#ffb4ab]">76%</span>
                  </div>
                  <div className="w-full h-1 bg-[#353534] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ffb4ab] rounded-full" style={{ width: "76%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="glass-panel p-6 rounded-lg">
              <h3 className="text-xs font-mono text-[#c4c7c8] uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Technical Core</h3>
              <ul className="space-y-3 font-mono text-xs text-[#e5e2e1]">
                <li className="flex justify-between"><span className="text-[#c4c7c8]">Seed</span> <span>#0x88F2A1</span></li>
                <li className="flex justify-between"><span className="text-[#c4c7c8]">Model</span> <span>Aetheris Cinema V4</span></li>
                <li className="flex justify-between"><span className="text-[#c4c7c8]">Framerate</span> <span>24fps Cinematic</span></li>
              </ul>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Preview;