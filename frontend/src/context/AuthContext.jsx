import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('parentToken');
      const savedUser = localStorage.getItem('user') || localStorage.getItem('parentUser');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for Supabase OAuth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleOAuthSuccess(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOAuthSuccess = async (session) => {
    try {
      const { user: sbUser } = session;
      
      // Sync with our backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/oauth-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sbUser.email,
          name: sbUser.user_metadata?.full_name,
          provider_id: sbUser.id
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Redirect to complete profile if no schoolId
        if (!data.user.schoolId) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('OAuth Sync Error:', err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login'
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Login Error:', err);
      throw new Error('Failed to initiate Google Login');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      throw new Error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const requestSignupOTP = async (email, schoolName) => {
    try {
      const response = await authService.requestSignupOtp({ email, schoolName });
      return response.data;
    } catch (err) {
      console.error('OTP Request Error:', err);
      throw new Error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const signup = async (email, password, extraData, otp) => {
    try {
      const response = await authService.signup({ 
        email, 
        password, 
        name: extraData.name, 
        schoolName: extraData.schoolName,
        otp
      });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup Error:', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.clear();
      window.location.href = '/login'; // Hard reload to clear all React states
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Keep resetPassword as is for now or implement in backend
  const resetPassword = async (email) => {
    console.log("Reset password for:", email);
    // TODO: Implement backend reset password
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      login, 
      signup, 
      logout, 
      resetPassword, 
      requestSignupOTP,
      loginWithGoogle,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
