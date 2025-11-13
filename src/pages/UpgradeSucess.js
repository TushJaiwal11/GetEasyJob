import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userService from '../services/userService';

const UpgradeSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    verifyPayment();
  }, [location.search, navigate]);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      const queryParams = new URLSearchParams(location.search);

      const razorpayOrderId = queryParams.get("razorpay_order_id");
      const razorpayPaymentId = queryParams.get("razorpay_payment_id");
      const razorpaySignature = queryParams.get("razorpay_signature");
      const subscriptionId = Number(queryParams.get("subscription_id"));
      const storedData = JSON.parse(sessionStorage.getItem('pendingSubscription') || '{}');

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        setError("Missing payment details. Please try again.");
        setLoading(false);
        return;
      }

      const profile = await userService.getProfile();

      const verificationData = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        subscriptionId,
        userId: profile.id,
        email: profile.email,
        planType: storedData.planType,
        referredBy: profile.referredBy,
        totalReferralPoints: storedData.totalReferralPoints || 0
      };

      const response = await userService.verifyPayment(verificationData);

      if (response.success) {
        const currentSub = await userService.getCurrentSubscription();

        setSubscriptionDetails({
          planType: currentSub.planType,
          startDate: currentSub.subscriptionPurchaseDate,
          endDate: currentSub.subscriptionExpiryDate,
          subscriptionStatus: currentSub.subscriptionStatus,
          paymentId: razorpayPaymentId
        });

        sessionStorage.removeItem('pendingSubscription');
        toast.success('Payment verified successfully! 🎉');
        setLoading(false);
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }

    } catch (err) {
      console.error("Payment verification error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to verify payment. Please contact support.";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
      <div className="max-w-2xl w-full">
        {loading || verifying ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-2xl shadow-2xl border border-gray-700">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-t-4 border-green-500 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-200">Verifying Payment...</h3>
              <p className="text-gray-400 text-sm">Please wait while we confirm your payment</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-red-900/20 to-gray-900 text-white p-8 rounded-2xl shadow-2xl border border-red-500/50">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-4 border-red-500">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-red-400">Payment Failed</h2>
              <p className="text-gray-300 text-lg">{error}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                    onClick={() => navigate('/upgrade-plan')}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Try Again
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-900/20 to-gray-900 text-white rounded-2xl shadow-2xl border border-green-500/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-green-100 text-lg">Your subscription has been activated</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Active Plan</p>
                    <h3 className="text-2xl font-bold text-white">
                      {subscriptionDetails?.planType === 'MONTHLY' ? '📅 Monthly Plan' : '📆 Quarterly Plan'}
                    </h3>
                  </div>
                  <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-500">
                    <span className="text-green-400 font-semibold">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Start Date</p>
                      <p className="text-white font-semibold text-lg">
                        {formatDate(subscriptionDetails?.startDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                      <p className="text-white font-semibold text-lg">
                        {formatDate(subscriptionDetails?.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-5 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Days Remaining</p>
                      <p className="text-2xl font-bold text-white">
                        {getDaysRemaining(subscriptionDetails?.endDate)} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-xs mb-1">Payment ID</p>
                <p className="text-gray-300 text-sm font-mono break-all">
                  {subscriptionDetails?.paymentId}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/subscription-history')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>View History</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Go to Home</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default UpgradeSuccess;