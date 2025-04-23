// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import UpdateProfile from './pages/UpdateProfile';
import EmailConfigManager from './pages/EmailConfigManager';
import ReferAndEarn from './pages/ReferAndEarn';
import Subscription from './pages/subscription';
import UpgradeSucess from './pages/UpgradeSucess';
import SubscriptionList from './pages/SubscriptionList';
import AdminDashboard from './admin/AdminDashboard';
import Master from './admin/Master';
import SubscriptionUsers from './admin/SubscriptionUsers';
import PDFS from './admin/PDFS';

import Users from './admin/Users';
import AddPost from './admin/AddPost';


const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<h1 className="text-center p-4">Welcome to Home</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UpdateProfile />} />
          <Route path="/email-config" element={<EmailConfigManager />} />
          <Route path="/refer-and-earn" element={<ReferAndEarn />} />
          <Route path="/upgrade-plan" element={<Subscription />} />
          <Route path="/upgrade/sucess" element={<UpgradeSucess />} />

          <Route path="/user/subscription-list" element={<SubscriptionList />} />

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


      </div>


    </Router>
  );
};

export default App;
