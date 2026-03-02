import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import logo from '../assets/logo.png';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        
        if (data.image && data.image[0]) {
            formData.append("image", data.image[0]); 
        }

        const registerPromise = authService.register(formData as any);

        toast.promise(registerPromise, {
            loading: 'Creating your account...',
            success: () => {
                navigate('/home');
                return 'Welcome to BiteWise! 🍳';
            },
            error: (err) => err.response?.data?.message || "Registration failed"
        }, {
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
            success: { duration: 4000, style: { background: '#f02d8e' } },
        });
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-white">
            <div className="text-center" style={{ width: '100%', maxWidth: '450px' }}>
                
                <div className="mb-4">
                    <img src={logo} alt="BiteWise" style={{ width: '70px' }} />
                    <h3 className="fw-bold mt-2">Create Account</h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="text-start">
                    
                    <div className="text-center mb-4">
                        <div className="position-relative d-inline-block">
                            <img 
                                src={preview || "https://ui-avatars.com/api/?name=User&background=random"} 
                                alt="preview" 
                                className="rounded-circle border shadow-sm"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                            <label htmlFor="imageUpload" className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle shadow-sm">
                                <i className="bi bi-camera"></i>
                                <input 
                                    type="file" 
                                    id="imageUpload" 
                                    hidden 
                                    accept="image/*"
                                    {...register("image", { onChange: handleImageChange })}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted ms-1">Username</label>
                        <input 
                            type="text" 
                            className={`form-control border-0 py-2 shadow-sm ${errors.username ? 'is-invalid' : ''}`}
                            placeholder="User123"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}
                            {...register("username", { required: "Username is required" })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted ms-1">Email</label>
                        <input 
                            type="email" 
                            className={`form-control border-0 py-2 shadow-sm ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="mail@example.com"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}
                            {...register("email", { required: "Email is required" })}
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted ms-1">Password</label>
                            <input 
                                type="password" 
                                className={`form-control border-0 py-2 shadow-sm ${errors.password ? 'is-invalid' : ''}`}
                                style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}
                                {...register("password", { required: "Required", minLength: 6 })}
                            />
                        </div>
                        <div className="col-md-6 mb-4">
                            <label className="form-label small fw-bold text-muted ms-1">Confirm</label>
                            <input 
                                type="password" 
                                className={`form-control border-0 py-2 shadow-sm ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}
                                {...register("confirmPassword", { 
                                    required: "Required",
                                    validate: (val) => val === watch('password') || "No match"
                                })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn w-100 py-3 text-white fw-bold shadow-sm" 
                            style={{ backgroundColor: '#f02d8e', borderRadius: '12px', border: 'none' }}>
                        Sign Up
                    </button>
                </form>

                <div className="mt-4">
                    <p className="small text-muted">
                        Already have an account? 
                        <span className="fw-bold ms-1" style={{ color: '#f02d8e', cursor: 'pointer' }}
                              onClick={() => navigate('/')}>Login</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;