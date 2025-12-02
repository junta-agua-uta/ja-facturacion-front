import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Only logout if it's actually an authentication issue
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('token') || errorMessage.includes('unauthorized') || errorMessage.includes('expired')) {
        console.log('Authentication error detected, logging out user');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      } else {
        console.log('401 error but not authentication related:', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
