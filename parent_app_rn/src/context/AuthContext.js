import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
// Optional import to avoid crashing if native module is missing
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.log('AsyncStorage not found, using memory mock');
}

// STORAGE WRAPPER: Persists login if possible, else uses memory
const storage = {
  data: {},
  setItem: async (key, val) => { 
    try { if (AsyncStorage) await AsyncStorage.setItem(key, val); } catch(e) {}
    storage.data[key] = val; 
  },
  getItem: async (key) => {
    try { if (AsyncStorage) { const v = await AsyncStorage.getItem(key); if (v) return v; } } catch(e) {}
    return storage.data[key] || null;
  },
  removeItem: async (key) => { 
    try { if (AsyncStorage) await AsyncStorage.removeItem(key); } catch(e) {}
    delete storage.data[key]; 
  }
};

const AuthContext = createContext();
const API_URL = 'http://192.168.31.230:5000/api'; 

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadSavedSettings();
    loadSavedSession();
  }, []);

  const loadSavedSettings = async () => {
    const savedTheme = await storage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await storage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const loadSavedSession = async () => {
    try {
      const savedToken = await storage.getItem('token');
      const savedUser = await storage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUserData(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log('Session load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email, parentKey) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/parent/verify-otp`, { email, parentKey });
      const { token: newToken, user } = res.data;
      
      await storage.setItem('token', newToken);
      await storage.setItem('user', JSON.stringify(user));
      
      setToken(newToken);
      setUserData(user);
      setIsLoggedIn(true);
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isLoading, 
      userData, 
      token, 
      verifyOtp, 
      logout, 
      setUserData,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
