import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Current path check karne ke liye

  // Helper function to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full z-50 flex justify-between items-center px-8 md:px-12 py-7 fixed top-0 bg-transparent">
      <div className="flex items-center gap-16">
        
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-full border border-[#5dd8e2]/50 flex items-center justify-center backdrop-blur-md"></div>
          <div className="flex flex-col">
            <h2 className="text-[22px] tracking-[0.2em] text-[#f8f9fa] font-medium leading-none mb-1 drop-shadow-md">AETHERIS</h2>
            <span className="text-[8px] tracking-[0.3em] text-[#718387] uppercase">AI Memory Studio</span>
          </div>
        </div>

        {/* Links */}
        <div className="hidden md:flex gap-10 text-[14px] font-medium tracking-wide">
          <span 
            onClick={() => navigate('/studio')} 
            className={`cursor-pointer transition-colors ${isActive('/studio') ? 'text-white border-b-2 border-white pb-1' : 'text-[#8a9396] hover:text-white'}`}>
            Studio
          </span>
          <span 
            onClick={() => navigate('/dashboard')} 
            className={`cursor-pointer transition-colors ${isActive('/dashboard') ? 'text-white border-b-2 border-white pb-1' : 'text-[#8a9396] hover:text-white'}`}>
            Dashboard
          </span>
          <span 
            onClick={() => navigate('/flow')} 
            className={`cursor-pointer transition-colors ${isActive('/flow') ? 'text-white border-b-2 border-white pb-1' : 'text-[#8a9396] hover:text-white'}`}>
            Flow
          </span>
          <span 
            onClick={() => navigate('/')} 
            className={`cursor-pointer transition-colors ${isActive('/') ? 'text-white border-b-2 border-white pb-1' : 'text-[#8a9396] hover:text-white'}`}>
            Vision
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-8">
        <button 
          onClick={() => navigate('/login')} 
          className="text-[14px] text-[#8a9396] hover:text-white transition-colors font-medium">
          Sign In
        </button>
        <button 
          onClick={() => navigate('/upload')} 
          className="bg-[#f0f2f2] text-black px-6 py-2.5 rounded-md text-[14px] font-medium hover:bg-white transition-colors shadow-lg">
          Start Creating
        </button>
      </div>
    </nav>
  );
}

export default Navbar;