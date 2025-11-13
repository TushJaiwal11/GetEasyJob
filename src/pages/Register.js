// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import authService from '../services/authService';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.register(form);

      // ✅ Handle success
      if (response?.success) {
        toast.success(response?.message || "User registered successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        let message =
          response?.message ||
          response?.data?.error ||
          "Registration failed";

        // ✅ Extract nested errorMessage from JSON text
        const match = message.match(/"errorMessage":"([^"]+)"/);
        if (match) {
          message = match[1];
        }

        toast.error(message);
      }

    } catch (err) {
      // ✅ Handle errors (like 409)
      const errorResponse = err?.response?.data ?? err?.data ?? {};
      let message = errorResponse?.message || "Registration failed";

      // ✅ Extract nested errorMessage inside JSON string if present
      const match = message.match(/"errorMessage":"([^"]+)"/);
      if (match) {
        message = match[1];
      }

      // ✅ Show error toast
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />

          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full px-3 py-2 border rounded mb-3"
            required
          />

          <input
            type="text"
            name="referralCode"
            value={form.referralCode}
            onChange={handleChange}
            placeholder="Referral Code (optional)"
            className="w-full px-3 py-2 border rounded mb-3"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white py-2 rounded font-semibold flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-t-white border-blue-300 rounded-full animate-spin"></div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;