import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Hero() {
  const navigate = useNavigate();

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] pt-32 pb-20 px-6 text-center z-10">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        {/* Badge directly on background */}
        <motion.div variants={itemVariants} className="border border-[#1e3d42] bg-[#0c181a]/50 backdrop-blur-md rounded-full px-5 py-1.5 mb-10 shadow-[0_0_20px_rgba(30,61,66,0.3)]">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#5dd8e2] uppercase">
            AI Cinematic Engine V4.0
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-[76px] leading-[1.05] text-[#f8f9fa] mb-8 tracking-tight drop-shadow-xl">
          Turn Your Memories Into<br />Cinematic Stories
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-[#94a3a8] text-[17px] md:text-[19px] max-w-2xl mb-14 leading-relaxed drop-shadow-md">
          Transform photos, voice notes, and fragments of life into professional-grade movies with emotional AI. Experience your past as a masterpiece.
        </motion.p>

        {/* Solid White Pill Button with Subtle Pulse and Glow */}
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.03, boxShadow: "0px 0px 40px rgba(255, 255, 255, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          animate={{ 
            boxShadow: ["0px 0px 0px rgba(255,255,255,0.1)", "0px 0px 20px rgba(255,255,255,0.2)", "0px 0px 0px rgba(255,255,255,0.1)"] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} // Breathing effect
          onClick={() => navigate('/upload')} 
          className="bg-white text-black px-8 py-3.5 rounded-full text-[16px] font-medium flex items-center gap-3 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle shine effect that sweeps across the button */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          
          <span className="relative z-10">Start Your Story</span>
          <svg className="relative z-10 transition-transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3L19 12L5 21V3Z" />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
}

export default Hero;