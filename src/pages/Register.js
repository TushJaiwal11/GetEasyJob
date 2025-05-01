import React, { useState } from 'react';
import axiosInstance from '../components/axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { toast, ToastContainer } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', referralCode: '' });
  const [loading, setLoading] = useState(false); // New state for loading

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      await axiosInstance.post('/auth/signup', form);
      toast.success("Registered! Redirecting...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      toast.error(`Error: ${errMsg}`);
    } finally {
      setLoading(false); // Stop loading
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
