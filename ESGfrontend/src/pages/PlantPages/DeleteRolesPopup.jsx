import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useDeleteEmployeeMutation } from "../../api/apiSlice";
import toast, { Toaster } from "react-hot-toast";

const DeleteEmployeePopup = ({ onClose, employee }) => {
    const [deleteEmployee, { isLoading }] = useDeleteEmployeeMutation();
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await deleteEmployee({
                employee_id: employee.employee_id,
            }).unwrap();
            toast.success("Employee deleted successfully!");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            toast.error(err.data?.detail || "Failed to delete employee");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
            <div ref={popupRef} className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
                <Toaster position="top-right" />
                <div className="flex items-center mb-4">
                    {/* <h1 className="text-lg font-semibold text-[#1A2341]">
                        Delete Employee: {employee.name}
                    </h1> */}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-[#1A2341]">
                            Are you sure you want to delete <strong>{employee.name}</strong> (ID: {employee.employee_id})? This action cannot be undone.
                        </p>
                         {/* <button
                        onClick={onClose}
                        className="text-[#1A2341] hover:text-[#1A2341]/50 transition-all cursor-pointer"
                    >
                        <X size={22} />
                    </button> */}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-[#1A2341] px-4 py-2 rounded-md hover:bg-gray-400 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#1A2341] text-white px-4 py-2 rounded-md cursor-pointer transition-all disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Deleting..." : "Delete Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteEmployeePopup;