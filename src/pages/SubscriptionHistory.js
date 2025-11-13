import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userService from '../services/userService';

const SubscriptionHistory = () => {
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const showBackendError = (err, fallbackMsg) => {
        const error = err?.response?.data?.error || err?.response?.data?.message;
        const details = err?.response?.data?.details;
        const message = error || details || fallbackMsg || (typeof err === 'string' ? err : 'Unexpected error occurred.');
        toast.error(message);
        console.error(message, err);
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const fetchHistory = useCallback(async () => {
        try {
            const subs = await userService.getUserSubscriptions();
            setHistory(Array.isArray(subs) ? subs : []);
        } catch (err) {
            if (err?.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                showBackendError(err, 'Unable to fetch subscription history.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const profile = await userService.getProfile();
                if (!mounted) return;
                setUser(profile);
                await fetchHistory();
            } catch (err) {
                console.error('Profile fetch failed', err);
                if (err?.response?.status === 401) {
                    handleLogout();
                } else {
                    showBackendError(err, 'Failed to fetch profile.');
                    setLoading(false);
                }
            }
        };
        load();

        return () => {
            mounted = false;
        };
    }, [fetchHistory, handleLogout, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-2 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        📜 Subscription History
                    </h1>
                    <p className="text-gray-400">View all your past and active subscriptions</p>
                </div>

                {loading ? (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-lg">Loading subscription history...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* User Info */}
                        {user && (
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-500/20 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Welcome back,</p>
                                            <p className="text-white font-semibold text-lg">{user.fullName}</p>
                                        </div>
                                    </div>
                                    <button
                                            onClick={() => navigate('/upgrade-plan')}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300"
                                    >
                                        Upgrade Plan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Subscriptions Table */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                            {Array.isArray(history) && history.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-900/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Plan Type
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Purchased On
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    Expires On
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {history.map((sub, index) => {
                                                const isActive = (() => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    const expiry = new Date(sub.subscriptionExpiryDate);
                                                    expiry.setHours(0, 0, 0, 0);
                                                    return expiry >= today;
                                                })();

                                                return (
                                                    <tr
                                                        key={index}
                                                        className={`transition-colors duration-200 ${isActive
                                                                ? 'bg-green-900/10 hover:bg-green-900/20'
                                                                : 'hover:bg-gray-800/50'
                                                            }`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-2xl">
                                                                    {sub.planType === 'MONTHLY' ? '📅' : '📆'}
                                                                </span>
                                                                <span className="text-white font-semibold">
                                                                    {sub.planType}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-white font-semibold text-lg">
                                                                ₹{sub.amount}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {isActive ? (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                                                                    ✅ Active
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50">
                                                                    ❌ Expired
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                                            {formatDate(sub.subscriptionPurchaseDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                                            {formatDate(sub.subscriptionExpiryDate)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-700/50 mb-4">
                                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                        No subscription history found
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        You haven't subscribed to any plan yet
                                    </p>
                                    <button
                                                onClick={() => navigate('/upgrade-plan')}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300"
                                    >
                                        Browse Plans
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Summary Stats */}
                        {history.length > 0 && (
                            <div className="grid md:grid-cols-3 gap-6 mt-6">
                                <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-xl p-6 border border-blue-500/30">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-500/20 p-3 rounded-lg">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Total Subscriptions</p>
                                            <p className="text-white text-2xl font-bold">{history.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl p-6 border border-green-500/30">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Active Plans</p>
                                            <p className="text-white text-2xl font-bold">
                                                {history.filter(sub => {
                                                    const today = new Date();
                                                    const expiry = new Date(sub.subscriptionExpiryDate);
                                                    return expiry >= today;
                                                }).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 rounded-xl p-6 border border-purple-500/30">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-purple-500/20 p-3 rounded-lg">
                                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Total Spent</p>
                                            <p className="text-white text-2xl font-bold">
                                                ₹{history.reduce((sum, sub) => sum + (sub.amount || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default SubscriptionHistory;