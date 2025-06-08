import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
    selectResponseByQuestionId,
    selectIsQuestionUnsaved,
    markUnsaved,
    saveResponse
} from '../../store/responses';

const QuestionField = ({ question, companyId }) => {
    const dispatch = useDispatch();
    const response = useSelector(state => selectResponseByQuestionId(state, question.question_id));
    const isUnsaved = useSelector(state => selectIsQuestionUnsaved(state, question.question_id));
    
    const [localValue, setLocalValue] = useState({
        string_value: response?.string_value || '',
        bool_value: response?.bool_value || false,
        decimal_value: response?.decimal_value || null,
        link: response?.link || '',
        note: response?.note || ''
    });

    // Update local value when response changes
    useEffect(() => {
        if (response) {
            setLocalValue({
                string_value: response.string_value || '',
                bool_value: response.bool_value || false,
                decimal_value: response.decimal_value || null,
                link: response.link || '',
                note: response.note || ''
            });
        }
    }, [response]);

    // Debounced save function
    const debouncedSave = debounce((value) => {
        dispatch(saveResponse({
            companyId,
            questionId: question.question_id,
            responseData: value
        }));
    }, 1000);

    // Handle value change
    const handleChange = (field, value) => {
        const newValue = {
            ...localValue,
            [field]: value
        };
        setLocalValue(newValue);
        dispatch(markUnsaved(question.question_id));
        debouncedSave(newValue);
    };

    // Render different input types based on question type
    const renderInput = () => {
        if (question.has_string_value) {
            return (
                <div className="mb-4">
                    <input
                        type="text"
                        value={localValue.string_value}
                        onChange={(e) => handleChange('string_value', e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={question.string_value_required}
                    />
                </div>
            );
        }

        if (question.has_decimal_value) {
            return (
                <div className="mb-4">
                    <input
                        type="number"
                        value={localValue.decimal_value || ''}
                        onChange={(e) => handleChange('decimal_value', parseFloat(e.target.value))}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={question.decimal_value_required}
                    />
                </div>
            );
        }

        if (question.has_boolean_value) {
            return (
                <div className="mb-4">
                    <input
                        type="checkbox"
                        checked={localValue.bool_value}
                        onChange={(e) => handleChange('bool_value', e.target.checked)}
                        className="mr-2"
                        required={question.boolean_value_required}
                    />
                </div>
            );
        }

        if (question.has_link) {
            return (
                <div className="mb-4">
                    <input
                        type="url"
                        value={localValue.link}
                        onChange={(e) => handleChange('link', e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={question.link_required}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="mb-6">
            <label className="block mb-2 font-medium">
                {question.question}
                {isUnsaved && <span className="ml-2 text-yellow-500">(Unsaved changes)</span>}
            </label>
            {renderInput()}
            {question.has_note && (
                <textarea
                    value={localValue.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                    required={question.note_required}
                />
            )}
        </div>
    );
};

export default QuestionField; 