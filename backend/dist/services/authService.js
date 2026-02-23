"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// שימוש בכתובת מה-env עם מעקף ל-TS כדי שלא יצעק על import.meta
// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_URL = `${API_BASE_URL}/auth`;
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post(`${AUTH_URL}/login`, {
        email,
        password
    });
    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
});
const register = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post(`${AUTH_URL}/register`, userData);
    if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
});
const logout = () => {
    // מחיקת הטוקנים מה-LocalStorage בזמן התנתקות
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
// פונקציית עזר לבדיקה אם המשתמש מחובר (אם קיים טוקן)
const isLoggedIn = () => {
    return localStorage.getItem('accessToken') !== null;
};
exports.default = {
    login,
    register,
    logout,
    isLoggedIn
};
//# sourceMappingURL=authService.js.map