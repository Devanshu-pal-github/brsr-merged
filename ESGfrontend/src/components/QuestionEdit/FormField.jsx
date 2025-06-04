import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FormField = ({
    type = 'text',
    label,
    icon,
    required,
    value,
    onChange,
    error,
    name,
    placeholder,
    ...props
}) => {
    const isTextarea = type === 'textarea';
    const InputComponent = isTextarea ? 'textarea' : 'input';

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                {icon}
                {label} {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            <div className="relative">
                <InputComponent
                    type={type}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 ${isTextarea ? 'resize-y min-h-[100px]' : ''}`}
                    required={required}
                    rows={isTextarea ? 3 : undefined}
                    {...props}
                />
                {props.children}
            </div>
            {error && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default FormField;