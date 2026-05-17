import React from 'react';

/**
 * Enhanced Educational Dark Background
 * Features:
 * - Mathematical/Educational "blueprint" aesthetic
 * - Floating subtle SVG icons (Book, Pencil, Atom)
 * - Deep mesh gradients and drifting grid
 */
const AuthAmbientBackground = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0f1e]"
      aria-hidden
    >
      {/* Base Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] h-[1200px] w-[1200px] rounded-full bg-primary-900/15 blur-[150px] animate-auth-bloom-1 will-change-transform" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[1200px] w-[1200px] rounded-full bg-indigo-950/20 blur-[150px] animate-auth-bloom-2 will-change-transform" />

      {/* Educational Floating Elements (Subtle SVGs) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        {/* Book Icon */}
        <svg className="absolute top-[10%] left-[15%] w-24 h-24 text-white rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        {/* Atom Icon */}
        <svg className="absolute bottom-[20%] left-[10%] w-32 h-32 text-white -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="3" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
        {/* Pencil Icon */}
        <svg className="absolute top-[40%] right-[15%] w-20 h-20 text-white rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </div>

      {/* Blueprint Grid Aesthetic */}
      <div
        className="absolute inset-0 opacity-[0.07] will-change-transform"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 2px, transparent 2px),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
        }}
      />

      {/* Connectivity Nodes */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1.5px] w-[1.5px] rounded-full bg-primary-500/40 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-60" />
    </div>
  );
};

export default AuthAmbientBackground;
