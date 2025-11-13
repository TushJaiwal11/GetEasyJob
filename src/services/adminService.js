// src/services/adminService.js
import adminAxiosInstance from './adminAxiosInstance';

class AdminService {

    // Get all users
    async getAllUsers() {
        try {
            const response = await adminAxiosInstance.get('/users');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get subscription users
    async getSubscriptionUsers() {
        try {
            const response = await adminAxiosInstance.get('/subscription-users');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Upload PDF
    async uploadPDF(formData) {
        try {
            const response = await adminAxiosInstance.post('/upload-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get all PDFs
    async getAllPDFs() {
        try {
            const response = await adminAxiosInstance.get('/pdfs');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete PDF
    async deletePDF(pdfId) {
        try {
            const response = await adminAxiosInstance.delete(`/pdfs/${pdfId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Create post
    async createPost(postData) {
        try {
            const response = await adminAxiosInstance.post('/posts', postData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update post
    async updatePost(postId, postData) {
        try {
            const response = await adminAxiosInstance.put(`/posts/${postId}`, postData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete post
    async deletePost(postId) {
        try {
            const response = await adminAxiosInstance.delete(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get all posts
    async getAllPosts() {
        try {
            const response = await adminAxiosInstance.get('/posts');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete user
    async deleteUser(userId) {
        try {
            const response = await adminAxiosInstance.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update user role
    async updateUserRole(userId, role) {
        try {
            const response = await adminAxiosInstance.put(`/users/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get dashboard stats
    async getDashboardStats() {
        try {
            const response = await adminAxiosInstance.get('/dashboard/stats');
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

export default new AdminService();