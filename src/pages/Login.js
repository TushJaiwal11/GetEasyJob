import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });

  // Remove any old token when login page loads
  useEffect(() => {
    localStorage.removeItem('token');
    
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/auth/signin', form);
      console.log("Response:", response.data);

      localStorage.removeItem('timerStart');

      localStorage.setItem('token', response.data.jwt); // Save new token
      toast.success('Login successful! Redirecting...');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      const errMsg = error.response?.data || error.message;
      toast.error(`Login failed: ${errMsg}`);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mb-3"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
