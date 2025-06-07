import { useState, useEffect } from "react";
import { X, User, Mail, Lock, Hash, Briefcase } from "lucide-react";
import { useCreateEmployeeMutation } from "../api/apiSlice";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

const CreateEmployeePopup = ({ onClose }) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    password: "",
    department: "",
    user_role: [],
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const navigate = useNavigate();

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "hr", label: "HR" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const roles = decoded.user_role || [];
        setIsAdmin(roles.includes("Plant Admin") || roles.includes("admin"));
        if (!roles.includes("Plant Admin") && !roles.includes("admin")) {
          toast.error("Access denied. Only admins can create employees.");
        }
      } catch (err) {
        toast.error("Invalid token. Please log in again.");
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    } else {
      toast.error("Please log in to access this page.");
      navigate("/login");
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
      toast.error("Access denied. Only admins can create employees.");
      return;
    }

    try {
      await createEmployee(formData).unwrap();
      toast.success("Employee created successfully!");
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      toast.error(
        err.data?.detail || "Failed to create employee. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[1.2vw] font-semibold text-[#1A2341]">
            Create Employee
          </h1>
          <button
            onClick={onClose}
            className="text-[#1A2341] hover:text-[#1A2341]/50 transition-all cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>
        <Toaster position="top-right" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={Hash}
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              placeholder="Employee ID"
              label="Employee ID"
              required
            />
            <InputField
              icon={User}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              label="Name"
              required
            />
            <InputField
              icon={Mail}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              label="Email"
              required
            />
            <InputField
              icon={Lock}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              label="Password"
              required
            />
            <InputField
              icon={Briefcase}
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Department"
              label="Department"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1A2341]">
              User Roles <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              options={roleOptions}
              value={roleOptions.filter((option) =>
                formData.user_role.includes(option.value)
              )}
              onChange={handleRoleChange}
              placeholder="Select roles..."
            />
          </div>

          <div className="flex">
            <button
              type="submit"
              disabled={isLoading || !isAdmin}
              className="bg-[#1A2341] text-white text-lg px-4 py-2 rounded-md cursor-pointer transition-all disabled:bg-gray-400 disabled:cursor-not-allowed ml-auto"
            >
              {isLoading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-[#1A2341]">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2341] bg-white text-sm"
        required={required}
      />
    </div>
  </div>
);

export default CreateEmployeePopup;