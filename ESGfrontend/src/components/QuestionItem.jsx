import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';

const QuestionnaireItem = ({ question, answer: answerProp = '', onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [answer, setAnswer] = useState(answerProp);

    // Sync local state with prop
    useEffect(() => {
        setAnswer(answerProp);
    }, [answerProp]);

    const handleAnswerChange = (e) => {
        const newAnswer = e.target.value;
        setAnswer(newAnswer);
        onUpdate(question.question_id, { answer: newAnswer });
    };

    const renderInput = () => {
        if (question.has_decimal_value) {
            return (
                <input
                    type="number"
                    step="0.01"
                    value={answer}
                    onChange={handleAnswerChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={question.decimal_value_required}
                />
            );
        }

        if (question.has_string_value) {
            return (
                <textarea
                    value={answer}
                    onChange={handleAnswerChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    required={question.string_value_required}
                />
            );
        }

        if (question.has_boolean_value) {
            return (
                <select
                    value={answer}
                    onChange={handleAnswerChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={question.boolean_value_required}
                >
                    <option value="">Select an option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            );
        }

        // Default to string input if no specific type is specified
        return (
            <textarea
                value={answer}
                onChange={handleAnswerChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required={question.string_value_required}
            />
        );
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="text-sm font-medium text-gray-700">
                    {question.question}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4">
                    {renderInput()}
                    
                    {question.has_note && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add any additional notes here..."
                                required={question.note_required}
                            />
                        </div>
                    )}

                    {question.has_link && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Link
                            </label>
                            <input
                                type="url"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter reference URL"
                                required={question.link_required}
                            />
                        </div>
                    )}
                </div>
            )}

            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-[#002A85] text-white font-medium px-3 min-w-[43px] min-h-[26px] rounded-[6px] text-xs shadow-sm focus:outline-none transition-all duration-200 hover:bg-[#0A2E87]"
              onClick={handleEditClick}
              aria-label="Edit"
            >
              Edit
            </button>
        </div>
    );
};

export default QuestionnaireItem;