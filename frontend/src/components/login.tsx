import React from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import authService from '../services/authService';
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    
    const handleGoogleSuccess = async (credentialResponse: any) => {
        const googleLoginPromise = authService.googleLogin(credentialResponse.credential);

        toast.promise(googleLoginPromise, {
            loading: 'Logging in with Google...',
            success: (res: any) => {
                localStorage.setItem('accessToken', res.accessToken);
                localStorage.setItem('userId', res._id); 
                localStorage.setItem('username', res.username);
                localStorage.setItem('imgUrl', res.imgUrl);
                
                navigate('/home');
                return 'Welcome back! 🍳';
            },
            error: (err) => err.response?.data?.message || "Google Login failed",
        }, {
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
            success: { duration: 4000, style: { background: '#f02d8e' } },
        });
    };

    const onSubmit = async (data: any) => {
        const loginPromise = authService.login(data.email, data.password);

        toast.promise(loginPromise, {
            loading: 'Logging in...',
            success: (res: any) => {
                const token = res.token;
                const userId = res._id;
                const username = res.username;
                
                if (token && userId) {
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('userId', userId); 
                    localStorage.setItem('username', username);
                    navigate('/home');
                    return 'Welcome back to BiteWise! 🍳';
                }
                throw new Error("Missing data from server");
            },
            error: (err) => {
                return err.response?.data?.message || "Login failed";
            },
        }, {
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
            success: { duration: 4000, style: { background: '#f02d8e' } },
        });
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-white"> 
            <div className="text-center" style={{ width: '100%', maxWidth: '400px' }}>
                
                <div className="mb-5">
                    <img src={logo} alt="BiteWise Logo" style={{ width: '100px', padding: '10px' }} />
                    <p className="text-secondary small">Social Network for Cooking Lovers</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="text-start">
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted ms-1">Email</label>
                        <input 
                            type="email" 
                            className={`form-control border-0 py-3 px-3 shadow-sm ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="your@email.com"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
                            {...register("email", { required: true })}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted ms-1">Password</label>
                        <input 
                            type="password" 
                            className={`form-control border-0 py-3 px-3 shadow-sm ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter password"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
                            {...register("password", { required: true })}
                        />
                    </div>

                    <button type="submit" className="btn w-100 py-3 text-white fw-bold shadow mb-3" 
                            style={{ 
                                backgroundColor: '#f02d8e', 
                                borderRadius: '12px', 
                                border: 'none',
                                fontSize: '1.1rem' 
                            }}>
                        Login
                    </button>
                </form>

                <div className="d-flex align-items-center my-4">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted small fw-bold">OR</span>
                    <hr className="flex-grow-1" />
                </div>

                <div className="d-flex justify-content-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google Login Failed")}
                        theme="outline"
                        shape="pill"
                        width="400"
                    />
                </div>

                <div className="mt-5">
                    <p className="small fw-bold" style={{ color: '#f02d8e', cursor: 'pointer' }}
                       onClick={() => navigate('/register')}>
                        Don't have an account? Sign Up
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;