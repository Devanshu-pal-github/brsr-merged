import React from 'react';
import PropTypes from 'prop-types';

export const FormSection = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {children}
  </section>
);

export const FormField = ({ label, error, children, required }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const validateInput = (value, type) => {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '';
    case 'tel':
      // Allow numbers, spaces, dashes, and plus sign
      return /^[0-9\s\-+()]*$/.test(value) ? value : '';
    case 'url':
      // Basic URL validation
      try {
        if (value) new URL(value);
        return value;
      } catch {
        return '';
      }
    case 'number':
      return !isNaN(value) ? value : '';
    default:
      return value;
  }
};

export const FormInput = ({ value, onChange, type = "text", ...props }) => {
  // Extract the appropriate value based on input type and data structure
  let inputValue = '';
  if (value && typeof value === 'object') {
    if (type === 'number') {
      inputValue = value.decimal_value || '';
    } else {
      inputValue = value.string_value || '';
    }
  } else {
    inputValue = value || '';
  }

  const handleInputChange = (e) => {
    const validatedValue = validateInput(e.target.value, type);
    if (validatedValue !== undefined) {
      e.target.value = validatedValue;
      onChange(e);
    }
  };

  return (
    <input
      {...props}
      type={type}
      value={inputValue}
      onChange={handleInputChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  );
};

export const FormTextArea = ({ placeholder, value, onChange, name, rows = 3, error, required }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    rows={rows}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border ${
      error ? 'border-red-300' : 'border-gray-300'
    } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
      error ? 'text-red-900' : 'text-gray-900'
    }`}
  />
);

export const FormButton = ({ type = 'button', variant = 'primary', children, onClick, disabled }) => {
  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

// PropTypes
FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
};

FormInput.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
};

FormTextArea.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  rows: PropTypes.number,
  error: PropTypes.string,
  required: PropTypes.bool,
};

FormButton.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};
