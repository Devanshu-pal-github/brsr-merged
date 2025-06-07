// Fix FormInput component to handle object values properly
export const FormInput = ({ value, onChange, ...props }) => {
  // Convert object values to string representation
  const inputValue = value?.string_value || value?.decimal_value || '';

  return (
    <input
      {...props}
      value={inputValue} 
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  );
};
