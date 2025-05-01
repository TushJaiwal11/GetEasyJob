import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
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
                const res = await axiosInstance.get('/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAllUsers(res.data);
                setUsers(res.data);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    handleLogout();
                } else {
                    handleLogout();
                    toast.error("Error fetching users");
                }
            }
        };

        fetchUsers();
    }, [handleLogout]);

    const handleUpdate = (user) => {
        setSelectedUser({ ...user });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to de-activate this user?")) {
            try {
                const response = await axiosInstance.patch(
                    `/api/admin/deactivate/user/${userId}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }
                );

                toast.success(response.data); // Show backend message in toast
                setAllUsers(prev => prev.filter(user => user.id !== userId));
            } catch (err) {
                const errorMsg = err?.response?.data || "Error deleting user";
                toast.error(errorMsg);
            }
        }
    };


    const handleModalChange = (field, value) => {
        setSelectedUser((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.patch(`/api/admin/update/user/${selectedUser.id}`, selectedUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            toast.success(response.data);
            setShowModal(false);
            window.location.reload();
        } catch (err) {
            toast.error("Update failed");
        }
    };

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
                            <th className="px-6 py-3 text-left font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user, index) => (
                            <tr key={user.id} className="bg-gray-900 hover:bg-gray-800 transition duration-200">
                                <td className="px-6 py-4 text-base">{index + 1}</td>
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
                                <td className="px-6 py-4 text-base">{user.fullName}</td>
                                <td className="px-6 py-4 text-base">{user.email}</td>
                                <td className="px-6 py-4 text-base">{user.activeSubscription || 'NA'}</td>
                                <td className="px-6 py-4 text-base">
                                    {user.subscriptionExpiryDate
                                        ? new Date(user.subscriptionExpiryDate).toLocaleDateString()
                                        : 'NA'}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(user)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                                    >
                                        Deactivate
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-400 text-lg">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup for Update */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="bg-white text-black rounded-lg w-[600px] p-6 shadow-lg overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Update User</h2>
                        <form onSubmit={handleSubmitUpdate} className="space-y-4">
                            <input type="hidden" value={selectedUser.id} />

                            {/* Basic Fields */}
                            {["email", "fullName", "password", "activeSubscription", "referredBy"].map(field => (
                                <div className="flex flex-col" key={field}>
                                    <label className="capitalize">{field}</label>
                                    {field === "activeSubscription" ? (
                                        <select
                                            className="p-2 border border-gray-400 rounded"
                                            value={selectedUser[field] || ""}
                                            onChange={(e) => handleModalChange(field, parseInt(e.target.value))}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Activate</option>
                                            <option value="2">Deactivate</option>
                                        </select>
                                    ) : (
                                        <input
                                            className="p-2 border border-gray-400 rounded"
                                            type={field === "password" ? "password" : "text"}
                                            value={selectedUser[field] || ""}
                                            onChange={(e) => handleModalChange(field, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Password Validity Field */}
                            <div className="flex flex-col">
                                <label className="capitalize">Password Validity</label>
                                <input
                                    className="p-2 border border-gray-400 rounded"
                                    type="datetime-local"
                                    value={selectedUser["passwordValidity"] ? new Date(selectedUser["passwordValidity"]).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => handleModalChange("passwordValidity", e.target.value)}
                                />
                            </div>

                            {/* Update Plan Field */}
                            <div className="flex flex-col">
                                <label className="capitalize">Update Plan</label>
                                <select
                                    className="p-2 border border-gray-400 rounded"
                                    value={selectedUser.planType || ""}
                                    onChange={(e) => handleModalChange("planType", e.target.value)}
                                >
                                    <option value="">Select Plan</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-600 px-4 py-2 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-700 px-4 py-2 text-white rounded"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Users;
