// src/services/adminAxiosInstance.js
import axios from 'axios';
import { getNavigate } from '../components/navigateServices';

const adminAxiosInstance = axios.create({
    baseURL: 'http://localhost:9000/api/admin',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - adds Authorization header with admin validation
adminAxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token) {
            console.warn("No token found. Redirecting to login...");
            const navigate = getNavigate();
            if (navigate) navigate('/login');
            return Promise.reject(new Error('No authentication token'));
        }

        // Validate admin role
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            console.warn("Unauthorized: Admin access required");
            const navigate = getNavigate();
            if (navigate) navigate('/dashboard');
            return Promise.reject(new Error('Admin access required'));
        }

        config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handles token expiry and auto-refresh
adminAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('⚠️ Admin token expired! Attempting to refresh...');

                // Dynamically import authService to avoid circular dependency
                const { default: authService } = await import('./authService');

                // Call refresh token
                await authService.refreshToken();
                console.log('✅ Admin token refreshed successfully!');

                // Retry original request with new token
                const newToken = localStorage.getItem('token');
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                return adminAxiosInstance(originalRequest);

            } catch (refreshError) {
                // Refresh failed - logout user
                console.error('❌ Admin token refresh failed. Logging out...');

                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userRole');

                const navigate = getNavigate();
                if (navigate) navigate('/login');

                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            console.warn("Forbidden: Insufficient admin permissions");
            const navigate = getNavigate();
            if (navigate) navigate('/dashboard');
        }

        return Promise.reject(error);
    }
);

export default adminAxiosInstance;