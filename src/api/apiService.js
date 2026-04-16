import axios from 'axios';

const API_BASE_URL = "https://quantity-measurement-app-production-de85.up.railway.app/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Use window.location only if not on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const measurementService = {
  compare: (data) => api.post('/api/measurements/compare', data),
  convert: (data) => api.post('/api/measurements/convert', data),
  add: (data) => api.post('/api/measurements/add', data),
  subtract: (data) => api.post('/api/measurements/subtract', data),
  divide: (data) => api.post('/api/measurements/divide', data),
  getHistoryByOperation: (op) => api.get(`/api/measurements/history/${op}`),
  getHistoryByType: (type) => api.get(`/api/measurements/history/type/${type}`),
  getErroredHistory: () => api.get('/api/measurements/history/errored'),
  getAllHistory: () => api.get('/api/measurements/history'),
  getUserHistory: () => api.get('/api/measurements/history'), // Maps to all history for now
  getOperationCount: (op) => api.get(`/api/measurements/count/${op}`),
};

export default api;
