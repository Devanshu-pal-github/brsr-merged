import React from 'react';

const ValidationMessage = ({ message, type = 'error' }) => {
    const getColorClasses = () => {
        switch (type) {
            case 'error':
                return 'bg-red-100 text-red-700 border-red-400';
            case 'warning':
                return 'bg-yellow-100 text-yellow-700 border-yellow-400';
            case 'success':
                return 'bg-green-100 text-green-700 border-green-400';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };

    if (!message) return null;

    return (
        <div className={`p-2 mb-4 border rounded ${getColorClasses()}`}>
            <p className="text-sm">{message}</p>
        </div>
    );
};

export default ValidationMessage; 