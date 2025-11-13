import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_AVATAR = 'https://img.freepik.com/free-psd/lantern-isolated-transparent-background_191095-32472.jpg';

const Navbar = () => {
  const { isAuthenticated, logout: contextLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const profileImageUrlRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Logout logic
  const handleLogout = useCallback(() => {
    console.log('🔴 Logging out user...');
    authService.logout();

    // Clean up blob URL memory
    if (profileImageUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(profileImageUrlRef.current);
      profileImageUrlRef.current = null;
    }

    setUser(null);
    setProfileImageUrl(null);
    contextLogout();
    navigate('/login');
  }, [navigate, contextLogout]);

  // 🔹 Fetch user profile + image
  const fetchUserProfile = useCallback(async () => {
    try {
      console.log('📤 Fetching user profile...');
      const profileData = await userService.getProfile();
      console.log('✅ Profile loaded:', profileData);
      setUser(profileData);

      // 🔹 Load image only if user has one
      if (profileData.imageUrl && profileData.id) {
        setImageLoading(true);
        const imageUrl = await userService.getUserProfileImage(profileData.id);

        // Revoke any previous blob URL
        if (profileImageUrlRef.current?.startsWith('blob:')) {
          URL.revokeObjectURL(profileImageUrlRef.current);
        }

        // Save new blob URL
        profileImageUrlRef.current = imageUrl;
        setProfileImageUrl(imageUrl);
        console.log('✅ Profile image loaded');
      } else {
        // No image available
        if (profileImageUrlRef.current?.startsWith('blob:')) {
          URL.revokeObjectURL(profileImageUrlRef.current);
          profileImageUrlRef.current = null;
        }
        setProfileImageUrl(null);
      }
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);

      // Only handle non-401 errors (interceptor handles 401)
      const status = error.response?.status;

      if (status !== 401) {
        // For other errors, logout
        console.error('❌ Non-recoverable error. Logging out...');
        handleLogout();
      } else {
        // 401 errors are handled by interceptor, just log it
        console.log('⚠️ 401 detected - interceptor should have handled token refresh');
      }
    } finally {
      setImageLoading(false);
    }
  }, [handleLogout]);

  // 🔹 Watch authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setUser(null);
      setProfileImageUrl(null);
    }

    return () => {
      // Cleanup blob URL
      if (profileImageUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrlRef.current);
        profileImageUrlRef.current = null;
      }
    };
  }, [isAuthenticated, fetchUserProfile]);

  // 🔹 Close dropdown on outside click
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

  // 🔹 Dropdown toggler
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  const getProfileImageSrc = () => {
    if (imageLoading) {
      return DEFAULT_AVATAR;
    }
    return profileImageUrl || DEFAULT_AVATAR;
  };

  const handleImageError = (e) => {
    console.error('Image failed to load');
    e.target.src = DEFAULT_AVATAR;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 px-6 py-4 text-white flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">Hire Hunt</Link>

      {isAuthenticated && user ? (
        <div className="relative flex items-center gap-6" ref={dropdownRef}>
          {/* Profile */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={toggleDropdown}
          >
            <div className="relative">
              <img
                src={getProfileImageSrc()}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                onError={handleImageError}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <span className="font-medium hover:underline">
              {user.fullName || user.email}
            </span>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute top-14 right-0 w-48 bg-white text-black rounded-lg shadow-lg z-50 overflow-hidden"
              onClick={handleDropdownClose}
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
              <Link to="/user/subscription-history" className="block px-4 py-2 hover:bg-gray-100">
                Subscription History
              </Link>

              {/* Admin Only Dropdown */}
              {authService.isAdmin() && (
                <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 font-semibold text-blue-600">
                  Admin Dashboard
                </Link>
              )}

              {/* Premium Feature - PDF Download */}
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