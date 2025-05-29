import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useLoginMutation, useGetModuleAccessQuery } from '../api/apiSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();

    // This will automatically fetch module access when the token is available
    const { data: moduleData } = useGetModuleAccessQuery(undefined, {
        skip: !localStorage.getItem('access_token'), // Skip until we have a token
    });

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
            // Store the token and user_id in localStorage
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user_id', response.user_id);
            console.log('Login successful:', response);
            
            // Immediately fetch and log module access data
            try {
                const moduleResponse = await fetch('http://localhost:8000/roleAccess/moduleAccess', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${response.access_token}`
                    }
                });
                const moduleData = await moduleResponse.json();
                console.log('=== Immediate Module Access Response ===');
                
                // Fetch module names for the received IDs
                const moduleNamesResponse = await fetch('http://localhost:8000/roleAccess/getModuleNames', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${response.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ module_ids: moduleData.module_ids })
                });
                
                const moduleNames = await moduleNamesResponse.json();
                console.log('Accessible Modules:', moduleNames);
                
                console.log('=====================================');
            } catch (error) {
                console.error('Error fetching module access:', error);
            }
            
            // The module access query will automatically trigger after login
            // due to the onQueryStarted logic in apiSlice
            
            // Redirect to dashboard after successful login
            navigate('/entityDetails');
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.data?.detail || 'Login failed. Please try again.');
        }
    };

    // Log module access data when it's available
    if (moduleData) {
        console.log('=== Module Access Response ===');
        console.log('Module Access Data:', moduleData);
        console.log('Accessible Module IDs:', moduleData?.moduleIds || []);
        console.log('User Role:', moduleData?.userRole || 'N/A');
        console.log('Company ID:', moduleData?.companyId || 'N/A');
        console.log('Plant ID:', moduleData?.plantId || 'N/A');
        console.log('Financial Year:', moduleData?.financialYear || 'N/A');
        console.log('=========================');
    }

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

export default Login; 