import React from 'react';
import { useForm } from 'react-hook-form';
import authService from '../services/authService';
import logo from '../assets/logo.png'; 

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            await authService.login(data.email, data.password);
            alert("Login successful!");
        } catch (err) {
            console.error("Login failed", err);
            alert("Invalid credentials.");
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center"> 
            
            <div className="text-center" style={{ width: '100%', maxWidth: '400px' }}>
                
                <div className="mb-5">
                    <img src={logo} alt="BiteWise Logo" style={{ width: '100px' }} />
                    <p className="text-secondary">Social Network for Cooking Lovers</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="text-start">
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted ms-1">Email</label>
                        <input 
                            type="email" 
                            className="form-control border-0 py-3 px-3 shadow-sm" 
                            placeholder="your@email.com"
                            style={{ backgroundColor: '#ffffff', borderRadius: '12px' }}
                            {...register("email", { required: true })}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="form-label small fw-bold text-muted ms-1">Password</label>
                        <input 
                            type="password" 
                            className="form-control border-0 py-3 px-3 shadow-sm" 
                            placeholder="Enter password"
                            style={{ backgroundColor: '#ffffff', borderRadius: '12px' }}
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
                    <p className="small fw-bold" style={{ color: '#f02d8e', cursor: 'pointer' }}>
                        Don't have an account? Sign Up
                    </p>
                </div>
            </div>
        </div>
  );
};

export default Login;