// src/services/authService.js
import authAxiosInstance from './authAxiosInstance';

class AuthService {

    // User login
    async login(credentials) {
        try {
            const response = await authAxiosInstance.post('/auth/login', credentials);

            // Store JWT token
            if (response.data?.data?.jwt) {
                localStorage.setItem('token', response.data.data.jwt);
            }

            // Store refresh token
            if (response.data?.data?.refresh_token) {
                localStorage.setItem('refreshToken', response.data.data.refresh_token);
            }

            // Decode and store user role
            if (response.data?.data?.jwt) {
                const payload = this.decodeJWT(response.data.data.jwt);

                if (payload) {
                    // ✅ 1. Try to get roles from your client (if available)
                    const clientRoles = payload.resource_access?.['hire-hunt-client']?.roles || [];

                    // ✅ 2. Also check realm-level roles (like "admin", "default-roles-master", etc.)
                    const realmRoles = payload.realm_access?.roles || [];

                    // ✅ 3. Merge both for safety
                    const allRoles = [...clientRoles, ...realmRoles];

                    // ✅ 4. Determine user role
                    const userRole = allRoles.includes('admin') || allRoles.includes('ADMIN')
                        ? 'ADMIN'
                        : 'USER';

                    // ✅ 5. Store in localStorage
                    localStorage.setItem('userRole', userRole);
                }

            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // User registration
    async register(userData) {
        try {
            const response = await authAxiosInstance.post('/auth/signup', userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Logout - clear all tokens
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const payload = this.decodeJWT(token);
            if (payload?.exp) {
                const isExpired = Date.now() >= payload.exp * 1000;
                if (isExpired) {
                    console.log('⚠️ Token expired, checking refresh token...');
                    // Token is expired, but we still return true if refresh token exists
                    // The interceptor will handle the refresh
                    return !!localStorage.getItem('refreshToken');
                }
                return true;
            }
            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    // Check if user is admin
    isAdmin() {
        const userRole = localStorage.getItem('userRole');
        return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    }

    // Get current user role
    getUserRole() {
        return localStorage.getItem('userRole') || 'USER';
    }

    // Refresh token - get new JWT using refresh token
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('🔄 Calling refresh token API...');
            console.log('Refresh token:', refreshToken.substring(0, 20) + '...');

            const response = await authAxiosInstance.get(
                `/auth/access-token/refresh-token/${refreshToken}`
            );

            console.log('✅ Refresh response received:', response.status);

            // Save new tokens
            if (response.data?.data?.jwt) {
                console.log('💾 Saving new access token...');
                localStorage.setItem('token', response.data.data.jwt);

                if (response.data?.data?.refresh_token) {
                    console.log('💾 Saving new refresh token...');
                    localStorage.setItem('refreshToken', response.data.data.refresh_token);
                }

                // Update user role from new token
                const payload = this.decodeJWT(response.data.data.jwt);
                if (payload?.resource_access) {
                    const roles = payload.resource_access['hire-hunt-client']?.roles || [];
                    const userRole = roles.includes('ADMIN') ? 'ADMIN' : 'USER';
                    localStorage.setItem('userRole', userRole);
                }

                console.log('✅ New tokens saved successfully');
                return response.data.data;
            } else {
                console.error('❌ Invalid refresh response - no JWT in response');
                throw new Error('Invalid refresh response');
            }

        } catch (error) {
            console.error('❌ Refresh token failed:', error.response?.status, error.response?.data || error.message);
            this.logout();
            throw this.handleError(error);
        }
    }

    // Decode JWT token
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await authAxiosInstance.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Reset password
    async resetPassword(resetData) {
        try {
            const response = await authAxiosInstance.post('/auth/reset-password', resetData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Error handler
    handleError(error) {
        if (error.response) {
            return error.response.data?.message || error.response.data || 'An error occurred';
        } else if (error.request) {
            return 'No response from server';
        } else {
            return error.message || 'An unexpected error occurred';
        }
    }
}

export default new AuthService();