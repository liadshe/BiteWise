import axios from 'axios';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_URL = `${API_BASE_URL}/auth`;

interface AuthResponse {
    token: string;
    refreshToken: string;
    _id: string;
}

interface RegisterData {
    email: string;
    password: string;
    username: string;
    imgUrl?: string;
}

const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${AUTH_URL}/login`, {
        email,
        password
    });

    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data._id); 
    }

    return response.data;
};

const register = async (formData: FormData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${AUTH_URL}/register`, formData);
    
    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('userId', response.data._id);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

const isLoggedIn = () => {
    return localStorage.getItem('accessToken') !== null;
};

const getUserById = async (id: string) => {
    const response = await axios.get(`${AUTH_URL}/${id}`);
    return response.data;
};
const googleLogin = async (credential: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/google`, { credential });    

    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('userId', response.data._id);
    }
    return response.data;
};

const authService = {
    login,
    register,
    logout,
    isLoggedIn,
    getUserById,
    googleLogin
};

export default authService;