import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, School, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL !== '/api' && !API_URL.startsWith('http://') && !API_URL.startsWith('https://') && !API_URL.startsWith('/')) {
  API_URL = `https://${API_URL}`;
}

const CompleteProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    role: '',
    phone: '',
    address: '',
    studentCount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name || '' }));
      // If user already has a school, they shouldn't be here
      if (user.schoolId) {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // We'll call a new endpoint to complete the profile
      const response = await fetch(`${API_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to complete profile');

      // Update local user state
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academix-container">
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
            Almost <span className="text-blue-600">There.</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Please provide a few more details to set up your institution and get started.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
           <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 max-w-sm">
             <div className="flex items-center gap-3 mb-4 text-blue-600">
               <CheckCircle2 className="w-6 h-6" />
               <span className="font-bold font-outfit">Email Verified</span>
             </div>
             <p className="text-sm text-slate-600 font-medium leading-relaxed">
               Your account has been authenticated successfully. Now let's personalize your dashboard.
             </p>
           </div>
        </div>
      </div>

      <div className="academix-right">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2 font-outfit">Complete Your Profile</h1>
            <p className="text-slate-400 font-medium">Finalize your institutional details.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="academix-input-group">
              <label className="academix-label">Administrator Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="academix-input pl-12"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div className="academix-input-group">
              <label className="academix-label">Institution Name</label>
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
              <label className="academix-label">Your Role</label>
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
                  <option value="teacher">HOD / Teacher</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="academix-input-group">
                <label className="academix-label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="academix-input"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
              <div className="academix-input-group">
                <label className="academix-label">Approx. Students</label>
                <select
                  name="studentCount"
                  value={formData.studentCount}
                  onChange={handleChange}
                  className="academix-input appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select range</option>
                  <option value="0-100">1 - 100</option>
                  <option value="101-500">101 - 500</option>
                  <option value="501-2000">501 - 2,000</option>
                  <option value="2000+">2,000+</option>
                </select>
              </div>
            </div>

            <div className="academix-input-group">
              <label className="academix-label">Institution Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="academix-input min-h-[100px] py-4 resize-none"
                placeholder="Street address, City, Country"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="academix-button-primary py-5 h-14 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Launch Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
