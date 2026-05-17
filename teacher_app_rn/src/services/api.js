import axios from 'axios';
// Optional import to avoid crashing if native module is missing
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.log('AsyncStorage not found, using memory mock');
}

const API_URL = 'http://192.168.31.230:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      if (AsyncStorage) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.log('Error attaching token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  staffLogin: async (credentials) => await api.post('/school/staff-login', credentials),
};

export const attendanceService = {
  mark: async (data) => await api.post('/attendance', data),
  getDailyStatus: async (params) => await api.get('/attendance/daily-status', { params }),
  resetDaily: async (params) => await api.delete('/attendance/reset', { params }),
};

export default api;
