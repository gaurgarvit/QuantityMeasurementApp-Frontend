import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

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
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const measurementService = {
  compare: (data) => api.post('/api/v1/quantities/compare', data),
  convert: (data) => api.post('/api/v1/quantities/convert', data),
  add: (data) => api.post('/api/v1/quantities/add', data),
  subtract: (data) => api.post('/api/v1/quantities/subtract', data),
  divide: (data) => api.post('/api/v1/quantities/divide', data),
  getHistoryByOperation: (op) => api.get(`/api/v1/quantities/history/operation/${op}`),
  getHistoryByType: (type) => api.get(`/api/v1/quantities/history/type/${type}`),
  getErroredHistory: () => api.get('/api/v1/quantities/history/errored'),
  getAllHistory: () => api.get('/api/v1/quantities/history/all'),
  getUserHistory: () => api.get('/api/v1/quantities/history/user'),
  getOperationCount: (op) => api.get(`/api/v1/quantities/count/${op}`),
};

export default api;
