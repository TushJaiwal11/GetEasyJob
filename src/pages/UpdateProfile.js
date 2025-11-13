import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center mt-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
    </div>
);

const UpdateProfile = () => {
    const [userData, setUserData] = useState({
        id: '',
        fullName: '',
        gender: '',
        email: '',
        phone: '',
        jobRole: '',
        subscriptionPurchaseDate: null,
        subscriptionExpiryDate: null,
        activeSubscription: 0,
        referralCode: '',
        modified: null,
    });

    const [loading, setLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const navigate = useNavigate();

    const { isAuthenticated, user, refreshUserProfile } = useAuth();

    // Cleanup function for blob URLs
    const cleanupBlobUrl = useCallback((url) => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }, []);

    const fetchProfile = useCallback(async (forceRefresh = false) => {
        try {
            const profileData = await userService.getProfile();
            setUserData(profileData);

            // Cleanup old preview URL before setting new one
            if (previewUrl) {
                cleanupBlobUrl(previewUrl);
            }

            if (profileData.imageUrl) {
                // Add timestamp to force cache bypass
                const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
                const imageBase64 = await userService.getUserProfileImage(profileData.id + timestamp);
                setPreviewUrl(imageBase64);
            } else {
                setPreviewUrl(null);
            }
            setLoading(false);
        } catch (error) {
            showErrorToast(error, "Failed to fetch profile");
            setLoading(false);
            navigate('/login');
        }
    }, [navigate, cleanupBlobUrl]);

    useEffect(() => {
        fetchProfile();

        // Cleanup on unmount
        return () => {
            if (previewUrl) {
                cleanupBlobUrl(previewUrl);
            }
        };
    }, []);

    const showErrorToast = (error, fallbackMessage) => {
        const backendError = error?.response?.data?.error || error?.message;
        toast.error(backendError || fallbackMessage || "An error occurred");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            const updatedUser = await userService.updateProfile(userData.id, userData);
            toast.success('Profile updated successfully!');
            setUserData(updatedUser);
            setIsEditable(false);
        } catch (error) {
            showErrorToast(error, "Profile update failed");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            // Cleanup old preview
            if (previewUrl && previewUrl.startsWith('blob:')) {
                cleanupBlobUrl(previewUrl);
            }

            setSelectedImage(file);
            // Create new preview
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
        } else {
            toast.warn("Please select a valid image file.");
        }
    };

    const uploadImage = async () => {
        if (!selectedImage) {
            toast.warn("Please select an image to upload!");
            return;
        }

        try {
            const response = await userService.uploadProfileImage(selectedImage);

            // Instantly show the new image from backend
            if (response.imageUrl) {
                setPreviewUrl(response.imageUrl + '?t=' + Date.now());
                await refreshUserProfile(); // This will update Navbar instantly
            }

            setSelectedImage(null);
            toast.success(response.message || 'Image uploaded successfully!');
        } catch (error) {
            showErrorToast(error, "Image upload failed");
        }
    };



    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex bg-gray-100 min-h-screen p-6">
            {/* Sidebar */}
            <div className="w-1/4 bg-white rounded-md shadow-md p-4">
                <div className="text-center mb-6">
                    {previewUrl ? (
                        <div className="relative w-28 h-28 mx-auto">
                            <img
                                key={previewUrl} // Force re-render on URL change
                                src={previewUrl}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-blue-200 shadow-md"
                            />
                            <label
                                htmlFor="imageUpload"
                                className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow hover:bg-blue-700 transition"
                            >
                                ✎
                            </label>
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/jpeg, image/png, image/webp, image/gif"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="relative w-28 h-28 mx-auto">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-200 shadow-md">
                                <span className="text-white text-4xl font-bold">
                                    {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : '?'}
                                </span>
                            </div>
                            <label
                                htmlFor="imageUpload"
                                className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow hover:bg-blue-700 transition"
                            >
                                +
                            </label>
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/jpeg, image/png, image/webp, image/gif"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    )}

                    {selectedImage && (
                        <button
                            onClick={uploadImage}
                            className="mt-4 px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
                        >
                            Upload Image
                        </button>
                    )}

                    <h2 className="font-semibold mt-4 text-gray-600">Hello,</h2>
                    <h1 className="text-xl font-bold text-blue-700 truncate max-w-full">{userData.fullName}</h1>
                </div>

                {userData.referralCode && (
                    <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                        <span className="font-medium">Referral Code:</span>
                        <span
                            className="text-blue-800 font-semibold cursor-pointer hover:underline"
                            title="Click to copy"
                            onClick={() => {
                                navigator.clipboard.writeText(userData.referralCode);
                                toast.success('Referral code copied!');
                            }}
                        >
                            {userData.referralCode}
                        </span>
                    </div>
                )}

                {userData.activeSubscription === 1 && (
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                        <h3 className="font-semibold text-blue-800 mb-2">📅 Subscription Details</h3>
                        <div className="mb-1">
                            <span className="font-medium text-gray-700">Start:</span>{' '}
                            <span className="text-gray-900">
                                {new Date(userData.subscriptionPurchaseDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Expires:</span>{' '}
                            <span className="text-red-600">
                                {new Date(userData.subscriptionExpiryDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}

                {userData.modified && (
                    <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                        <h3 className="font-semibold text-gray-800 mb-2">🕒 Last profile update</h3>
                        <div className="text-gray-700">
                            {new Date(userData.modified).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Profile Form */}
            <div className="w-3/4 bg-white ml-6 rounded-md shadow-md p-6">
                <div className="mb-6 border-b pb-2 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Personal Information</h2>
                    <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setIsEditable((prev) => !prev)}
                    >
                        {isEditable ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        name="fullName"
                        value={userData.fullName}
                        onChange={handleChange}
                        className="border rounded-md px-3 py-2"
                        placeholder="Full Name"
                        disabled={!isEditable}
                    />
                </div>

                <div className="mb-6">
                    <label className="block font-medium mb-1">Your Gender</label>
                    <div className="space-x-6">
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={userData.gender === 'Male'}
                                onChange={handleChange}
                                className="mr-1"
                                disabled={!isEditable}
                            />
                            Male
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={userData.gender === 'Female'}
                                onChange={handleChange}
                                className="mr-1"
                                disabled={!isEditable}
                            />
                            Female
                        </label>
                    </div>
                </div>

                <div className="mb-6 border-b pb-2">
                    <h2 className="text-lg font-bold">Email Address</h2>
                    <input
                        name="email"
                        value={userData.email}
                        className="border rounded-md px-3 py-2 mt-2 w-full bg-gray-100"
                        disabled
                    />
                </div>

                <div className="mb-6 border-b pb-2">
                    <h2 className="text-lg font-bold">Mobile Number</h2>
                    <input
                        name="phone"
                        value={userData.phone}
                        onChange={handleChange}
                        className="border rounded-md px-3 py-2 mt-2 w-full"
                        placeholder="Mobile Number"
                        disabled={!isEditable}
                    />
                </div>

                <div className="mb-6 border-b pb-2">
                    <h2 className="text-lg font-bold">Job Role</h2>
                    <input
                        name="jobRole"
                        value={userData.jobRole}
                        onChange={handleChange}
                        className="border rounded-md px-3 py-2 mt-2 w-full"
                        placeholder="Job Role"
                        disabled={!isEditable}
                    />
                </div>

                {isEditable && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                )}

                <ToastContainer />
            </div>
        </div>
    );
};

export default UpdateProfile;