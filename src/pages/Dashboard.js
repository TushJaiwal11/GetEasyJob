// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import authService from "../services/authService";

const Dashboard = () => {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);

    const handleLogout = useCallback(() => {
        console.log('🔴 Logging out from dashboard...');
        authService.logout();
        toast.error("Session expired. Please login again.");
        navigate("/login");
    }, [navigate]);

    // const fetchPosts = async (token) => {
    //     try {
    //         const res = await axiosInstance.get("/api/admin/get-post", {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //         setPosts(res.data);
    //     } catch (err) {
    //         toast.error("Error fetching posts.");
    //     }
    // };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return handleLogout();
        // fetchPosts(token);
    }, [handleLogout]);

   
    

    const highlightText = (text) => {
        if (!text) return null;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const urlRegex = /https?:\/\/[^\s]+/g;
        const combinedRegex = new RegExp(`${emailRegex.source}|${urlRegex.source}`, 'g');

        const lines = text.split('\n');
        return lines.map((line, lineIndex) => {
            const elements = [];
            let lastIndex = 0;

            for (const match of line.matchAll(combinedRegex)) {
                const start = match.index;
                const end = start + match[0].length;
                if (start > lastIndex) elements.push(line.slice(lastIndex, start));

                const value = match[0];
                const isEmail = emailRegex.test(value);

                elements.push(
                    <a
                        key={`${lineIndex}-${start}`}
                        href={isEmail ? `mailto:${value}` : value}
                        target={isEmail ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        style={{ color: isEmail ? "blue" : "green", fontWeight: "bold" }}
                    >
                        {value}
                    </a>
                );

                lastIndex = end;
            }

            if (lastIndex < line.length) elements.push(line.slice(lastIndex));
            return <div key={lineIndex}>{elements}</div>;
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            

            <h3 className="text-xl font-semibold mb-4 text-gray-800">All Posts</h3>

            <div className="space-y-4">
                {posts.map((p, idx) => (
                    <div
                        key={idx}
                        className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
                    >
                        <h4 className="text-lg font-bold text-gray-800 mb-1">{p.title}</h4>
                        <div className="text-gray-700 text-sm mb-2">{highlightText(p.description)}</div>
                        <small className="text-gray-500">
                            Created: {new Date(p.createdAt).toLocaleString()}
                        </small>
                    </div>
                ))}
            </div>

            <ToastContainer />
        </div>
    );
};

export default Dashboard;

