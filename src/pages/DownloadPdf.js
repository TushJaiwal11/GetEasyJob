// src/pages/Dashboard.js
import React, { useCallback, useEffect, useState } from 'react';
import dayjs from "dayjs";
import axiosInstance from '../components/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DownloadPdf = () => {
    const navigate = useNavigate();

    const [pdfList, setPdfList] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [token] = useState(localStorage.getItem("token"));

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

    const fetchPdfs = useCallback(async () => {
        setLoading(true); // Start loading
        try {
            const res = await axiosInstance.get("/api/admin/getAllPdf", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sorted = res.data.sort(
                (a, b) => new Date(b.createAt) - new Date(a.createAt)
            );
            setPdfList(sorted);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 404) {
                handleLogout();
            } else {
                toast.error("Error fetching PDFs: " + (err.response?.data || err.message));
            }
        } finally {
            setLoading(false); // Stop loading
        }
    }, [token, handleLogout]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchPdfs();
        }
    }, [token, navigate, fetchPdfs]);

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mt-6">Download Latest PDF</h3>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                </div>
            ) : (
                Object.entries(
                    pdfList.reduce((acc, pdf) => {
                        const date = dayjs(pdf.createAt).format("YYYY-MM-DD");
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(pdf);
                        return acc;
                    }, {})
                ).map(([date, pdfs]) => (
                    <div key={date} className="mt-4">
                        <h4 className="text-md font-semibold text-white bg-gray-800 p-2 rounded">
                            {date}
                        </h4>
                        {pdfs.map((pdf, idx) => (
                            <div
                                key={pdf.id}
                                className="bg-gray-900 p-3 rounded mt-2 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium text-white">
                                        {idx + 1}. {pdf.title}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Uploaded: {dayjs(pdf.createAt).format("HH:mm")}
                                    </div>
                                </div>
                                <a
                                    href={`data:application/pdf;base64,${pdf.pdfData}`}
                                    download={`${pdf.title}.pdf`}
                                    className="text-blue-400 underline text-sm"
                                >
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default DownloadPdf;
