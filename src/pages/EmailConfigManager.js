import React, { useEffect, useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';

const EmailConfigManager = () => {
    const [configs, setConfigs] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true); // ✅ loading state added

    const [formData, setFormData] = useState({
        id: '',
        email: '',
        subject: '',
        mailBody: '',
        appPassword: ''
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true); // ✅ Start loading
        const token = localStorage.getItem('token');
        try {
            const res = await axiosInstance.get('/api/getAllMailConfig', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConfigs(res.data);
        } catch (error) {
            toast.error('Failed to fetch email configurations.');
            console.error(error);
        } finally {
            setLoading(false); // ✅ Stop loading
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const isUpload = !isEditMode;

        const headers = {
            Authorization: `Bearer ${token}`
        };

        let payload;

        if (isUpload) {
            payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value);
            });
            headers['Content-Type'] = 'multipart/form-data';
        } else {
            payload = formData;
        }

        const endpoint = isUpload
            ? '/api/upload'
            : `/api/updateConfig/${selectedConfigId}`;

        try {
            const res = await axiosInstance.post(endpoint, payload, { headers });
            if (res?.data?.error) {
                toast.error('Failed to save email configuration.');
            } else {
                toast.success(isUpload ? 'Uploaded!' : 'Updated!');
                setShowModal(false);
                setIsEditMode(false);
                setFormData({ id: '', email: '', subject: '', mailBody: '', appPassword: '' });
                fetchConfigs();
            }
        } catch (error) {
            toast.error('Error while saving configuration.');
            console.error(error);
        }
    };

    const handleEdit = (config) => {
        setFormData({
            email: config.email,
            subject: config.subject,
            mailBody: config.mailBody,
            appPassword: config.appPassword
        });
        setSelectedConfigId(config.id);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axiosInstance.delete(`/api/deleteConfig/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res?.data?.error) {
                toast.error('Failed to delete email configuration.');
            } else {
                toast.success('Configuration deleted.');
                fetchConfigs();
            }
        } catch (error) {
            toast.error('Failed to delete configuration.');
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Email Configurations</h2>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-4 mb-6">
                        {configs.map((config) => (
                            <div
                                key={config.id}
                                className="border p-4 rounded shadow bg-white w-full sm:w-[48%] md:w-[45%] lg:w-[32%] xl:w-[100%] break-words"
                            >
                                <p><strong>Email:</strong> {config.email}</p>
                                <p><strong>Subject:</strong> {config.subject}</p>
                                <p><strong>Mail Body:</strong></p>
                                <p className="whitespace-pre-wrap">{config.mailBody}</p>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(config)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(config.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setFormData({ email: '', subject: '', mailBody: '', appPassword: '' });
                            setSelectedConfigId(null);
                            setIsEditMode(false);
                            setShowModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Add New Config
                    </button>
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[90%] max-w-lg">
                        <h3 className="text-lg font-bold mb-4">
                            {isEditMode ? 'Edit Email Config' : 'New Email Config'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            />
                            <input
                                name="subject"
                                placeholder="Subject"
                                required
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            />
                            <textarea
                                name="mailBody"
                                placeholder="Mail Body"
                                required
                                value={formData.mailBody}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                                rows={4}
                            />
                            <input
                                name="appPassword"
                                placeholder="App Password"
                                required
                                value={formData.appPassword}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEditMode(false);
                                        setFormData({ email: '', subject: '', mailBody: '', appPassword: '' });
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    {isEditMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default EmailConfigManager;
