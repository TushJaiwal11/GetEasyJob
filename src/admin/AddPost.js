import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AddPost = () => {
    const navigate = useNavigate();

    const [post, setPost] = useState({ title: "", description: "" });
    const [posts, setPosts] = useState([]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

    const fetchPosts = async (token) => {
        try {
            const res = await axiosInstance.get("/api/admin/get-post", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPosts(res.data);
        } catch (err) {
            toast.error("Error fetching posts.");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return handleLogout();
        fetchPosts(token);
    }, [handleLogout]);

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            await axiosInstance.post("/api/admin/create-post", post, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Post created successfully!");
            setPost({ title: "", description: "" });
            fetchPosts(token);
        } catch (error) {
            toast.error("Error creating post.");
        }
    };

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
            <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">Create New Post</h2>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded-xl p-6 mb-10">
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        placeholder="Enter post title"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        name="description"
                        value={post.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter post description"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                    Create Post
                </button>
            </form>

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

export default AddPost;
