// src/components/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9191', // Spring Boot backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — adds Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles token expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn("JWT expired or unauthorized. Logging out...");
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
