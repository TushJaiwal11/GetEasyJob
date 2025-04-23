import { Home, Package, ClipboardList, Users, PlusSquare, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { label: "Dashboard", icon: <Home size={20} />, path: "/admin/master" },
        { label: "PDFs", icon: <Package size={20} />, path: "/admin/uploade-pdf" },
        { label: "Subscription Users", icon: <ClipboardList size={20} />, path: "/admin/subscription-users" },
        { label: "Users", icon: <Users size={20} />, path: "/admin/users" },
        { label: "Add Post", icon: <PlusSquare size={20} />, path: "/admin/add-post" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="bg-[#111827] text-white min-h-screen w-64 px-4 py-6 flex flex-col justify-between fixed">
            <div>
                <h1 className="text-2xl font-extrabold mb-8 text-center text-blue-500">🛍️ Admin Panel</h1>
                <ul className="space-y-3">
                    {menuItems.map((item) => (
                        <li key={item.label}>
                            <Link
                                to={item.path}
                                className="flex items-center gap-3 hover:bg-[#1f2937] px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-400 hover:text-red-600 hover:bg-[#1f2937] px-3 py-2 rounded-lg transition-all duration-300"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
