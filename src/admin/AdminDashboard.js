import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      
      {/* Main Content */}
      <div className="ml-64 p-6 w-full min-h-screen bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminDashboard;
