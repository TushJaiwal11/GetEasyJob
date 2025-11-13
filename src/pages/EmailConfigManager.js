import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const EmailConfigManager = () => {
    const [configs, setConfigs] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        subject: '',
        mailBody: '',
        appPassword: ''
    });

    // Fetch all email configs
    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await userService.getEmailConfigs();
            // API returns { success, message, data } => handle accordingly
            if (res.success) {
                setConfigs(res.data);
            } else {
                toast.error(res.message || 'Failed to load email configurations.');
            }
        } catch (error) {
            toast.error('Failed to fetch email configurations.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, subject, mailBody, appPassword } = formData;
        if (!email || !subject || !mailBody || !appPassword) {
            toast.error('All fields are required.');
            return;
        }

        try {
            let res;
            if (isEditMode && selectedConfigId) {
                res = await userService.updateEmailConfig(selectedConfigId, formData);
            } else {
                res = await userService.createEmailConfig(formData);
            }

            if (res.success) {
                toast.success(isEditMode ? 'Configuration updated!' : 'Configuration created!');
                setShowModal(false);
                setIsEditMode(false);
                setFormData({ email: '', subject: '', mailBody: '', appPassword: '' });
                fetchConfigs();
            } else {
                toast.error(res.message || 'Failed to save configuration.');
            }
        } catch (error) {
            toast.error('Error while saving configuration.');
            console.error(error);
        }
    };

    const handleEdit = (config) => {
        setFormData({
            email: config.senderEmailId || config.email,
            subject: config.subject,
            mailBody: config.mailBody,
            appPassword: config.appPassword
        });
        setSelectedConfigId(config.id);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) return;
        try {
            const res = await userService.deleteEmailConfig(id);
            if (res.success) {
                toast.success('Configuration deleted.');
                fetchConfigs();
            } else {
                toast.error(res.message || 'Failed to delete configuration.');
            }
        } catch (error) {
            toast.error('Error deleting configuration.');
            console.error(error);
        }
    };

    const handleUseConfig = (config) => {
        localStorage.setItem('selectedEmailConfig', JSON.stringify(config));
        navigate('/email-share', {
            state: { selectedConfig: config, configId: config.id }
        });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

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
                        {configs.length > 0 ? (
                            configs.map((config) => (
                                <div
                                    key={config.id}
                                    className="border p-4 rounded shadow bg-white w-full sm:w-[48%] md:w-[45%] lg:w-[32%] xl:w-[30%]"
                                >
                                    <p><strong>Email:</strong> {config.senderEmailId || config.email}</p>
                                    <p><strong>Subject:</strong> {config.subject}</p>
                                    <p><strong>Mail Body:</strong></p>
                                    <p className="whitespace-pre-wrap break-words">{config.mailBody}</p>

                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => handleUseConfig(config)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Use
                                        </button>
                                        <button
                                            onClick={() => handleEdit(config)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(config.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No configurations found.</p>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setFormData({ email: '', subject: '', mailBody: '', appPassword: '' });
                            setSelectedConfigId(null);
                            setIsEditMode(false);
                            setShowModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
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
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
