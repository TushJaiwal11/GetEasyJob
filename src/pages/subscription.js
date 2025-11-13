import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userService from '../services/userService';

const Subscription = () => {
    const [user, setUser] = useState(null);
    const [referralPoints, setReferralPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadUserData();
    }, [navigate]);

    const loadUserData = async () => {
        try {
            const [profile, points] = await Promise.all([
                userService.getProfile(),
                userService.getReferralPoints()
            ]);
            setUser(profile);
            setReferralPoints(points.totalPoints || 0);
        } catch (error) {
            console.error('Error loading user data:', error);
            toast.error('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = (originalPrice) => {
        const discountedPrice = Math.max(0, originalPrice - referralPoints);
        return discountedPrice;
    };

    const handleSubscribe = async (planType) => {
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        setProcessingPlan(planType);

        try {
            const originalPrice = planType === 'MONTHLY' ? 100 : 250;
            const finalPrice = calculatePrice(originalPrice);

            // Store subscription data
            sessionStorage.setItem('pendingSubscription', JSON.stringify({
                planType,
                totalReferralPoints: referralPoints
            }));

            // Create order
            const orderData = await userService.subscribeToPlan({
                userId: user.id,
                email: user.email,
                planType,
                referredBy: user.referredBy,
                totalReferralPoints: referralPoints
            });

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: orderData.key,
                    amount: orderData.amount * 100,
                    currency: orderData.currency,
                    name: 'Hire Hunt',
                    description: `${planType} Plan Subscription`,
                    order_id: orderData.orderId,
                    handler: function (response) {
                        const params = new URLSearchParams({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            subscription_id: orderData.subscriptionId
                        });
                        window.location.href = `/upgrade/success?${params.toString()}`;
                    },
                    prefill: {
                        name: user.fullName,
                        email: user.email,
                        contact: user.phone || ''
                    },
                    theme: {
                        color: '#3B82F6'
                    },
                    modal: {
                        ondismiss: function () {
                            setProcessingPlan(null);
                            toast.info('Payment cancelled');
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + response.error.description);
                    setProcessingPlan(null);
                });
                rzp.open();
            };

        } catch (error) {
            console.error('Subscription error:', error);
            toast.error(error.response?.data?.message || 'Failed to process subscription');
            setProcessingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading plans...</p>
                </div>
            </div>
        );
    }

    const plans = [
        {
            type: 'MONTHLY',
            name: 'Monthly Plan',
            originalPrice: 100,
            icon: '📅',
            features: [
                'Valid for 1 month',
                'All premium features',
                'Email support',
                'Regular updates'
            ],
            popular: false
        },
        {
            type: 'QUATARLY',
            name: 'Quarterly Plan',
            originalPrice: 250,
            icon: '📆',
            features: [
                'Valid for 3 months',
                'All premium features',
                'Priority support',
                'Early access to new features',
                'Best value for money'
            ],
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Plan</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Select the perfect plan for your needs</p>

                    {/* Referral Points Display */}
                    {referralPoints > 0 && (
                        <div className="mt-6 inline-block bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl px-6 py-3">
                            <p className="text-green-400 font-semibold">
                                🎉 You have <span className="text-2xl">{referralPoints}</span> referral points!
                            </p>
                            <p className="text-green-300 text-sm mt-1">Use them to get instant discount</p>
                        </div>
                    )}
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => {
                        const finalPrice = calculatePrice(plan.originalPrice);
                        const discount = plan.originalPrice - finalPrice;
                        const isProcessing = processingPlan === plan.type;

                        return (
                            <div
                                key={plan.type}
                                className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-2 border-purple-500' : 'border border-gray-700'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-lg font-semibold text-sm">
                                        🔥 POPULAR
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Plan Header */}
                                    <div className="text-center mb-6">
                                        <div className="text-6xl mb-4">{plan.icon}</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                                        {/* Pricing */}
                                        <div className="space-y-2">
                                            {discount > 0 && (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span className="text-gray-400 line-through text-xl">₹{plan.originalPrice}</span>
                                                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-semibold">
                                                        Save ₹{discount}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-baseline justify-center">
                                                <span className="text-5xl font-bold text-white">₹{finalPrice}</span>
                                                <span className="text-gray-400 ml-2">
                                                    {plan.type === 'MONTHLY' ? '/month' : '/3 months'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start text-gray-300">
                                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Subscribe Button */}
                                    <button
                                        onClick={() => handleSubscribe(plan.type)}
                                        disabled={isProcessing}
                                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${plan.popular
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            'Subscribe Now'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/user/subscription-history')}
                        className="text-gray-400 hover:text-white transition-colors duration-300 underline"
                    >
                        View Subscription History
                    </button>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default Subscription;