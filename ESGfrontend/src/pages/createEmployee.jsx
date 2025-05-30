import { useState, useEffect } from 'react';
import { Shield, User, Mail, Lock, Building, Calendar, Hash, Briefcase } from 'lucide-react';
import { useCreateEmployeeMutation } from '../api/apiSlice';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';

const CreateEmployee = () => {
    const [formData, setFormData] = useState({
        company_id: '',
        plant_id: '',
        financial_year: '',
        employee_id: '',
        name: '',
        email: '',
        password: '',
        department: '',
        user_role: [],
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
    const navigate = useNavigate();

    // Role options for react-select
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'hr', label: 'HR' },
        { value: 'manager', label: 'Manager' },
        { value: 'staff', label: 'Staff' },
    ];

    // Check if user is admin
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const roles = decoded.user_role || [];
                setIsAdmin(roles.includes('admin'));
                if (!roles.includes('admin')) {
                    toast.error('Access denied. Only admins can create employees.', { duration: 4000 });
                }
            } catch (err) {
                toast.error('Invalid token. Please log in again.', { duration: 4000 });
                localStorage.removeItem('access_token');
                navigate('/login');
            }
        } else {
            toast.error('Please log in to access this page.', { duration: 4000 });
            navigate('/login');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleChange = (selectedOptions) => {
        setFormData((prev) => ({
            ...prev,
            user_role: selectedOptions ? selectedOptions.map((option) => option.value) : [],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error('Access denied. Only admins can create employees.', { duration: 4000 });
            return;
        }

        try {
            const employee = {
                employee_id: formData.employee_id,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                department: formData.department,
                user_role: formData.user_role,
            };
            const response = await createEmployee({
                company_id: formData.company_id,
                plant_id: formData.plant_id,
                financial_year: formData.financial_year,
                employee,
            }).unwrap();
            toast.success('Employee created successfully!', { duration: 4000 });
            console.log('Employee created:', response);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            console.error('Employee creation failed:', err);
            toast.error(err.data?.detail || 'Failed to create employee. Please try again.', { duration: 4000 });
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A8A]/10 via-[#14B8A6]/10 to-white">
                <Toaster position="top-right" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A8A]/10 via-[#14B8A6]/10 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 relative overflow-hidden">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 border-4 border-transparent rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#1E3A8A] opacity-20 pointer-events-none" />

                {/* Header */}
                <div className="flex flex-col items-center mb-10">
                    <Shield className="w-16 h-16 text-[#1E3A8A] mb-4 animate-pulse" />
                    <h2 className="text-4xl font-extrabold text-[#1E3A8A] tracking-tight">Create New Employee</h2>
                    <p className="text-[#1E3A8A]/70 text-base mt-3 font-medium">Add a new team member to your organization</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company ID */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold tracking-wide">
                                Company ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="text"
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleInputChange}
                                    placeholder="e.g., COMP001"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Plant ID */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Plant ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="text"
                                    name="plant_id"
                                    value={formData.plant_id}
                                    onChange={handleInputChange}
                                    placeholder="e.g., PLANT004"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Financial Year */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Financial Year <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="text"
                                    name="financial_year"
                                    value={formData.financial_year}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2023-2024"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Employee ID */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Employee ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="text"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleInputChange}
                                    placeholder="e.g., EMP005"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Rimjim"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Rim@gmail.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="block text-[#1E3A8A] text-sm font-semibold">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1E3A8A]/50" />
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Human Rights"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#1E3A8A] text-sm bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Roles */}
                    <div className="space-y-2">
                        <label className="block text-[#1E3A8A] text-sm font-semibold">
                            User Roles <span className="text-red-500">*</span>
                        </label>
                        <Select
                            isMulti
                            options={roleOptions}
                            value={roleOptions.filter((option) => formData.user_role.includes(option.value))}
                            onChange={handleRoleChange}
                            className="text-[#1E3A8A] text-sm"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#E5E7EB',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '0.5rem',
                                    padding: '0.25rem',
                                    '&:hover': { borderColor: '#14B8A6' },
                                    boxShadow: 'none',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: '#14B8A6',
                                    color: 'white',
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: 'white',
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#0D9488' },
                                }),
                            }}
                            placeholder="Select roles..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !isAdmin}
                        className="w-full py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-lg hover:from-[#0D9488] hover:to-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/50 text-base font-semibold shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            'Create Employee'
                        )}
                    </button>
                </form>
                <Toaster position="top-right" />
            </div>
        </div>
    );
};

export default CreateEmployee;