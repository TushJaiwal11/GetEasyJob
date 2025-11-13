// src/services/authAxiosInstance.js
import axios from 'axios';

const authAxiosInstance = axios.create({
    baseURL: 'http://localhost:9000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
authAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    console.error("Bad request:", data);
                    break;
                case 401:
                    console.error("Unauthorized:", data);
                    break;
                case 404:
                    console.error("Not found:", error.config?.url);
                    break;
                case 409:
                    console.error("Conflict:", data);
                    break;
                case 500:
                    console.error("Server error:", data);
                    break;
                default:
                    console.error(`Error ${status}:`, data);
            }
        }
        return Promise.reject(error);
    }
);

export default authAxiosInstance;