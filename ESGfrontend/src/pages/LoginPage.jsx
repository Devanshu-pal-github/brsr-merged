import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useLoginMutation } from '../api/apiSlice.jsx';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const credentials = {
                email: formData.email,
                password: formData.password,
            };
            const response = await login(credentials).unwrap();
            
            // Store token and user_id in localStorage
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user_id', response.user_id);
            localStorage.setItem('user_name', response.user_name);
            console.log('Login successful:', response);
            
            // Redirect to dashboard
            navigate('/company');
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.data?.detail || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A8A]/10 via-[#14B8A6]/10 to-white">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
                {/* Logo/Icon and Title */}
                <div className="flex flex-col items-center mb-8">
                    <Shield className="w-12 h-12 text-[#1E3A8A] mb-3" />
                    <h2 className="text-3xl font-bold text-[#1E3A8A]">Welcome Back</h2>
                    <p className="text-[#1E3A8A]/70 text-sm mt-2">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[#1E3A8A] text-sm font-semibold">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm shadow-sm transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[#1E3A8A] text-sm font-semibold">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm shadow-sm transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <a
                            href="#"
                            className="text-sm text-[#14B8A6] hover:text-[#14B8A6]/80 transition-colors"
                        >
                            Forgot Password?
                        </a>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#14B8A6]/90 focus:ring-4 focus:ring-[#14B8A6]/50 text-sm font-semibold shadow-sm transition-all duration-300 disabled:bg-[#14B8A6]/50"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;