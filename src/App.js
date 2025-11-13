// src/App.js
import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import { LoaderProvider, useLoader } from './components/LoaderContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TestRefreshToken from './services/TestRefreshToken';

// Lazy imports
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UpdateProfile = React.lazy(() => import('./pages/UpdateProfile'));
const EmailConfigManager = React.lazy(() => import('./pages/EmailConfigManager'));
const EmailSharePage = React.lazy(() => import('./pages/EmailSharePage'));
const ReferAndEarn = React.lazy(() => import('./pages/ReferAndEarn'));
const Subscription = React.lazy(() => import('./pages/subscription'));
const UpgradeSucess = React.lazy(() => import('./pages/UpgradeSucess'));
const SubscriptionHistory = React.lazy(() => import('./pages/SubscriptionHistory'));
const AdminDashboard = React.lazy(() => import('./admin/AdminDashboard'));
const Master = React.lazy(() => import('./admin/Master'));
const SubscriptionUsers = React.lazy(() => import('./admin/SubscriptionUsers'));
const PDFS = React.lazy(() => import('./admin/PDFS'));
const Users = React.lazy(() => import('./admin/Users'));
const AddPost = React.lazy(() => import('./admin/AddPost'));
const DownloadePdf = React.lazy(() => import('./pages/DownloadPdf'));

const AppContent = () => {
  const navigate = useNavigate();
  const { loading } = useLoader();

  useEffect(() => {
    document.title = "Get Job Easily";
  }, [navigate]);

  return (
    <>
      <Navbar />
      {loading && <Loader />}
      <div className="pt-16">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<h1 className="text-center p-4">Welcome to Home</h1>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UpdateProfile />} />
            <Route path="/email-config" element={<EmailConfigManager />} />
            <Route path="/email-share" element={<EmailSharePage />} />
            <Route path="/refer-and-earn" element={<ReferAndEarn />} />
            <Route path="/upgrade-plan" element={<Subscription />} />
            <Route path="/upgrade/success" element={<UpgradeSucess />} />
            <Route path="/download-pdf" element={<DownloadePdf />} />
            <Route path="/user/subscription-history" element={<SubscriptionHistory />} />
            <Route path="/test-refresh" element={<TestRefreshToken />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="/admin/master" element={<Master />} />
              <Route path="/admin/add-post" element={<AddPost />} />
              <Route path="/admin/uploade-pdf" element={<PDFS />} />
              <Route path="/admin/subscription-users" element={<SubscriptionUsers />} />
              <Route path="/admin/users" element={<Users />} />
            </Route>

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LoaderProvider>
        <AppContent />
      </LoaderProvider>
    </AuthProvider>
  );
};

export default App;