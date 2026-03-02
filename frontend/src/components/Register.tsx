import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import logo from '../assets/logo.png';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        // שליחת הנתונים לשרת דרך ה-Service
        const registerPromise = authService.register(data);

        toast.promise(registerPromise, {
            loading: 'Creating your account...',
            success: (res: any) => {
                // חילוץ הנתונים (מבנה דומה ללוגין: token ו-_id)
                const userData = res.data || res;
                
                if (userData.token) {
                    localStorage.setItem('token', userData.token);
                    localStorage.setItem('userId', userData._id);
                    navigate('/home');
                    return 'Welcome to BiteWise! 🍳';
                }
                return 'Registered successfully! Please login.';
            },
            error: (err) => {
                const msg = err.response?.data?.message || "Registration failed. Try again.";
                return msg;
            }
        }, {
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
            success: { duration: 4000, style: { background: '#f02d8e' } },
        });
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-white">
            <div className="text-center" style={{ width: '100%', maxWidth: '400px' }}>
                
                <div className="mb-4">
                    <img src={logo} alt="BiteWise" style={{ width: '80px' }} />
                    <h3 className="fw-bold mt-3">Join BiteWise</h3>
                    <p className="text-secondary small">Start sharing your delicious recipes</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="text-start">
                    {/* Username Field */}
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted ms-1">Username</label>
                        <input 
                            type="text" 
                            className={`form-control border-0 py-3 shadow-sm ${errors.username ? 'is-invalid' : ''}`}
                            placeholder="Choose a username"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
                            {...register("username", { required: "Username is required" })}
                        />
                    </div>

                    {/* Email Field */}
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted ms-1">Email</label>
                        <input 
                            type="email" 
                            className={`form-control border-0 py-3 shadow-sm ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="your@email.com"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
                            {...register("email", { required: "Email is required" })}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-3">
    <label className="form-label small fw-bold text-muted ms-1">Password</label>
    <input 
        type="password" 
        className={`form-control border-0 py-3 shadow-sm ${errors.password ? 'is-invalid' : ''}`}
        placeholder="Create a password"
        style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
        {...register("password", { 
            required: "Password is required", 
            minLength: { value: 6, message: "Minimum 6 characters" } 
        })}
    />
    {errors.password && <div className="invalid-feedback ms-1">{(errors.password as any).message}</div>}
</div>

{/* Confirm Password Field */}
<div className="mb-4">
    <label className="form-label small fw-bold text-muted ms-1">Confirm Password</label>
    <input 
        type="password" 
        className={`form-control border-0 py-3 shadow-sm ${errors.confirmPassword ? 'is-invalid' : ''}`}
        placeholder="Repeat your password"
        style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
        {...register("confirmPassword", { 
            required: "Please confirm your password",
            validate: (value, formValues) => value === formValues.password || "Passwords do not match"
        })}
    />
    {errors.confirmPassword && <div className="invalid-feedback ms-1">{(errors.confirmPassword as any).message}</div>}
</div>

                    <button type="submit" className="btn w-100 py-3 text-white fw-bold shadow" 
                            style={{ backgroundColor: '#f02d8e', borderRadius: '12px', border: 'none' }}>
                        Create Account
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