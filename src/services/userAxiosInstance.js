// src/services/userAxiosInstance.js
import axios from 'axios';
import { getNavigate } from '../components/navigateServices';

const userAxiosInstance = axios.create({
    baseURL: 'http://localhost:9000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - adds Authorization header
userAxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handles token expiry and auto-refresh
userAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return userAxiosInstance(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('🔄 Token expired! Attempting to refresh...');

                // Get refresh token
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh endpoint directly (not through interceptor)
                const response = await axios.post(
                    'http://localhost:9000/api/auth/refresh-token',
                    { refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                // Save new tokens
                localStorage.setItem('token', newToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                console.log('✅ Token refreshed successfully!');

                // Update authorization header
                userAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                // Process queued requests
                processQueue(null, newToken);
                isRefreshing = false;

                // Retry original request
                return userAxiosInstance(originalRequest);

            } catch (refreshError) {
                // Refresh failed - logout user
                console.error('❌ Token refresh failed:', refreshError);

                processQueue(refreshError, null);
                isRefreshing = false;

                // Clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userRole');

                // Navigate to login
                const navigate = getNavigate();
                if (navigate) {
                    navigate('/login');
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default userAxiosInstance;