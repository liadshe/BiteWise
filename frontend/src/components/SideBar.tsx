import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useEffect } from 'react';
import authService from '../services/authService';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_URL = `${API_BASE_URL}/auth`;

function Sidebar() {
    const [user, setUser] = useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const data = await authService.getUserById(userId);
                    setUser(data);
                } catch (err) {
                    console.error("Could not fetch user info", err);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.clear();
        toast.success("Logged out");
        // Redirect to login page
        navigate('/');
    }

    const isActive = (path: string) => location.pathname === path;

    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/default-avatar.png'; // fallback if user has no image at all
        if (url.startsWith('http')) return url; // handles Google Auth images
        
        let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        if (!cleanUrl.startsWith('uploads/')) {
            cleanUrl = `uploads/${cleanUrl}`;
        }
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    return (
        <div 
            className="d-flex flex-column p-3 bg-white border-end" 
            style={{ 
                width: '280px', 
                minWidth: '280px', 
                flexShrink: 0, 
                height: '100vh', 
                position: 'sticky', 
                top: 0,
                overflowY: 'auto'
            }}
        >
            {/* logo */}
            <Link to="/home" className="d-flex align-items-center mb-4 text-decoration-none">
              <img src={logoImg} alt="BiteWise Logo" width="60" className="me-2" />
            </Link>

         {/* navigation links */}
            <ul className="nav nav-pills flex-column mb-auto gap-2">
                <li className="nav-item">
                    {/* Home Link */}
                    <Link 
                        to="/home" 
                        className={`nav-link d-flex align-items-center ${isActive('/home') ? 'active text-white' : 'text-dark'}`} 
                        style={{ 
                            backgroundColor: isActive('/home') ? '#e81e61' : 'transparent', 
                            borderRadius: '12px' 
                        }}
                    >
                        <i className="bi bi-house-door me-3"></i> Home
                    </Link>
                </li>
                <li>
                    {/* Create Recipe Link */}
                    <Link 
                        to="/home/create" 
                        className={`nav-link d-flex align-items-center ${isActive('/home/create') ? 'active text-white' : 'text-dark'}`}
                        style={{ 
                            backgroundColor: isActive('/home/create') ? '#e81e61' : 'transparent', 
                            borderRadius: '12px' 
                        }}
                    >
                        <i className="bi bi-plus-circle me-3"></i> Create Recipe
                    </Link>
                </li>
                <li>
                    {/* Profile Link */}
                    <Link 
                        to="/home/profile" 
                        className={`nav-link d-flex align-items-center ${isActive('/home/profile') ? 'active text-white' : 'text-dark'}`}
                        style={{ 
                            backgroundColor: isActive('/home/profile') ? '#e81e61' : 'transparent', 
                            borderRadius: '12px' 
                        }}
                    >
                        <i className="bi bi-person me-3"></i> My Profile
                    </Link>
                </li>
            </ul>

            {/* user profile */}
            <div className="mt-auto border-top pt-3">
                <div className="d-flex align-items-center p-2 mb-2 rounded" style={{ backgroundColor: '#fcf0f4' }}>
                <img 
                    src={getImageUrl(user?.imgUrl)} 
                    alt="Profile" 
                    width="40" height="40" 
                    className="rounded-circle me-2 shadow-sm"
                    style={{ objectFit: 'cover' }} 
                    onError={(e) => {
                        // Fallback if the image link is broken
                        (e.target as HTMLImageElement).src = '/default-avatar.png'; 
                    }}
                />
                    <div className="overflow-hidden">
                        <h6 className="mb-0 fw-bold text-truncate" title={user?.username}>{user?.username}</h6>
                        <small className="text-muted text-truncate d-block">@{user?.email?.split('@')[0]}</small>
                    </div>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;