import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';

const ONE_DAY_SECONDS = 86400;

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ONE_DAY_SECONDS);
  const timerRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('timerStart');
    setIsLoggedIn(false);
    setUser(null);
    clearInterval(timerRef.current);
    navigate('/login');
  }, [navigate]);

  const initializeTimer = useCallback(() => {
    let startTime = localStorage.getItem('timerStart');
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem('timerStart', startTime);
    }

    const updateCountdown = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = ONE_DAY_SECONDS - elapsed;

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleLogout();
        setTimeLeft(0);
        return;
      }

      setTimeLeft(remaining);
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      axiosInstance
        .get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          initializeTimer();
        })
        .catch((err) => {
          console.error("Profile fetch failed", err);
          if (err.response?.status === 401) handleLogout();
        });
    }

    return () => clearInterval(timerRef.current);
  }, [initializeTimer, handleLogout]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();  // Prevent this event from propagating to document
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / ONE_DAY_SECONDS) * circumference;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 px-6 py-3 text-white flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">Easy Share</Link>

      {isLoggedIn && user ? (
        <div className="relative flex items-center gap-6" ref={dropdownRef}>
          {/* Timer Circle */}
          <div className="w-[60px] h-[60px]">
            <svg width="60" height="60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="#fff"
                strokeWidth="4"
                fill="transparent"
                style={{ opacity: 0.3 }}
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="#00FFAA"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                transform="rotate(-90 30 30)"
                strokeLinecap="round"
              />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                fill="#fff"
                fontSize="10"
                fontWeight="bold"
              >
                {formatTime(timeLeft)}
              </text>
            </svg>
          </div>
          {/* Profile */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={toggleDropdown} // Toggling the dropdown when clicked
          >
            <img
              src={user.image ? `data:image/jpeg;base64,${user.image}` : 'https://img.freepik.com/free-psd/lantern-isolated-transparent-background_191095-32472.jpg'}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
            <span className="font-medium hover:underline">
              {user.fullName || user.email}
            </span>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute top-14 right-0 w-48 bg-white text-black rounded-lg shadow-lg z-50 overflow-hidden"
              onClick={handleDropdownClose} // Close dropdown if any part inside is clicked
            >
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                Profile
              </Link>
              <Link to="/email-config" className="block px-4 py-2 hover:bg-gray-100">
                Email Configuration
              </Link>
              <Link to="/upgrade-plan" className="block px-4 py-2 hover:bg-gray-100">
                Subscription
              </Link>
              <Link to="/refer-and-earn" className="block px-4 py-2 hover:bg-gray-100">
                Refer & Earn
              </Link>
              <Link to="/user/Subscription-list" className="block px-4 py-2 hover:bg-gray-100">
                Subscription History
              </Link>

              {/* ✅ Admin Only Dropdown */}
              {user?.role === 'ROLE_ADMIN' && (
                <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 font-semibold text-blue-600">
                  Admin Dashboard
                </Link>
              )}

              {user.activeSubscription === 1 && (
                <Link
                  to="/download-pdf"
                  className="block px-4 py-2 hover:bg-gray-100 font-semibold text-blue-600"
                >
                  Download PDF
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-x-4">
          <Link to="/login" className="hover:text-gray-200 transition">Login</Link>
          <Link to="/register" className="hover:text-gray-200 transition">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
