import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../components/axiosInstance';

const Subscription = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFormData(res.data);
            } catch (err) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        if (!token) {
            navigate("/login");
        } else {
            fetchProfile();
        }
    }, [navigate]);

    const handleSubscribe = async (planType) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axiosInstance.post(
                `/api/payment/${planType}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const paymentLink = res.data.payment_link_url;
            window.location.href = paymentLink;
        } catch (err) {
            toast.error("Payment link creation failed.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = formData?.subscriptionPlan || 'FREE';

    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center pt-16 px-4 relative">

            {/* 🔄 Full Screen Loader */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin"></div>
                </div>
            )}

            <h1 className="text-4xl font-bold mb-10">Pricing</h1>
            <div className="grid md:grid-cols-3 gap-10 max-w-6xl w-full">
                {/* Free Plan */}
                <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">Free</h2>
                    <p className="text-3xl font-bold mb-4">₹0 <span className="text-sm font-normal">/FREE</span></p>
                    <button className="bg-gray-700 text-white px-4 py-2 rounded cursor-not-allowed mb-4" disabled>
                        Your Current Plan
                    </button>
                    <ul className="text-sm space-y-2 text-center">
                        <li>✓ 5 days PDF access</li>
                        <li>✓ Free 1 month support on issues</li>
                        <li>✓ Project Collaboration</li>
                    </ul>
                </div>

                {/* Monthly */}
                <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border-2 border-white flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">Monthly</h2>
                    <p className="text-3xl font-bold mb-4">₹100 <span className="text-sm font-normal">/MONTH</span></p>
                    <button
                        className="bg-white text-black px-4 py-2 rounded mb-4 font-semibold"
                        onClick={() => handleSubscribe("MONTHLY")}
                        disabled={currentPlan === "MONTHLY" || loading}
                    >
                        {currentPlan === "MONTHLY" ? "Current Plan" : loading ? "Loading..." : "Get Started"}
                    </button>
                    <ul className="text-sm space-y-2 text-center">
                        <li>✓ Advanced Reporting</li>
                        <li>✓ Email & Chat Support</li>
                    </ul>
                </div>

                {/* Quarterly */}
                <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-2">Quarterly</h2>
                    <p className="text-3xl font-bold mb-4">₹250 <span className="text-sm font-normal">/3 MONTHS</span></p>
                    <button
                        className="bg-white text-black px-4 py-2 rounded mb-4 font-semibold"
                        onClick={() => handleSubscribe("QUATARLY")}
                        disabled={currentPlan === "QUATARLY" || loading}
                    >
                        {currentPlan === "QUATARLY" ? "Current Plan" : loading ? "Loading..." : "Get Started"}
                    </button>
                    <ul className="text-sm space-y-2 text-center">
                        <li>✓ All Monthly Features</li>
                        <li>✓ 20% Discount</li>
                        <li>✓ Priority Support</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
