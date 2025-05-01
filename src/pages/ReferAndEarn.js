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

    const handleAuthError = (err) => {
        if (err?.response?.status === 401) {
            toast.error('Session expired. Please login again.');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProfile(token);
        fetchReferralPoints(token);
    });

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
                handleAuthError(err);
            });
    };

    const fetchReferralPoints = (token) => {
        axiosInstance
            .get('/api/referral/points', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const points = res.data?.totalPoint ?? 0;
                setTotalPoints(points);
            })
            .catch((err) => {
                setLoading(false);
                handleAuthError(err);
            });
    };

    const fetchReferredUsers = (code, token) => {
        axiosInstance
            .get(`/api/referral/referred-users`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const users = Array.isArray(res.data) ? res.data : res.data?.users || [];
                setReferredUsers(users);
            })
            .catch(() => {
                setReferredUsers([]);
            });
    };

    const handleCopy = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            toast.success('Referral code copied!');
        }
    };

    const isSubscribed = formData?.activeSubscription === 1;

    // ✅ Spinner Loader
    if (loading) {
        return (
            <div className="flex justify-center items-center h-40 mt-10">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
            </div>
        );
    }
    return (
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto mt-10 gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 bg-white border rounded-xl p-4 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">👥 Your Referrals</h3>

                {/* Points display */}
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-bold text-center py-2 rounded-lg mb-4 shadow-inner">
                    🎁 Total Points Earned: <span className="text-xl">{totalPoints}</span>
                </div>

                {referredUsers.length > 0 ? (
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

                <div className="flex justify-center mb-4">
                    <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1 rounded-full shadow">
                        🎯 1 Point = ₹1
                    </span>
                </div>

                <p className="text-center text-gray-600 mb-6">
                    For every friend who purchases a subscription using your referral code, <br />
                    <span className="font-semibold text-green-600">you earn 20 points!</span>
                </p>

                <div className="text-center mb-6">
                    <span className="text-sm font-semibold text-gray-700">Subscription Status: </span>
                    <span className={`font-bold text-sm ${isSubscribed ? 'text-green-600' : 'text-red-500'}`}>
                        {isSubscribed ? 'Subscribed ✅' : 'Not Subscribed ❌'}
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

                {/* Referral Code */}
                <div className="text-center mb-6">
                    <div className="font-medium text-gray-800 mb-1 text-lg">Your Referral Code</div>
                    <div className="text-2xl font-bold bg-gray-100 border border-dashed border-gray-300 p-3 rounded-md inline-block tracking-widest text-blue-700">
                        {referralCode}
                    </div>

                    <div className="mt-4 flex justify-center space-x-4">
                        <button
                            onClick={handleCopy}
                            disabled={!referralCode}
                            className={`px-5 py-2 text-white rounded-lg transition font-medium ${referralCode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            aria-label="Copy referral code"
                        >
                            Copy Code
                        </button>
                        <a
                            href={`https://wa.me/?text=Join me using this referral code: ${referralCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                            aria-label="Share referral code on WhatsApp"
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
