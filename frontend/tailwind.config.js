import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(99, 102, 241, 0.1)',
        'premium-hover': '0 20px 40px -10px rgba(99, 102, 241, 0.25)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-accent': '0 0 20px rgba(244, 63, 94, 0.5)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-bloom-1': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(10%, -8%, 0) scale(1.14)' },
          '66%': { transform: 'translate3d(-6%, 6%, 0) scale(1.08)' },
        },
        'auth-bloom-2': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.06)' },
          '40%': { transform: 'translate3d(-10%, 5%, 0) scale(1.16)' },
          '70%': { transform: 'translate3d(5%, -8%, 0) scale(1.02)' },
        },
        'auth-bloom-3': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(8%, 10%, 0) scale(1.18)' },
        },
        'auth-bloom-4': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.1)' },
          '45%': { transform: 'translate3d(-8%, -10%, 0) scale(1)' },
        },
        'auth-shimmer': {
          '0%': { transform: 'translate3d(-100%, 0, 0)', opacity: '0' },
          '12%': { opacity: '0.5' },
          '50%': { opacity: '0.65' },
          '88%': { opacity: '0.5' },
          '100%': { transform: 'translate3d(220%, 0, 0)', opacity: '0' },
        },
        'auth-grid-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(-12px, -12px, 0)' },
        },
        'auth-ring-cw': {
          '0%': { transform: 'translate3d(-50%, -50%, 0) rotate(0deg)' },
          '100%': { transform: 'translate3d(-50%, -50%, 0) rotate(360deg)' },
        },
        'auth-ring-ccw': {
          '0%': { transform: 'translate3d(-50%, -50%, 0) rotate(0deg)' },
          '100%': { transform: 'translate3d(-50%, -50%, 0) rotate(-360deg)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(-2%, -2%)' },
        },
        'cross-fade': {
          '0%, 100%': { opacity: '0' },
          '10%, 40%': { opacity: '0.15' },
          '50%, 90%': { opacity: '0' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'auth-bloom-1': 'auth-bloom-1 18s ease-in-out infinite',
        'auth-bloom-2': 'auth-bloom-2 14s ease-in-out infinite',
        'auth-bloom-3': 'auth-bloom-3 22s ease-in-out infinite',
        'auth-bloom-4': 'auth-bloom-4 26s ease-in-out infinite',
        'auth-shimmer': 'auth-shimmer 12s ease-in-out infinite',
        'auth-ring-cw': 'auth-ring-cw 72s linear infinite',
        'auth-ring-ccw': 'auth-ring-ccw 96s linear infinite',
        'auth-grid-drift': 'auth-grid-drift 28s ease-in-out infinite',
        'ken-burns': 'ken-burns 20s ease-in-out infinite alternate',
        'cross-fade': 'cross-fade 30s ease-in-out infinite',
      }
    },
  },
  plugins: [
    tailwindAnimate,
  ],
}
