import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <img src="/logo-icon.png" alt="Logo" className="h-6 w-auto invert" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight font-outfit">
              Academix
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-[13px] font-bold text-slate-600 hover:text-blue-600 transition-colors font-outfit uppercase tracking-widest">Home</Link>
            <a href="#features" className="text-[13px] font-bold text-slate-600 hover:text-blue-600 transition-colors font-outfit uppercase tracking-widest">Features</a>
            <a href="#solutions" className="text-[13px] font-bold text-slate-600 hover:text-blue-600 transition-colors font-outfit uppercase tracking-widest">Solutions</a>
            <Link to="/contact" className="text-[13px] font-bold text-slate-600 hover:text-blue-600 transition-colors font-outfit uppercase tracking-widest">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/signup" 
              className="px-6 py-3 bg-blue-600 text-white text-[12px] font-black rounded-full hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-500/20 flex items-center gap-2 font-outfit uppercase tracking-widest"
            >
              Request Demo
            </Link>
            <Link 
              to="/login" 
              className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 text-[12px] font-black rounded-full hover:bg-blue-50 transition-colors font-outfit uppercase tracking-widest"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50">Home</Link>
            <Link to="/features" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50">Features</Link>
            <Link to="/login" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50">Sign In</Link>
            <Link to="/signup" className="block px-4 py-3 rounded-xl text-base font-bold bg-blue-600 text-white text-center">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
