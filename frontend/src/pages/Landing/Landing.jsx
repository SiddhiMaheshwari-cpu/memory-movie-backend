import React, { useState, useEffect, useRef } from 'react';
import { CloudUpload, Cpu, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/hero";
import "./Landing.css";

function Landing() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // 3D LIVING BACKGROUND (Untouched)
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
        baseColor: 0x05090a,      
        blurFactor: 0.90,         
        speed: 1.00,              
        zoom: 1.20
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    }
  }, [vantaEffect]);

  const archiveMovies = [
    {
      id: 1,
      title: "The Summer of '98",
      genre: "Documentary Short",
      details: "Rendered in 4K • Nostalgic Grade",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "First Steps",
      genre: "Family Chronicle",
      details: "Rendered in 1080p • Warm Contrast Grade",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Midnight in Kyoto",
      genre: "Travelogue",
      details: "Rendered in 4K • Neo-Noir Grade",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop"
    }
  ];

  // Animation configuration for scroll reveal
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* THE LIVING 3D FOG BACKGROUND */}
      <div ref={bgRef} className="fixed inset-0 z-0 w-full h-full opacity-90"></div>

      <Navbar />

      <main className="relative z-10 flex flex-col w-full">
        <Hero />

        {/* The Alchemical Process */}
        <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16 drop-shadow-lg"
          >
            <h2 className="font-serif text-4xl md:text-[44px] text-[#f8f9fa] mb-4">The Alchemical Process</h2>
            <p className="text-[#94a3a8] text-[16px]">Three steps to elevate raw moments into a cohesive cinematic narrative.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {[
              { icon: CloudUpload, title: "1. Upload Fragments", desc: "Gather your scattered photos, raw video clips, and voice notes. The raw material of your life." },
              { icon: Cpu, title: "2. AI Weaves Narrative", desc: "Our emotional AI analyzes pacing, color palette, and audio sentiment to construct a compelling timeline." },
              { icon: Film, title: "3. Your Premiere", desc: "Receive a masterfully graded, scored, and edited short film ready for the big screen." }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }} // Staggered delay
                whileHover={{ y: -5, borderColor: "rgba(93, 216, 226, 0.4)", boxShadow: "0 15px 30px rgba(0,0,0,0.5)" }}
                className="bg-[#0b1012]/80 backdrop-blur-xl p-8 rounded-[24px] border border-white/5 transition-colors cursor-default"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[#0c1214] border border-[#1e3d42]/30 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(93,216,226,0.1)]">
                  <step.icon className="w-5 h-5 text-[#5dd8e2]" />
                </div>
                <h3 className="font-serif text-[24px] text-white mb-4">{step.title}</h3>
                <p className="text-[#718387] text-[15px] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}

          </div>
        </section>

        {/* The Archive */}
        <section className="pt-16 pb-32 max-w-[1300px] mx-auto w-full">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="px-6 md:px-0 mb-12 drop-shadow-lg"
          >
            <h2 className="font-serif text-4xl md:text-[44px] text-white mb-3">The Archive</h2>
            <p className="text-[#94a3a8] text-[16px]">Explore cinematic memories rendered by Aetheris.</p>
          </motion.div>

          <div className="flex gap-6 px-6 md:px-0 overflow-x-auto snap-x hide-scrollbar">
            {archiveMovies.map((movie, index) => (
              <motion.div 
                key={movie.id} 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className="min-w-[320px] md:min-w-[400px] h-[540px] relative rounded-[28px] overflow-hidden snap-center border border-white/5 shadow-2xl group cursor-pointer"
              >
                <img src={movie.image} alt={movie.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
                
                {/* Overlay brightens slightly on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05090a] via-[#05090a]/50 to-transparent group-hover:via-[#05090a]/30 transition-colors duration-700"></div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full z-10 transform transition-transform duration-700 group-hover:translate-y-[-8px]">
                  <div className="font-mono text-[10px] text-[#5dd8e2] mb-3 uppercase tracking-[0.2em]">{movie.genre}</div>
                  <h3 className="font-serif text-[34px] leading-[1.1] text-white mb-2">{movie.title}</h3>
                  <p className="text-[13px] text-[#94a3a8] opacity-80 group-hover:opacity-100 transition-opacity">{movie.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default Landing;