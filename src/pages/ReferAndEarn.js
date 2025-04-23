import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';

const ReferAndEarn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [referredUsers, setReferredUsers] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);

    // ✅ Centralized error handler
    const showBackendError = (err, fallbackMsg) => {
        const error = err?.response?.data?.error;
        const details = err?.response?.data?.details;
        const message = error || details || fallbackMsg;
        toast.error(message);
        console.error(message, err);
    };

    // ✅ Fetch user data and points once on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchProfile(token);
            fetchReferralPoints(token);
        }
    }, []); // ✅ add dependency array to run only once

    const fetchProfile = (token) => {
        axiosInstance
            .get('/api/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const data = res.data;
                setFormData(data);
                setReferralCode(data.referralCode);
                fetchReferredUsers(data.referralCode, token);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                if (err?.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    showBackendError(err, 'Unexpected error occurred.');
                }
            });
    };

    const fetchReferralPoints = (token) => {
        axiosInstance
            .get('/api/referral/points', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const points = res.data?.totalPoint || 0;
                setTotalPoints(points);
            })
            .catch((err) => {
                setLoading(false);
                if (err?.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    showBackendError(err, 'Unexpected error occurred.');
                }
            });
    };

    const fetchReferredUsers = (code, token) => {
        axiosInstance
            .get(`/api/referral/referred-users`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const users = Array.isArray(res.data) ? res.data : res.data.users || [];
                setReferredUsers(users);
            })
            .catch((err) => {
                showBackendError(err, 'Failed to fetch referred users');
                setReferredUsers([]);
            });
    };

    const handleCopy = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            toast.success('Referral code copied!');
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto mt-10 gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 bg-white border rounded-xl p-4 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">👥 Your Referrals</h3>

                {/* Points display */}
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-bold text-center py-2 rounded-lg mb-4 shadow-inner">
                    🎁 Total Points Earned: <span className="text-xl">{totalPoints}</span>
                </div>

                {Array.isArray(referredUsers) && referredUsers.length > 0 ? (
                    <ul className="space-y-3">
                        {referredUsers.map((user, index) => (
                            <li
                                key={index}
                                className="p-2 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                            >
                                <div className="font-medium text-gray-800">{user.fullName || 'Unnamed User'}</div>
                                <div className="text-xs text-gray-500">
                                    Joined: {user.created ? new Date(user.created).toLocaleDateString() : 'N/A'}
                                </div>
                                <div
                                    className={`text-xs font-semibold mt-1 ${user.activeSubscription === 1 ? 'text-green-600' : 'text-red-500'
                                        }`}
                                >
                                    {user.activeSubscription === 1 ? 'Subscribed ✅' : 'Not Subscribed ❌'}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 text-center">No users referred yet.</p>
                )}
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Refer & Earn</h2>

                {/* Highlight Badge */}
                <div className="flex justify-center mb-4">
                    <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1 rounded-full shadow">
                        🎯 1 Point = ₹1
                    </span>
                </div>

                <p className="text-center text-gray-600 mb-6">
                    For every friend who purchases a subscription using your referral code, <br />
                    <span className="font-semibold text-green-600">you earn 20 points!</span>
                </p>

                {/* Subscription Status */}
                <div className="text-center mb-6">
                    <span className="text-sm font-semibold text-gray-700">Subscription Status: </span>
                    <span
                        className={`font-bold text-sm ${formData.activeSubscription === 1 ? 'text-green-600' : 'text-red-500'
                            }`}
                    >
                        {formData.activeSubscription === 1 ? 'Subscribed ✅' : 'Not Subscribed ❌'}
                    </span>
                </div>

                {/* Step 1 */}
                <div className="bg-blue-50 rounded-lg p-5 mb-5 border border-blue-200">
                    <h3 className="font-semibold text-lg text-blue-800 mb-2">Step 1: Friend signs up</h3>
                    <ul className="list-disc list-inside text-sm text-blue-900">
                        <li>✅ You get 5 points</li>
                    </ul>
                </div>

                {/* Step 2 */}
                <div className="bg-green-50 rounded-lg p-5 mb-6 border border-green-200">
                    <h3 className="font-semibold text-lg text-green-800 mb-2">Step 2: Friend completes a subscription</h3>
                    <ul className="list-disc list-inside text-sm text-green-900">
                        <li>✅ You get 20 points</li>
                    </ul>
                </div>

                {/* Referral Code Section */}
                <div className="text-center mb-6">
                    <div className="font-medium text-gray-800 mb-1 text-lg">Your Referral Code</div>
                    <div className="text-2xl font-bold bg-gray-100 border border-dashed border-gray-300 p-3 rounded-md inline-block tracking-widest text-blue-700">
                        {referralCode}
                    </div>

                    <div className="mt-4 flex justify-center space-x-4">
                        <button
                            onClick={handleCopy}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Copy Code
                        </button>
                        <a
                            href={`https://wa.me/?text=Join me using this referral code: ${referralCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                        >
                            Share on WhatsApp
                        </a>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500 italic">
                    🔁 Earn even more when your referrals invite others — it's a chain of rewards!
                </p>
            </div>

            <ToastContainer />
        </div>
    );
};

export default ReferAndEarn;
