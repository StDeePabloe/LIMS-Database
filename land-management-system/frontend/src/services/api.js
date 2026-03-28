import axios from 'axios';

// Create base API instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.error);
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data.error);
    }
    
    return Promise.reject(error);
  }
);

// API service endpoints
export const authAPI = api;
export const usersAPI = api;
export const farmersAPI = api;
export const farmDataAPI = api;
export const reportsAPI = api;

// Specific API methods for different services
export const authService = {
  login: (credentials) => authAPI.post('/login', credentials),
  register: (userData) => authAPI.post('/register', userData),
  getCurrentUser: () => authAPI.get('/me'),
  refreshToken: () => authAPI.post('/refresh'),
};

export const userService = {
  getAllUsers: (params) => usersAPI.get('/', { params }),
  getUserById: (id) => usersAPI.get(`/${id}`),
  updateUser: (id, userData) => usersAPI.put(`/${id}`, userData),
  deleteUser: (id) => usersAPI.delete(`/${id}`),
};

export const farmerService = {
  getAllFarmers: (params) => farmersAPI.get('/', { params }),
  getFarmerById: (id) => farmersAPI.get(`/${id}`),
  createFarmer: (farmerData) => farmersAPI.post('/', farmerData),
  updateFarmer: (id, farmerData) => farmersAPI.put(`/${id}`, farmerData),
  deleteFarmer: (id) => farmersAPI.delete(`/${id}`),
};

export const farmDataService = {
  getFarmData: (farmerId, params) => farmDataAPI.get(`/${farmerId}`, { params }),
  getFarmDataSummary: (farmerId) => farmDataAPI.get(`/${farmerId}/summary`),
  createFarmData: (farmerId, table, data) => farmDataAPI.post(`/${farmerId}/${table}`, data),
  updateFarmData: (farmerId, table, recordId, data) => farmDataAPI.put(`/${farmerId}/${table}/${recordId}`, data),
  deleteFarmData: (farmerId, table, recordId) => farmDataAPI.delete(`/${farmerId}/${table}/${recordId}`),
};

export const reportService = {
  getAssessmentReport: (farmerId, params) => reportsAPI.get(`/assessment/${farmerId}`, { params }),
  getMyReports: () => reportsAPI.get('/my-reports'),
  getSystemStatistics: () => reportsAPI.get('/statistics'),
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.error || 'Server error',
      status: error.response.status,
      details: error.response.data.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: null,
      details: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
      details: null,
    };
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default api;
