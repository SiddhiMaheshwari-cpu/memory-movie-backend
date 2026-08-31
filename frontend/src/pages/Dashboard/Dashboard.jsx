import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Film, Mic, LayoutDashboard, Settings, Loader2, Sparkles, ChevronRight } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get("/movies");
        setMovies(response.data.movies || []);
      } catch (error) {
        console.log(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTheme.trim()) return;

    try {
      setCreating(true);
      const response = await api.post("/movies", {
        title: newTitle,
        theme: newTheme
      });

      const newMovieId = response.data.movie?._id || response.data._id || response.data.data?._id;
      if (!newMovieId) throw new Error("Backend did not return a movie ID");

      localStorage.setItem("movieId", newMovieId);
      navigate("/upload");
      
    } catch (error) {
      console.log("Error creating movie:", error.response?.data || error.message);
      alert("Failed to initialize project. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const recentMovie = movies.length > 0 ? movies[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-[#5dd8e2] animate-spin" />
      </div>
    );
  }

  // Framer Motion Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }

        body { background-color: #030303; overflow-x: hidden; }
        
        /* Ultra Premium Glass */
        .luxury-glass {
          background: linear-gradient(145deg, rgba(20,20,20,0.6) 0%, rgba(5,5,5,0.8) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* Subtle Animated Gradient Border */
        .animated-border {
          position: relative;
        }
        .animated-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(45deg, transparent, rgba(93, 216, 226, 0.3), transparent);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .animated-border:hover::before { opacity: 1; }

        /* Custom Input styles - Underline only for elegance */
        .elegant-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          padding: 10px 0;
          width: 100%;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .elegant-input:focus {
          outline: none;
          border-bottom: 1px solid #5dd8e2;
          box-shadow: 0 10px 20px -10px rgba(93,216,226,0.2);
        }
        .elegant-input::placeholder { color: rgba(255,255,255,0.15); font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 300; }

        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Floating Light Orbs */
        .ambient-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>

      <div className="bg-[#030303] text-[#e5e2e1] min-h-screen flex font-sans selection:bg-[#5dd8e2]/30 selection:text-[#5dd8e2] relative">
        
        {/* Ambient Dark Cinematic Lighting */}
        <div className="ambient-orb w-[60vw] h-[60vw] top-[-20%] left-[-10%] bg-[#1a363a]/30"></div>
        <div className="ambient-orb w-[50vw] h-[50vw] bottom-[-20%] right-[-10%] bg-[#0f1b1c]/40"></div>

        {/* Minimalist Sidebar */}
        <nav className="w-[100px] hover:w-[280px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#080808]/80 backdrop-blur-3xl border-r border-white/5 fixed left-0 top-0 h-screen z-50 flex flex-col items-start py-10 overflow-hidden group">
          <div className="px-8 w-full flex items-center gap-6 mb-16 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full border border-white/20 shrink-0 relative flex justify-center items-center">
              <div className="w-1 h-1 bg-[#5dd8e2] rounded-full"></div>
            </div>
            <h1 className="font-serif text-xl tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">AETHERIS</h1>
          </div>

          <div className="flex-1 w-full flex flex-col gap-2 px-6">
            <button className="flex items-center gap-6 px-3 py-4 rounded-xl text-white bg-white/5 border border-white/10 w-full transition-all">
              <LayoutDashboard className="w-5 h-5 shrink-0 text-[#5dd8e2]" />
              <span className="font-medium text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Archive</span>
            </button>
            <button className="flex items-center gap-6 px-3 py-4 rounded-xl text-white/40 hover:text-white hover:bg-white/5 w-full transition-all">
              <Film className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Studios</span>
            </button>
            <button className="flex items-center gap-6 px-3 py-4 rounded-xl text-white/40 hover:text-white hover:bg-white/5 w-full transition-all">
              <Mic className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Acoustics</span>
            </button>
          </div>

          <div className="mt-auto w-full px-6">
            <button className="flex items-center gap-6 px-3 py-4 rounded-xl text-white/40 hover:text-white hover:bg-white/5 w-full transition-all">
              <Settings className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Settings</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 ml-[100px] p-8 md:p-16 relative z-10 max-w-[1600px] mx-auto w-full">
          
          <motion.header initial="hidden" animate="visible" variants={fadeUp} className="mb-20 flex justify-between items-end">
            <div>
              <p className="font-mono text-[#5dd8e2] text-[10px] tracking-[0.3em] uppercase mb-4">Director's Cut</p>
              <h2 className="font-serif text-5xl md:text-[64px] text-white tracking-tight leading-none">Cinematic Archive</h2>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Recent Premiere & Gallery */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Grand Hero Card */}
              <motion.section initial="hidden" animate="visible" variants={fadeUp}>
                <div className="luxury-glass rounded-[32px] overflow-hidden relative group cursor-pointer h-[500px]">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1600" 
                      alt="Recent Premiere" 
                      className="w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-[1.5s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
                  </div>
                  
                  <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="font-mono text-[10px] text-black bg-[#5dd8e2] px-3 py-1 uppercase tracking-widest rounded-sm font-semibold">Latest Render</span>
                    </div>
                    <h3 className="font-serif text-4xl md:text-5xl text-white mb-3">
                      {recentMovie ? recentMovie.title : "Echoes of the Unknown"}
                    </h3>
                    <div className="flex items-center gap-4 text-white/50 font-mono text-[11px] uppercase tracking-widest mb-8">
                      <span>4K Resolution</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>{recentMovie?.theme || "Atmospheric"}</span>
                    </div>
                    
                    {/* YAHAN VISUAL DIAGNOSTIC BUTTON LAGAYA HAI */}
                    {recentMovie && recentMovie.movieUrl ? (
                      <a 
                        href={recentMovie.movieUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="backdrop-blur-md bg-white/10 border border-white/20 text-white font-medium px-8 py-3 rounded-full flex items-center gap-3 w-max hover:bg-white hover:text-black transition-all duration-300"
                      >
                        <Play className="w-4 h-4 fill-current" /> Play Masterpiece 🚀
                      </a>
                    ) : (
                      <button 
                        onClick={() => alert("Movie abhi process ho rahi hai ya URL backend se nahi aaya! Thodi der mein refresh karein.")}
                        className="backdrop-blur-md bg-white/10 border border-white/20 text-white/70 font-medium px-8 py-3 rounded-full flex items-center gap-3 w-max hover:bg-white/20 transition-all duration-300 cursor-help"
                      >
                        <Play className="w-4 h-4 fill-current opacity-50" /> Movie Loading... ⏳
                      </button>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* Film Strip Gallery */}
              <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-sans text-sm text-white/60 uppercase tracking-[0.2em]">Project Library</h4>
                </div>
                
                <div className="flex overflow-x-auto gap-6 pb-8 hide-scroll" ref={scrollRef}>
                  {movies.length === 0 ? (
                    <p className="text-white/40 font-serif italic text-lg">No cinematic projects initialized yet.</p>
                  ) : (
                    movies.map((movie, idx) => (
                      <div key={movie._id || idx} className="luxury-glass rounded-[20px] min-w-[280px] h-[380px] relative group cursor-pointer overflow-hidden animated-border">
                        <img 
                          src={`https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600&random=${idx}`} 
                          alt="Poster" 
                          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-70 transition-all duration-[1s]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                          <h5 className="font-serif text-2xl text-white mb-1 leading-tight">{movie.title || "Untitled"}</h5>
                          <span className="font-mono text-[9px] text-[#5dd8e2] uppercase tracking-[0.2em]">{movie.theme || "Cinematic"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>
            </div>

            {/* Right Column: Interaction Form */}
            <div className="lg:col-span-4 h-full">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="sticky top-10">
                
                <AnimatePresence mode="wait">
                  {!showForm ? (
                    <motion.div 
                      key="button"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setShowForm(true)}
                      className="luxury-glass rounded-[32px] h-[500px] flex flex-col items-center justify-center p-10 text-center cursor-pointer group hover:border-[#5dd8e2]/30 transition-all duration-500 animated-border"
                    >
                      <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:bg-[#5dd8e2]/10 transition-colors">
                        <Plus className="w-8 h-8 text-white/50 group-hover:text-[#5dd8e2] transition-colors" />
                      </div>
                      <h4 className="font-serif text-3xl text-white mb-4">New Project</h4>
                      <p className="text-white/40 font-light text-sm max-w-[200px] leading-relaxed">Initialize a new canvas to synthesize your memories into cinema.</p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleCreateMovie} 
                      className="luxury-glass rounded-[32px] h-[500px] p-10 flex flex-col relative overflow-hidden"
                    >
                      {/* Top elegant line */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#5dd8e2] to-transparent opacity-50"></div>
                      
                      <div className="flex items-center gap-3 mb-10">
                        <Sparkles className="w-5 h-5 text-[#5dd8e2]" />
                        <h3 className="font-sans text-xs tracking-[0.2em] text-white/60 uppercase">Initialize Sequence</h3>
                      </div>
                      
                      <div className="mb-10">
                        <label className="block text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase mb-2">Project Title</label>
                        <input 
                          type="text" 
                          placeholder="The Summer House"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="elegant-input"
                          required
                          autoFocus
                        />
                      </div>
                      
                      <div className="mb-auto">
                        <label className="block text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase mb-2">Cinematic Direction</label>
                        <input 
                          type="text" 
                          placeholder="Neo-Noir, Nostalgic..."
                          value={newTheme}
                          onChange={(e) => setNewTheme(e.target.value)}
                          className="elegant-input"
                          required
                        />
                      </div>
                      
                      <div className="flex items-center gap-4 mt-8">
                        <button
                          type="submit"
                          disabled={creating}
                          className={`flex-1 py-4 rounded-full text-sm font-medium tracking-wide transition-all flex justify-center items-center gap-2 ${creating ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                        >
                          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Synthesize"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all shrink-0"
                        >
                          <Plus className="w-5 h-5 rotate-45" />
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
                
              </motion.div>
            </div>
            
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;