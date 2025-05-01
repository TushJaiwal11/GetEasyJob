import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import axiosInstance from "../components/axiosInstance"; // Customize as needed
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PDFS = () => {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [pdfList, setPdfList] = useState([]);
    const [token] = useState(localStorage.getItem("token") || "");
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

    const handleUpload = async () => {
        if (!title || !file || !token) {
            toast.error("All fields are required.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const base64File = reader.result.split(",")[1]; // Strip prefix

            const payload = {
                title: title,
                pdfData: base64File,
            };

            try {
                const res = await axiosInstance.post("/api/admin/upload", payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success(res.data);
                setTitle("");
                setFile(null);
                fetchPdfs();
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    handleLogout();
                } else {
                    toast.error("Error uploading PDF: " + (err.response?.data || err.message));
                }
            }
        };

        reader.readAsDataURL(file);
    };

    const fetchPdfs = useCallback(async () => {
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
            <h2 className="text-2xl font-bold mb-4">Upload PDF</h2>
            <input
                type="text"
                placeholder="Enter title"
                className="border p-2 w-full mb-2 text-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="file"
                accept="application/pdf"
                className="mb-2"
                onChange={(e) => setFile(e.target.files[0])}
            />
            <button
                onClick={handleUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Upload
            </button>

            <h3 className="text-xl font-semibold mt-6">Download Latest PDF</h3>

            {Object.entries(
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
                                    Uploaded: {dayjs(pdf.createAt).format("h:mm A")}
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
            ))}
        </div>
    );
};

export default PDFS;
