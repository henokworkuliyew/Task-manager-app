import axios from 'axios'
import { getApiUrl, config } from '../config/config.js'

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('🌐 API Configuration:', {
  baseURL: getApiUrl(),
  timeout: config.api.timeout,
  environment: import.meta.env.MODE,
  devMode: import.meta.env.DEV
});

console.log('🌍 Environment Info:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD
});

api.interceptors.request.use(
  (config) => {
    console.log('📡 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('🚨 API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export const taskAPI = {
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleImportance: (id) => api.patch(`/tasks/${id}/toggle-importance`),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  getOverdueTasks: () => api.get('/tasks/overdue'),
  getTasksDueSoon: (days = 3) => api.get('/tasks/due-soon', { params: { days } }),
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyResetToken: (token) => api.get(`/auth/reset-password/${token}`),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
}

export default api




