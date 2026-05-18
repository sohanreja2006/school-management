import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, School, ShieldCheck, BarChart3, Headphones, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Captcha from '../components/ui/Captcha';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [otp, setOtp] = useState('');
  const [receivedDevOtp, setReceivedDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { signup, requestSignupOTP, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.email.includes('@')) {
      return setError('Please enter a valid email address');
    }

    if (!captchaVerified) {
      return setError('Please complete the captcha verification.');
    }

    setLoading(true);
    try {
      const resData = await requestSignupOTP(formData.email, formData.schoolName || 'Your Institution');
      if (resData?.devOtp) {
        setReceivedDevOtp(resData.devOtp);
        setOtp(resData.devOtp); // Auto pre-fill
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      return setError('Please enter a 6-digit code');
    }

    setLoading(true);
    try {
      await signup(formData.email, formData.password, {
        name: formData.name,
        schoolName: formData.schoolName,
        role: formData.role
      }, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Secure & Reliable',
      desc: 'Your data is protected with enterprise-grade security.',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50'
    },
    {
      title: 'All-in-One Solution',
      desc: 'Manage students, fees, attendance, exams & more seamlessly.',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50'
    },
    {
      title: '24/7 Support',
      desc: "We're here to help you every step of the way.",
      icon: <Headphones className="w-5 h-5 text-blue-600" />,
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
            Create your <br />
            <span className="text-blue-600">Academix</span> <br />
            account
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
            Join thousands of schools managing everything in one place.
          </p>
        </div>

        {/* School Building Illustration Placeholder */}
        <div className="flex-1 flex items-center justify-center mb-12">
          <img 
            src="/illustrations/signup-hero.png" 
            alt="School Building" 
            className="max-w-[90%] h-auto object-contain"
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
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit">Sign Up</h1>
            <p className="text-slate-400 font-medium">Create a new account to get started</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="academix-input-group">
                <label className="academix-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="academix-input pl-12"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="academix-input-group">
                <label className="academix-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="academix-input pl-12"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="academix-input-group">
                <label className="academix-label">School Name</label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="schoolName"
                    type="text"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="academix-input pl-12"
                    placeholder="Enter your school name"
                    required
                  />
                </div>
              </div>

              <div className="academix-input-group">
                <label className="academix-label">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="academix-input pl-5 pr-12 appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="admin">Administrator</option>
                    <option value="principal">Principal</option>
                    <option value="owner">School Owner</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="academix-input-group">
                <label className="academix-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="academix-input pl-12 pr-12"
                    placeholder="Create a password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="academix-input-group">
                <label className="academix-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="academix-input pl-12 pr-12"
                    placeholder="Confirm your password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 my-6">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" required />
                <span className="text-sm text-slate-500 leading-relaxed">
                  I agree to the <Link className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>
                </span>
              </div>

              <div className="pt-2">
                <Captcha onVerify={setCaptchaVerified} />
              </div>

              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className="academix-button-primary py-5 h-14"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or sign up with</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                <button type="button" className="academix-social-button">
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
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-8 animate-in fade-in slide-in-from-right-4">
               <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 font-outfit">Check your inbox</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    We've sent a verification code to <span className="text-slate-900 font-bold">{formData.email}</span>
                  </p>
               </div>

               {receivedDevOtp && (
                 <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center animate-bounce">
                   <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">💡 Live Demo / Virtual Inbox Mode</p>
                   <p className="text-sm text-amber-900 mb-2">Google SMTP is blocked by cloud firewall. Your verification code is pre-filled below:</p>
                   <p className="text-2xl font-black text-amber-600 tracking-[0.3em]">{receivedDevOtp}</p>
                 </div>
               )}

               <div className="academix-input-group">
                  <label className="academix-label text-center">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="academix-input text-center text-3xl tracking-[0.5em] font-black h-20"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
               </div>

               <button
                 type="submit"
                 disabled={loading || otp.length !== 6}
                 className="academix-button-primary h-14"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Complete'}
               </button>

               <div className="flex justify-center gap-6">
                 <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Edit Email</button>
                 <button type="button" onClick={handleSendOTP} className="text-sm font-bold text-blue-600 hover:text-blue-700">Resend Code</button>
               </div>
            </form>
          )}

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
