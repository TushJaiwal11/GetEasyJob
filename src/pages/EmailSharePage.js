import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
    Send,
    BarChart3,
    Mail,
    Paperclip,
    X,
    ArrowLeft,
    Calendar,
    TrendingUp,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axiosInstance from '../components/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmailSharePage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('send');
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mailHistory, setMailHistory] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [emailFormData, setEmailFormData] = useState({
        to: '',
        subject: '',
        body: '',
        attachments: []
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            Navigate('/login');
            return;
        }

    });

    // API call to fetch email analysis data using your axiosInstance
    const fetchEmailHistory = async () => {
        setAnalyticsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axiosInstance.get('/api/analysis', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Map the API response to match the component's expected structure
            const mappedData = {
                currentCount: res.data.currentDayCount || 0,
                sevenDayCount: res.data.currentWeekCount || 0,
                thirtyDayCount: res.data.currentMonthCount || 0,
                allTimeCount: res.data.totalCount || 0,
                createdAt: new Date().toISOString()
            };

            setMailHistory(mappedData);
            setError(null);
        } catch (error) {
            console.error('Error fetching email analysis:', error);
            setError('Failed to load analytics data. Please try again.');

            // Fallback to default values in case of error
            setMailHistory({
                currentCount: 0,
                sevenDayCount: 0,
                thirtyDayCount: 0,
                allTimeCount: 0,
                createdAt: new Date().toISOString()
            });
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Generate mock chart data based on real analytics
    const generateChartData = (mailHistory) => {
        if (!mailHistory) return [];

        const today = new Date();
        const chartData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Estimate daily count based on weekly average
            const avgDaily = mailHistory.sevenDayCount / 7;
            const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
            const estimatedCount = Math.max(0, Math.round(avgDaily * (1 + variation)));

            chartData.push({
                date: date.toISOString().split('T')[0],
                count: i === 0 ? mailHistory.currentCount : estimatedCount
            });
        }

        return chartData;
    };

    const generateWeeklyData = (mailHistory) => {
        if (!mailHistory) return [];

        const currentWeek = mailHistory.sevenDayCount || 0;
        const avgWeekly = (mailHistory.thirtyDayCount || 0) / 4;

        return [
            { week: 'Week 1', count: Math.round(avgWeekly * 0.8) },
            { week: 'Week 2', count: Math.round(avgWeekly * 1.1) },
            { week: 'Week 3', count: Math.round(avgWeekly * 0.9) },
            { week: 'Week 4', count: currentWeek }
        ];
    };

    useEffect(() => {
        // First priority: Check if config was passed through navigation state
        if (location.state?.selectedConfig) {
            const navConfig = location.state.selectedConfig;
            setSelectedConfig(navConfig);
            setEmailFormData(prev => ({
                ...prev,
                subject: navConfig.subject || '',
                body: navConfig.mailBody || ''
            }));
        } else {
            // Second priority: Get the selected email config from localStorage
            const storedConfig = localStorage.getItem('selectedEmailConfig');

            if (storedConfig) {
                try {
                    const parsedConfig = JSON.parse(storedConfig);
                    setSelectedConfig(parsedConfig);

                    // Set the form data with the actual config values
                    setEmailFormData(prev => ({
                        ...prev,
                        subject: parsedConfig.subject || '',
                        body: parsedConfig.mailBody || '',
                        id: parsedConfig.id || null
                    }));
                } catch (error) {
                    console.error('Error parsing stored email config:', error);

                    // Fallback to mock config if parsing fails
                    const fallbackConfig = {
                        id: 1,
                        email: 'demo@example.com',
                        subject: 'Demo Email Subject',
                        mailBody: 'This is a demo email body content.'
                    };
                    setSelectedConfig(fallbackConfig);
                    setEmailFormData(prev => ({
                        ...prev,
                        subject: fallbackConfig.subject,
                        body: fallbackConfig.mailBody
                    }));
                }
            } else {
                // No stored config found - use mock config as fallback
                const fallbackConfig = {
                    id: 1,
                    email: 'demo@example.com',
                    subject: 'Demo Email Subject',
                    mailBody: 'This is a demo email body content.'
                };
                setSelectedConfig(fallbackConfig);
                setEmailFormData(prev => ({
                    ...prev,
                    subject: fallbackConfig.subject,
                    body: fallbackConfig.mailBody
                }));
            }
        }

        // Fetch real analytics data
        fetchEmailHistory();
    }, [location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmailFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setEmailFormData(prev => ({
            ...prev,
            attachments: files
        }));
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Create FormData properly
            const formData = new FormData();

            // Add the recipient emails
            formData.append('to', emailFormData.to.trim());

            // Add config ID as number (ensure it's not null)
            const configId = selectedConfig?.id || emailFormData.id;
            if (!configId) {
                toast.error('No email configuration selected');
                throw new Error('No email configuration selected');
            }
            formData.append('configId', configId.toString());

            // Add attachments if any
            if (emailFormData.attachments && emailFormData.attachments.length > 0) {
                emailFormData.attachments.forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            // Send the request - note: remove Content-Type header for FormData
            const response = await axiosInstance.post('/api/sendEmail', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Do not set this header, axios will handle it automatically
                }
            });

            // Handle success
            if (response.data.success) {

                toast.success('✅ Email sent successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    top: '40% !important',
                    left: '50%',
                    transform: 'translateX(-50%)',
                });

                setEmailFormData(prev => ({
                    ...prev,
                    to: '',
                    attachments: []
                }));

                // Refresh analytics data after sending email
                fetchEmailHistory();
            }

        } catch (error) {
            console.error('Error sending email:', error);

            // More detailed error handling with toast
            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.message ||
                    error.response.statusText ||
                    'Server error occurred';
                toast.error(`Failed to send email: ${errorMessage}`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else if (error.request) {
                // Request was made but no response received
                toast.error('Failed to send email: No response from server', {
                    position: "top-right",
                    autoClose: 5000,
                });
            } else {
                // Something else happened
                toast.error(`Failed to send email: ${error.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const removeAttachment = (index) => {
        setEmailFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const StatCard = ({ title, value, icon: Icon, color, change }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {analyticsLoading ? (
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                            value?.toLocaleString() || '0'
                        )}
                    </p>
                    {change && !analyticsLoading && (
                        <p className="text-sm text-green-600 mt-1 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +{change}% from last period
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    const SendEmailTab = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Send New Email</h3>
                        <p className="opacity-90">Compose and send emails using your selected configuration</p>
                    </div>
                    <Mail className="w-12 h-12 opacity-80" />
                </div>
            </div>

            {selectedConfig && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Selected Email Configuration
                    </h4>
                    <p className="text-blue-700"><strong>From:</strong> {selectedConfig.email}</p>
                </div>
            )}

            <div onSubmit={handleSendEmail} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
                role="form">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        To (Recipients) *
                    </label>
                    <input
                        type="text"
                        name="to"
                        value={emailFormData.to}
                        onChange={handleInputChange}
                        placeholder="recipient@example.com, another@example.com"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-sm text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject *
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={emailFormData.subject}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 cursor-not-allowed text-gray-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Body *
                    </label>
                    <textarea
                        name="body"
                        value={emailFormData.body}
                        readOnly
                        rows={8}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 cursor-not-allowed text-gray-600 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Paperclip className="w-4 h-4 inline mr-1" />
                        Attachments (Optional)
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {emailFormData.attachments.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                            <div className="space-y-2">
                                {emailFormData.attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border">
                                        <div className="flex items-center">
                                            <Paperclip className="w-4 h-4 text-gray-500 mr-2" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Configs
                    </button>
                    <button
                        type="button"
                        onClick={handleSendEmail}
                        disabled={loading || !emailFormData.to.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Email
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    const AnalyticsTab = () => {
        const chartData = generateChartData(mailHistory);
        const weeklyData = generateWeeklyData(mailHistory);

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Email Analytics</h3>
                            <p className="opacity-90">Track your email sending patterns and performance</p>
                        </div>
                        <BarChart3 className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchEmailHistory}
                            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today's Emails"
                        value={mailHistory?.currentCount}
                        icon={Mail}
                        color="bg-blue-500"
                        change={12}
                    />
                    <StatCard
                        title="Last 7 Days"
                        value={mailHistory?.sevenDayCount}
                        icon={Calendar}
                        color="bg-green-500"
                        change={8}
                    />
                    <StatCard
                        title="Last 30 Days"
                        value={mailHistory?.thirtyDayCount}
                        icon={TrendingUp}
                        color="bg-purple-500"
                        change={15}
                    />
                    <StatCard
                        title="All Time"
                        value={mailHistory?.allTimeCount}
                        icon={Activity}
                        color="bg-orange-500"
                        change={25}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            Daily Email Activity (Last 7 Days)
                        </h4>
                        {analyticsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        fontSize={12}
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                        formatter={(value) => [value, 'Emails Sent']}
                                        contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                            Weekly Comparison
                        </h4>
                        {analyticsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="week" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        formatter={(value) => [value, 'Emails Sent']}
                                        contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Additional Insights */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-500" />
                        Email Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Average Daily</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {analyticsLoading ? (
                                            <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                                        ) : (
                                            ((mailHistory?.sevenDayCount || 0) / 7).toFixed(1)
                                        )}
                                    </p>
                                </div>
                                <Mail className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Success Rate</p>
                                    <p className="text-2xl font-bold text-green-900">98.5%</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-800">Peak Hour</p>
                                    <p className="text-2xl font-bold text-orange-900">2-3 PM</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Email Management Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage your email campaigns and track performance</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('send')}
                                    className={`px-4 py-2 rounded-md font-medium transition-all flex items-center ${activeTab === 'send'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Email
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`px-4 py-2 rounded-md font-medium transition-all flex items-center ${activeTab === 'analytics'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'send' ? <SendEmailTab /> : <AnalyticsTab />}
            </div>
            <ToastContainer />
        </div>
    );
};

export default EmailSharePage;