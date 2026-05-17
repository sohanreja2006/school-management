import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, Clock, BarChart3, Users, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import Captcha from '../components/ui/Captcha';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Save Time',
      desc: 'Automate daily tasks and focus on what matters most.',
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50'
    },
    {
      title: 'Real-time Insights',
      desc: 'Get instant reports and analytics anytime.',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50'
    },
    {
      title: 'Better Collaboration',
      desc: 'Connect teachers, students and parents seamlessly.',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50'
    }
  ];

  return (
    <div className="academix-container">
      {/* Left Panel */}
      <div className="academix-left">
        <div className="flex items-center gap-2 mb-16">
          <div className="w-10 h-10 bg-[#1A73E8] rounded-xl flex items-center justify-center">
            <img src="/logo-icon.png" alt="Logo" className="w-6 h-6 invert" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 font-outfit leading-tight">Academix</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">School Management System</span>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4 font-outfit leading-tight">
            Welcome back <br />
            to <span className="text-blue-600">Academix</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Login to manage your school efficiently and effectively.
          </p>
        </div>

        {/* Person with Laptop Illustration Placeholder */}
        <div className="flex-1 flex items-center justify-center mb-12">
          <img 
            src="/illustrations/login-hero.png" 
            alt="Welcome back" 
            className="max-w-[80%] h-auto object-contain"
          />
        </div>

        <div className="mt-auto">
          {features.map((f, i) => (
            <div key={i} className="academix-feature-item">
              <div className={`academix-feature-icon ${f.bg}`}>
                {f.icon}
              </div>
              <div>
                <h4 className="academix-feature-title">{f.title}</h4>
                <p className="academix-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="academix-right">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit">Login</h1>
            <p className="text-slate-400 font-medium">Welcome back! Please login to your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="academix-input-group">
              <label className="academix-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="academix-input pl-12"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="academix-input-group">
              <label className="academix-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="academix-input pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <div className="mb-6">
              <Captcha onVerify={setCaptchaVerified} />
            </div>

            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className={`academix-button-primary py-5 h-14 ${(!captchaVerified && !loading) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Login'
              )}
            </button>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or login with</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={loginWithGoogle}
                className="academix-social-button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button 
                type="button" 
                onClick={() => {}}
                className="academix-social-button"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
