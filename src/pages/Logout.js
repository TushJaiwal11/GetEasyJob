import { useNavigate } from "react-router-dom";

const handleLogout = () => {
    const navigate = useNavigate()
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login')
};
