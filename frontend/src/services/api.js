import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use(async (config) => {
  // If we have a parent token, ALWAYS prioritize it for parent auth
  const parentToken = localStorage.getItem('parentToken');
  if (parentToken) {
    config.headers.Authorization = `Bearer ${parentToken}`;
    return config;
  }

  // Firebase is no longer used for Admin auth, rely entirely on the SaaS token

  // Fallback to normal JWT token if any
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  requestSignupOtp: async (data) => await api.post('/auth/request-signup-otp', data),
  signup: async (data) => await api.post('/auth/register', data),
  login: async (credentials) => await api.post('/auth/login', credentials),
  updateProfile: async (data) => await api.put('/auth/update-profile', data),
};

export const parentAuth = {
  requestOtp: async (data) => await api.post('/auth/parent/request-otp', data),
  verifyOtp: async (data) => await api.post('/auth/parent/verify-otp', data),
};

export const parentService = {
  getChildData: async () => await api.get('/parent/child-data'),
};

export const students = {
  getAll: async (params) => {
    return await api.get('/students', { params });
  },
  getOne: async (id) => {
    return await api.get(`/students/${id}`);
  },
  add: async (studentData) => {
    return await api.post('/students', studentData);
  },
  update: async (id, studentData) => {
    return await api.put(`/students/${id}`, studentData);
  },
  delete: async (id) => {
    return await api.delete(`/students/${id}`);
  },
};

export const attendance = {
  mark: async (data) => {
    return await api.post('/attendance', data);
  },
  get: async (params) => {
    return await api.get('/attendance', { params });
  },
  getStats: async (studentId) => {
    return await api.get(`/attendance/stats/${studentId}`);
  },
  getDailyStatus: async (params) => {
    return await api.get('/attendance/daily-status', { params });
  },
  reset: async (data) => {
    return await api.delete('/attendance/reset', { data });
  },
};

export const fees = {
  recordPayment: async (paymentData) => {
    return await api.post('/fees/pay', paymentData);
  },
  getHistory: async (studentId) => {
    return await api.get('/fees/history', { params: { studentId } });
  },
  getStats: async () => {
    return await api.get('/fees/stats');
  },
};

export const examination = {
  getExams: async () => await api.get('/examination/exams'),
  createExam: async (data) => await api.post('/examination/exams', data),
  updateExam: async (id, data) => await api.put(`/examination/exams/${id}`, data),
  deleteExam: async (id) => await api.delete(`/examination/exams/${id}`),
  
  getSubjects: async (params) => await api.get('/examination/subjects', { params }),
  createSubject: async (data) => await api.post('/examination/subjects', data),
  deleteSubject: async (id) => await api.delete(`/examination/subjects/${id}`),
  
  saveMarks: async (data) => await api.post('/examination/marks', data),
  getMarks: async (params) => await api.get('/examination/marks', { params }),
  getStudentResult: async (studentId, examId) => await api.get(`/examination/results/student/${studentId}/${examId}`),
  getClassResults: async (params) => await api.get('/examination/results/class', { params }),
};

export const notifications = {
  getAll: async () => await api.get('/notifications'),
  create: async (data) => await api.post('/notifications', data),
  sendAlert: async (data) => await api.post('/notifications/alert', data),
  markAsRead: async (id) => await api.put(`/notifications/${id}/read`),
};

export const timetable = {
  get: async (params) => {
    return await api.get('/timetable', { params });
  },
  add: async (data) => {
    return await api.post('/timetable', data);
  },
  update: async (id, data) => {
    return await api.put(`/timetable/${id}`, data);
  },
  delete: async (id) => {
    return await api.delete(`/timetable/${id}`);
  },
};

export const admissions = {
  submit: async (data) => await api.post('/admissions', data),
  getAll: async () => await api.get('/admissions'),
  updateStatus: async (id, status) => await api.put(`/admissions/${id}`, { status }),
};

export const extraFeatures = {
  // Homework
  getHomework: () => api.get('/homework'),
  createHomework: (data) => api.post('/homework', data),
  // Leaves
  getLeaves: () => api.get('/leaves'),
  applyLeave: (data) => api.post('/leaves', data),
  updateLeave: (id, data) => api.put(`/leaves/${id}`, data),
  // Library
  getBooks: () => api.get('/library'),
  addBook: (data) => api.post('/library', data),
  // Transport
  getRoutes: () => api.get('/transport'),
  addRoute: (data) => api.post('/transport', data),
  // Payroll
  getSalaries: () => api.get('/payroll'),
  processSalary: (data) => api.post('/payroll', data),
  // Inventory
  getAssets: () => api.get('/inventory'),
  addAsset: (data) => api.post('/inventory', data),
  // Events
  getEvents: () => api.get('/events'),
  createEvent: (data) => api.post('/events', data),
  // Behavior
  getBehaviorLogs: (studentId) => api.get(`/behavior/${studentId}`),
  createBehaviorLog: (data) => api.post('/behavior', data),
};

export const staffService = {
  getAll: async () => await api.get('/school/staff'),
  add: async (data) => await api.post('/school/staff', data),
  update: async (id, data) => await api.put(`/school/staff/${id}`, data),
  delete: async (id) => await api.delete(`/school/staff/${id}`),
};

export default api;
