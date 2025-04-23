import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
    const [user, setUser] = useState({
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

    useEffect(() => {
        fetchProfile(); // fetch profile when component mounts
        fetchSubscriptionDetails(); // fetch subscription when component mounts

        const interval = setInterval(() => {
            fetchSubscriptionDetails(); // fetch subscription every 30 mins
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(interval); // clean up interval when the component unmounts
    }, []);

    const fetchProfile = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axiosInstance
                .get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setUser(res.data);
                    if (res.data.image) {
                        const imageBase64 = `data:image/jpeg;base64,${res.data.image}`;
                        setPreviewUrl(imageBase64);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    showErrorToast(err, "Failed to fetch profile");
                    setLoading(false);
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    };

    const fetchSubscriptionDetails = () => {
        const token = localStorage.getItem('token');
        if (token) {
            axiosInstance
                .get('/user/subscription', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    const subscription = res.data;
                    setUser((prev) => ({
                        ...prev,
                        subscriptionPurchaseDate: subscription.purchaseDate,
                        subscriptionExpiryDate: subscription.expiryDate,
                        activeSubscription: subscription.active ? 1 : 0
                    }));
                })
                .catch((err) => {
                    console.error('Error fetching subscription:', err);
                    toast.error('Failed to fetch subscription');
                });
        }
    };

    const showErrorToast = (error, fallbackMessage) => {
        const backendError = error?.response?.data?.error;
        toast.error(backendError || fallbackMessage || "An error occurred");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = () => {
        const token = localStorage.getItem('token');
        axiosInstance
            .patch(`/api/profile/update/${user.id}`, user, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                toast.success('Profile updated successfully!');
                setUser(res.data);
                setIsEditable(false);
            })
            .catch((error) => {
                showErrorToast(error, "Profile update failed");
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            toast.warn("Please select a valid image file.");
        }
    };

    const uploadImage = () => {
        if (!selectedImage) {
            toast.warn("Please select an image to upload!");
            return;
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', selectedImage);

        axiosInstance
            .patch('/api/profile/upload-image', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(() => {
                setSelectedImage(null);
                fetchProfile(); // refresh image from server
                toast.success('Image uploaded successfully!');
            })
            .catch((err) => {
                showErrorToast(err, "Image upload failed");
            });
    };

    if (loading) return <div className="text-center mt-10 text-lg">Loading profile...</div>;

    return (
        <div className="flex bg-gray-100 min-h-screen p-6">
            {/* Sidebar */}
            <div className="w-1/4 bg-white rounded-md shadow-md p-4">
                <div className="text-center mb-6">
                    <div className="relative w-28 h-28 mx-auto">
                        <img
                            src={previewUrl || '/default-avatar.png'}
                            alt="Avatar"
                            onError={(e) => (e.target.src = '/default-avatar.png')}
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

                    <button
                        onClick={uploadImage}
                        className="mt-4 px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
                    >
                        Upload Image
                    </button>

                    <h2 className="font-semibold mt-4 text-gray-600">Hello,</h2>
                    <h1 className="text-xl font-bold text-blue-700 truncate max-w-full">{user.fullName}</h1>
                </div>

                {user.referralCode && (
                    <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                        <span className="font-medium">Referral Code:</span>
                        <span
                            className="text-blue-800 font-semibold cursor-pointer hover:underline"
                            title="Click to copy"
                            onClick={() => {
                                navigator.clipboard.writeText(user.referralCode);
                                toast.success('Referral code copied!');
                            }}
                        >
                            {user.referralCode}
                        </span>
                    </div>
                )}

                {user.activeSubscription === 1 && (
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                        <h3 className="font-semibold text-blue-800 mb-2">📅 Subscription Details</h3>
                        <div className="mb-1">
                            <span className="font-medium text-gray-700">Start:</span>{' '}
                            <span className="text-gray-900">
                                {new Date(user.subscriptionPurchaseDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Expires:</span>{' '}
                            <span className="text-red-600">
                                {new Date(user.subscriptionExpiryDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}

                {user.modified && (
                    <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                        <h3 className="font-semibold text-gray-800 mb-2">🕒 Last profile update</h3>
                        <div className="text-gray-700">
                            {new Date(user.modified).toLocaleDateString()}
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
                        value={user.fullName}
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
                                checked={user.gender === 'Male'}
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
                                checked={user.gender === 'Female'}
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
                        value={user.email}
                        className="border rounded-md px-3 py-2 mt-2 w-full bg-gray-100"
                        disabled
                    />
                </div>

                <div className="mb-6 border-b pb-2">
                    <h2 className="text-lg font-bold">Mobile Number</h2>
                    <input
                        name="phone"
                        value={user.phone}
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
                        value={user.jobRole}
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
