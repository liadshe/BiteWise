import axios from 'axios';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL;
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
    }

    return response.data;
};

const register = async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${AUTH_URL}/register`, userData);
    
    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
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

export default {
    login,
    register,
    logout,
    isLoggedIn
};