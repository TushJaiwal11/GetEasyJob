import React, { useEffect, useState } from "react";
import axiosInstance from "../components/axiosInstance";

const UpgradeSuccess = () => {
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const queryParam = new URLSearchParams(window.location.search);
        const paymentId = queryParam.get("razorpay_payment_id");
        const planType = queryParam.get("planType");

        if (paymentId && planType) {
            axiosInstance
                .put(
                    `/api/upgrade-plan?planType=${planType}`,
                    {}, // empty body
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                        },
                    }
                )
                .then((res) => {
                    setSubscriptionDetails({
                        startDate: res.data.subscriptionPurchaseDate,
                        endDate: res.data.subscriptionExpiryDate,
                        planType: res.data.planType,
                    });
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Upgrade failed", err);
                    setError("Failed to upgrade subscription. Please contact support.");
                    setLoading(false);
                });
        } else {
            setError("Missing payment or plan details.");
            setLoading(false);
        }
    }, []);

    // Helper function to format the date like: 17 April '25
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear().toString().slice(-2);
        return `${day} ${month} '${year}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-[#111] text-white p-6 rounded-xl shadow-lg w-96 text-center border border-gray-700">
                <div className="text-green-500 text-4xl mb-2">✔️</div>
                <h2 className="text-xl font-semibold mb-4">Payment Successful</h2>

                {loading ? (
                    <p className="text-gray-300">Verifying your subscription...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <>
                        <p className="text-green-400 mb-1">
                            Start Date: {formatDate(subscriptionDetails.startDate)}
                        </p>
                        <p className="text-red-400 mb-1">
                            End Date: {formatDate(subscriptionDetails.endDate)}
                        </p>
                        <p className="text-white mb-4">Plan Type: {subscriptionDetails.planType}</p>
                    </>
                )}

                <a href="/" className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-300">
                    Go to Home
                </a>
            </div>
        </div>
    );
};

export default UpgradeSuccess;
