import React from 'react';
import { useForm } from 'react-hook-form';
import authService from '../services/authService';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const response = await authService.login(data.email, data.password);
            alert("Successful Login!");
            console.log("Token:", response.token);
        } catch (err) {
            alert("Error during login. Please check your credentials.");
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" 
             style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)' }}>
            
            <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', border: 'none' }}>
                <div className="text-center mb-4">
                    <h2 style={{ color: '#8e24aa', fontWeight: 'bold' }}>BiteWise</h2>
                    <p className="text-muted"> Cooking with awarness</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} dir="rtl">
                    <div className="mb-3">
                        <label className="form-label">אימייל</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            {...register("email", { required: "חובה להזין אימייל" })} 
                        />
                        {errors.email && <small className="text-danger">{(errors.email as any).message}</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">סיסמה</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            {...register("password", { required: "חובה להזין סיסמה" })} 
                        />
                        {errors.password && <small className="text-danger">{(errors.password as any).message}</small>}
                    </div>

                    <button type="submit" className="btn w-100 mt-2" style={{ backgroundColor: '#ab47bc', color: 'white', fontWeight: 'bold' }}>
                        כניסה
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;