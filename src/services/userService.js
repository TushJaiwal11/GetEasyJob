// src/services/userService.js
import userAxiosInstance from './userAxiosInstance';

class UserService {

    // Get user profile
    async getProfile() {
        try {
            const response = await userAxiosInstance.get('/api/users/profile');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getReferredUsers() {
        try {
            const response = await userAxiosInstance.get('/api/users/referral/referred-users');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    // Update email configuration
    async updateProfile(userId, user) {
        try {
            const response = await userAxiosInstance.patch(`/api/users/profile/update/${userId}`, user);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async uploadProfileImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await userAxiosInstance.patch('/api/users/profile/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }


    // Get profile image
    async getProfileImage() {
        try {
            const response = await userAxiosInstance.get('/api/users/profile/image', {
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Failed to fetch profile image:', error);
            return null;
        }
    }

    // Get user profile image by ID
    async getUserProfileImage(userId) {
        try {
            const response = await userAxiosInstance.get(`/api/users/${userId}/profile/image`, {
                responseType: 'blob',
                headers: { 'Cache-Control': 'no-cache' } // optional safety
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile image:', error);
            return null;
        }
    }

    // Delete profile image
    async deleteProfileImage() {
        try {
            const response = await userAxiosInstance.delete('/api/users/profile/image');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get email configurations
    async getEmailConfigs() {
        try {
            const response = await userAxiosInstance.get('/api/email-config/getAllMailConfigs');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Create email configuration
    async createEmailConfig(configData) {
        try {
            const response = await userAxiosInstance.post('/api/email-config/createConfig', configData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update email configuration
    async updateEmailConfig(configId, configData) {
        try {
            const response = await userAxiosInstance.put(`/api/email-config/updateConfig/${configId}`, configData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete email configuration
    async deleteEmailConfig(configId) {
        try {
            const response = await userAxiosInstance.delete(`/api/email-config/deleteConfig/${configId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Share email
    async shareEmail(emailData) {
        try {
            const response = await userAxiosInstance.post('/api/share-email', emailData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get referral points
    async getReferralPoints() {
        try {
            const response = await userAxiosInstance.get('/api/referral/referral/points');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get referral earnings
    async getReferralEarnings() {
        try {
            const response = await userAxiosInstance.get('/api/referral/referral/earnings');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // // Get subscription plans
    // async getSubscriptionPlans() {
    //     try {
    //         const response = await userAxiosInstance.get('/subscription-plans');
    //         return response.data;
    //     } catch (error) {
    //         throw this.handleError(error);
    //     }
    // }

    // Subscribe to plan
    async subscribeToPlan(planData) {
        try {
            const response = await userAxiosInstance.post('/api/payment/subscribe', planData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async verifyPayment(verificationData) {
        try {
            const response = await userAxiosInstance.post('/api/payment/verify', verificationData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserSubscriptions() {
        try {
            const response = await userAxiosInstance.get('/api/payment/subscriptions/history/');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getCurrentSubscription() {
        try {
            const response = await userAxiosInstance.get('/api/payment/subscription/current/');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

  


    // Get dashboard data
    async getDashboardData() {
        try {
            const response = await userAxiosInstance.get('/dashboard');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get posts
    async getPosts() {
        try {
            const response = await userAxiosInstance.get('/posts');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get single post
    async getPostById(postId) {
        try {
            const response = await userAxiosInstance.get(`/posts/${postId}`);
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

export default new UserService();