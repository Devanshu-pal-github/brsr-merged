import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const QuestionField = ({ question, value, onChange }) => {
    const [localValue, setLocalValue] = useState(value || {});

    // Update local value when response changes
    useEffect(() => {
        setLocalValue(value || {});
    }, [value]);

    // Handle value change
    const handleChange = (field, newValue) => {
        const updatedValue = {
            ...localValue,
            [field]: newValue
        };
        setLocalValue(updatedValue);
        onChange(updatedValue);
    };

    // Handle multiple fields case
    const renderMultipleFields = () => {
        if (!question.fields) return null;

        return (
            <div className="space-y-4">
                {question.fields.map(field => (
                    <div key={field.id} className="mb-4">
                        <label className="block mb-2 text-sm font-medium">
                            {field.question}
                            {field.string_value_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderFieldInput(field)}
                    </div>
                ))}
            </div>
        );
    };

    // Render input for a single field
    const renderFieldInput = (field) => {
        const fieldValue = localValue[field.id] || {};

        if (field.has_string_value) {
            return (
                <input
                    type="text"
                    value={fieldValue.string_value || ''}
                    onChange={(e) => handleChange(field.id, { 
                        ...fieldValue,
                        string_value: e.target.value 
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.string_value_required}
                />
            );
        }

        if (field.has_decimal_value) {
            return (
                <input
                    type="number"
                    value={fieldValue.decimal_value || ''}
                    onChange={(e) => handleChange(field.id, {
                        ...fieldValue,
                        decimal_value: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.decimal_value_required}
                />
            );
        }

        if (field.has_boolean_value) {
            return (
                <input
                    type="checkbox"
                    checked={fieldValue.bool_value || false}
                    onChange={(e) => handleChange(field.id, {
                        ...fieldValue,
                        bool_value: e.target.checked
                    })}
                    className="mr-2"
                    required={field.boolean_value_required}
                />
            );
        }

        if (field.has_link) {
            return (
                <input
                    type="url"
                    value={fieldValue.link || ''}
                    onChange={(e) => handleChange(field.id, {
                        ...fieldValue,
                        link: e.target.value
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.link_required}
                />
            );
        }

        return null;
    };

    // Render single field case
    const renderSingleField = () => {
        if (question.has_string_value) {
            return (
                <input
                    type="text"
                    value={localValue.string_value || ''}
                    onChange={(e) => handleChange('string_value', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={question.string_value_required}
                />
            );
        }

        if (question.has_decimal_value) {
            return (
                <input
                    type="number"
                    value={localValue.decimal_value || ''}
                    onChange={(e) => handleChange('decimal_value', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={question.decimal_value_required}
                />
            );
        }

        if (question.has_boolean_value) {
            return (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={localValue.bool_value || false}
                        onChange={(e) => handleChange('bool_value', e.target.checked)}
                        className="mr-2"
                        required={question.boolean_value_required}
                    />
                    <span className="text-sm text-gray-600">
                        {localValue.bool_value ? 'Yes' : 'No'}
                    </span>
                </div>
            );
        }

        if (question.has_link) {
            return (
                <input
                    type="url"
                    value={localValue.link || ''}
                    onChange={(e) => handleChange('link', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={question.link_required}
                />
            );
        }

        return null;
    };

    return (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <label className="block mb-2 text-sm font-medium text-gray-900">
                {question.question}
                {(question.string_value_required || question.decimal_value_required || 
                  question.boolean_value_required || question.link_required) && 
                    <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {question.has_multiple_fields ? renderMultipleFields() : renderSingleField()}

            {question.has_note && (
                <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Additional Notes
                        {question.note_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                        value={localValue.note || ''}
                        onChange={(e) => handleChange('note', e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any additional notes..."
                        required={question.note_required}
                    />
                </div>
            )}

            {question.guidance && (
                <div className="mt-2 text-sm text-gray-500">
                    <i>{question.guidance}</i>
                </div>
            )}
        </div>
    );
};

QuestionField.propTypes = {
    question: PropTypes.shape({
        question_id: PropTypes.string.isRequired,
        question: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        has_string_value: PropTypes.bool,
        string_value_required: PropTypes.bool,
        has_decimal_value: PropTypes.bool,
        decimal_value_required: PropTypes.bool,
        has_boolean_value: PropTypes.bool,
        boolean_value_required: PropTypes.bool,
        has_link: PropTypes.bool,
        link_required: PropTypes.bool,
        has_note: PropTypes.bool,
        note_required: PropTypes.bool,
        has_multiple_fields: PropTypes.bool,
        fields: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            question: PropTypes.string.isRequired,
            has_string_value: PropTypes.bool,
            string_value_required: PropTypes.bool,
            has_decimal_value: PropTypes.bool,
            decimal_value_required: PropTypes.bool,
            has_boolean_value: PropTypes.bool,
            boolean_value_required: PropTypes.bool,
            has_link: PropTypes.bool,
            link_required: PropTypes.bool
        })),
        guidance: PropTypes.string
    }).isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired
};

export default QuestionField; 