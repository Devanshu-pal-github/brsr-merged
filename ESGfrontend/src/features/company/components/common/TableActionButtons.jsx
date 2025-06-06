import React from 'react';

const TableActionButtons = ({ onReset, onSave, disabled = false }) => {
  return (
    <div className="flex justify-end space-x-3 mt-4 mb-2">
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Reset
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Save Changes
      </button>
    </div>
  );
};

export default TableActionButtons;
