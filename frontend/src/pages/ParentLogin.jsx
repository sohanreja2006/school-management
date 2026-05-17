import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Phone, Lock, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Captcha from '../components/ui/Captcha';

const ParentLogin = () => {
  const [email, setEmail] = useState('');
  const [parentKey, setParentKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      setError('Please verify the captcha first.');
      return;
    }
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Re-using verifyOtp endpoint mapping for backward compatibility in routing,
      // but it actually maps to the login controller on the backend.
      const response = await parentAuth.verifyOtp({ email, parentKey });
      if (response.data.success) {
        localStorage.setItem('parentToken', response.data.token);
        localStorage.setItem('parentUser', JSON.stringify(response.data.user));
        setUser(response.data.user);
        navigate('/parent-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or Parent Key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-outfit">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4 transform hover:scale-110 transition-transform">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Parent Portal</h1>
          <p className="text-gray-500 mt-2 font-medium">Access your child's academic journey</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-shake">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Parent Email</label>
              <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail className="w-full h-full" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="parent@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Parent Key</label>
              <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock className="w-full h-full" />
                </div>
                <input
                  type="text"
                  value={parentKey}
                  onChange={(e) => setParentKey(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="Enter 8-character Key"
                  required
                />
              </div>
            </div>

            <Captcha onVerify={setCaptchaVerified} />

            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Secure Login
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-gray-500 text-sm font-medium">
          Having trouble? <a href="#" className="text-primary-600 font-bold hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default ParentLogin;
