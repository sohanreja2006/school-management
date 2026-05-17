import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.log('AsyncStorage not found, using memory mock');
}

const storage = {
  data: {},
  setItem: async (key, val) => {
    try { if (AsyncStorage) await AsyncStorage.setItem(key, val); } catch (e) {}
    storage.data[key] = val;
  },
  getItem: async (key) => {
    try { if (AsyncStorage) { const v = await AsyncStorage.getItem(key); if (v) return v; } } catch (e) {}
    return storage.data[key] || null;
  },
  removeItem: async (key) => {
    try { if (AsyncStorage) await AsyncStorage.removeItem(key); } catch (e) {}
    delete storage.data[key];
  },
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedToken = await storage.getItem('token');
      const savedUser = await storage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUserData(parsedUser);
        if (parsedUser.assignedClasses && parsedUser.assignedClasses.length > 0) {
          setSelectedClass(parsedUser.assignedClasses[0]);
        }
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log('Session load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (staffId, staffKey) => {
    setIsLoading(true);
    try {
      const res = await authService.staffLogin({ staff_id: staffId, staff_key: staffKey });
      const { token: newToken, user } = res.data;

      await storage.setItem('token', newToken);
      await storage.setItem('user', JSON.stringify(user));

      setToken(newToken);
      setUserData(user);
      if (user.assignedClasses && user.assignedClasses.length > 0) {
        setSelectedClass(user.assignedClasses[0]);
      } else {
        setSelectedClass('');
      }
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
    setSelectedClass('');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        userData,
        token,
        selectedClass,
        setSelectedClass,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
