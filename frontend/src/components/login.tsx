import React from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import authService from '../services/authService';
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    
    const onSubmit = async (data: any) => {
        const loginPromise = authService.login(data.email, data.password);

        toast.promise(loginPromise, {
            loading: 'Logging in...',
            success: () => {
                navigate('/home');
                return 'Welcome back to BiteWise! 🍳';
            },
            error: (err) => {
                return "Login failed: Invalid email or password";
            },
        }, {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
            success: {
                duration: 4000,
                style: {
                    background: '#f02d8e',
                },
            },
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

                    <div className="mb-5">
                        <label className="form-label small fw-bold text-muted ms-1">Password</label>
                        <input 
                            type="password" 
                            className={`form-control border-0 py-3 px-3 shadow-sm ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter password"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
                            {...register("password", { required: true })}
                        />
                    </div>

                    <button type="submit" className="btn w-100 py-3 text-white fw-bold shadow" 
                            style={{ 
                                backgroundColor: '#f02d8e', 
                                borderRadius: '12px', 
                                border: 'none',
                                fontSize: '1.1rem' 
                            }}>
                        Login
                    </button>
                </form>

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