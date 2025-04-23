// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout();
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get('/api/admin/subscription-users', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // 🛡 Safe-check: Ensure res.data is an array
                if (Array.isArray(res.data)) {
                    setAllUsers(res.data);
                    setUsers(res.data);
                } else {
                    toast.error("Unexpected response format.");
                    setAllUsers([]);
                    setUsers([]);
                }
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    handleLogout();
                } else {
                    toast.error("Error fetching users");
                    setAllUsers([]);
                    setUsers([]);
                }
            }
        };

        fetchUsers();
    }, [handleLogout]);


    useEffect(() => {
        const filtered = allUsers.filter((user) => {
            const search = keyword.toLowerCase();
            return (
                user.email?.toLowerCase().includes(search) ||
                user.fullName?.toLowerCase().includes(search) ||
                user.activeSubscription?.toString().toLowerCase().includes(search)
            );
        });
        setUsers(keyword ? filtered : allUsers);
    }, [keyword, allUsers]);

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <ToastContainer position="top-right" />
            <h2 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">All Customers</h2>

            <div className="flex mb-6">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search Here..."
                    className="w-64 p-2 text-base rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800 text-base">
                    <thead className="bg-gray-800 text-lg">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">#</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">Image</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">Full Name</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">Email</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">Active Subscription</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">Subscription Expiry</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user, index) => (
                            <tr key={user.id} className="bg-gray-900 hover:bg-gray-800 transition duration-200">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">
                                    {user.image ? (
                                        <img
                                            src={`data:image/jpeg;base64,${user.image}`}
                                            alt="Profile"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                                            {user.fullName?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">{user.fullName}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.activeSubscription || 'NA'}</td>
                                <td className="px-6 py-4">
                                    {user.subscriptionExpiryDate
                                        ? new Date(user.subscriptionExpiryDate).toLocaleDateString()
                                        : 'NA'}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-400 text-lg">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
