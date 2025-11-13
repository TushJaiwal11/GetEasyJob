import userAxiosInstance from './userAxiosInstance';
import userService from './userService';

class ProfileService {
    /**
     * Fetch full user profile with optional image
     * @param {boolean} forceRefresh - If true, bypasses cache by appending timestamp
     * @returns {Promise<Object>} user profile data
     */
    async fetchUserProfile(forceRefresh = false) {
        try {
            // 1️⃣ Get user profile details
            const profileData = await userService.getProfile();

            // 2️⃣ If the user has a profile image, fetch it
            let imageUrl = null;
            if (profileData?.id && profileData?.imageUrl) {
                const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
                const blob = await this.getUserProfileImage(profileData.id + timestamp);
                imageUrl = blob;
            }

            return { ...profileData, imageUrl };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch user profile image by user ID (returns Blob URL)
     * @param {string|number} userId
     * @returns {Promise<string>} Blob URL of image
     */
    async getUserProfileImage(userId) {
        try {
            const response = await userAxiosInstance.get(`/api/users/${userId}/profile/image`, {
                responseType: 'blob',
                headers: { 'Cache-Control': 'no-cache' },
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile image:', error);
            return null;
        }
    }

    /**
     * Centralized error handling for profile-related APIs
     */
    handleError(error) {
        if (error.response) {
            return error.response.data?.message || 'Failed to load profile data';
        } else if (error.request) {
            return 'No response from server. Please try again.';
        } else {
            return error.message || 'Unexpected error occurred';
        }
    }
}

export default new ProfileService();
