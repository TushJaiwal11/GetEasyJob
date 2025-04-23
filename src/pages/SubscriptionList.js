import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubscriptionList = () => {
    const [history, setHistory] = useState([]);
    const [isLoggedInState, setIsLoggedInState] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const showBackendError = (err, fallbackMsg) => {
        const error = err?.response?.data?.error;
        const details = err?.response?.data?.details;
        const message = error || details || fallbackMsg;
        toast.error(message);
        console.error(message, err);
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('timerStart');
        setIsLoggedInState(false);
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const fetchHistory = (token) => {
        axiosInstance
            .get('/api/user/subscription/history', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setHistory(res.data);
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    showBackendError(err, 'Unexpected error occurred.');
                }
            });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedInState(!!token);

        if (token) {
            axiosInstance
                .get('/api/profile')
                .then((res) => {
                    setUser(res.data);
                    fetchHistory(token);
                })
                .catch((err) => {
                    console.error("Profile fetch failed", err);
                    if (err.response?.status === 401) handleLogout();
                });
        }
    }, [handleLogout]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear().toString().slice(-2);
        return `${day} ${month} '${year}`;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md mt-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">📜 Subscription History</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-3 text-left">Sr.No</th>
                            <th className="p-3 text-left">Plan Type</th>
                            <th className="p-3 text-left">Amount (₹)</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Purchased On</th>
                            <th className="p-3 text-left">Expires On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(history) && history.length > 0 ? (
                            history.map((sub, index) => {
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
                                        className={`border-t transition hover:bg-gray-50 ${
                                            isActive ? 'bg-green-50' : 'bg-red-50'
                                        }`}
                                    >
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3 font-medium">{sub.planType}</td>
                                        <td className="p-3">₹{sub.amount}</td>
                                        <td className={`p-3 font-semibold ${isActive ? 'text-green-600' : 'text-red-500'}`}>
                                            {isActive ? '✅ Active' : '❌ De-Active'}
                                        </td>
                                        <td className="p-3">{formatDate(sub.subscriptionPurchaseDate)}</td>
                                        <td className="p-3">{formatDate(sub.subscriptionExpiryDate)}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-500">
                                    No subscription history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default SubscriptionList;
