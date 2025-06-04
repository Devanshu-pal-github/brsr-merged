import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSubmitQuestionAnswerMutation, useStoreQuestionDataMutation, useGenerateTextMutation } from "../api/apiSlice";
import { useInactivityDetector } from './QuestionEdit/useInactivityDetector';
import ModalHeader from '../components/QuestionEdit/ModalHeader';
import FormFields from '../components/QuestionEdit/FormFields';
import { LeftAIActions, RightAIActionsContent } from '../components/QuestionEdit/AIActions';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

const QuestionEditPopup = ({ question, initialAnswer, onClose, onSuccess, moduleId }) => {
    const [formData, setFormData] = useState({
        string_value: initialAnswer?.string_value || "",
        decimal_value: initialAnswer?.decimal_value || "",
        boolean_value: initialAnswer?.boolean_value || false,
        link: initialAnswer?.link || "",
        note: initialAnswer?.note || ""
    });
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [submitAnswer] = useSubmitQuestionAnswerMutation();
    const [storeQuestionData] = useStoreQuestionDataMutation();
    const [generateText] = useGenerateTextMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    const [selectedTextInTextarea, setSelectedTextInTextarea] = useState(null);
    const [aiMessage, setAiMessage] = useState(null);
    const [leftAiMessage, setLeftAiMessage] = useState(null);
    const [refineTone, setRefineTone] = useState("concise");
    const textareaRef = useRef(null);
    const leftPanelRef = useRef(null);

    useEffect(() => {
        setIsVisible(true);
        if (initialAnswer) {
            setFormData({
                string_value: initialAnswer?.string_value || "",
                decimal_value: initialAnswer?.decimal_value || "",
                boolean_value: initialAnswer?.boolean_value || false,
                link: initialAnswer?.link || "",
                note: initialAnswer?.note || ""
            });
        }
    }, [initialAnswer]);

    useInactivityDetector({
        timeouts: [300000],
        onTimeout: () => {
            setAiMessage(null);
            setLeftAiMessage(null);
            setError(null);
            setIsLoading(false);
        }
    });

    const handleInputChange = (e, fieldType) => {
        const { name, value, type, checked } = e.target;
        let isValid = true;
        let errorMessage = "";
        if (fieldType === "string") {
            if (question.string_value_required && !value.trim()) {
                isValid = false;
                errorMessage = "This field is required.";
            }
        } else if (fieldType === "decimal") {
            if (isNaN(value) || value === "") {
                isValid = false;
                errorMessage = "Please enter a valid number.";
            }
        } else if (fieldType === "link") {
            const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
            if (value && !urlRegex.test(value)) {
                isValid = false;
                errorMessage = "Please enter a valid URL.";
            }
        }

        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: isValid ? "" : errorMessage }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const requiredFields = [];

        if (question.string_value_required && !formData.string_value) requiredFields.push("String value is required.");
        if (question.decimal_value_required && !formData.decimal_value) requiredFields.push("Decimal value is required.");
        if (question.boolean_value_required && formData.boolean_value === undefined) requiredFields.push("Boolean value is required.");
        if (question.link_required && !formData.link) requiredFields.push("Link is required.");
        if (question.note_required && !formData.note) requiredFields.push("Note is required.");

        if (hasErrors || requiredFields.length > 0) {
            setErrors((prev) => ({ ...prev, form: requiredFields.join(" ") }));
            return;
        }

        try {
            const response = {
                question_id: question.question_id,
                response: {
                    string_value: question.has_string_value ? formData.string_value || null : undefined,
                    decimal_value: question.has_decimal_value ? (formData.decimal_value ? Number(formData.decimal_value) : null) : undefined,
                    bool_value: question.has_boolean_value ? formData.boolean_value || null : undefined,
                    link: question.has_link ? formData.link || null : undefined,
                    note: question.has_note ? formData.note || null : undefined
                }
            };

            Object.keys(response.response).forEach(key =>
                response.response[key] === undefined && delete response.response[key]
            );

            const result = await submitAnswer({
                questionId: question.question_id,
                answerData: response.response
            }).unwrap();

            await storeQuestionData({
                moduleId,
                questionId: question.question_id,
                metadata: {
                    question_text: question.question,
                    has_string_value: question.has_string_value,
                    has_decimal_value: question.has_decimal_value,
                    has_boolean_value: question.has_boolean_value,
                    has_link: question.has_link,
                    has_note: question.has_note,
                    string_value_required: question.string_value_required,
                    decimal_value_required: question.decimal_value_required,
                    boolean_value_required: question.boolean_value_required,
                    link_required: question.link_required,
                    note_required: question.note_required
                },
                answer: response.response
            });

            onSuccess?.(question.question_id, response.response);
            onClose();
        } catch (error) {
            setErrors((prev) => ({ ...prev, form: "Failed to submit answer. Please try again." }));
        }
    };

    const sharedAIActionsProps = {
        formData,
        setFormData,
        question,
        moduleId,
        selectedTextInTextarea,
        setSelectedTextInTextarea,
        generateText,
        isLoading,
        setIsLoading,
        error,
        setError,
        setErrors,
        aiMessage,
        setAiMessage,
        leftAiMessage,
        setLeftAiMessage,
        refineTone,
        setRefineTone,
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`question-${question.question_id}-title`}
        >
            <div className="relative">
                <motion.div
                    className={`bg-white rounded-2xl shadow-xl transition-all duration-700 ease-in-out flex flex-col overflow-hidden ${isAIAssistantOpen ? 'w-[90vw] max-w-6xl' : 'w-[70vw] max-w-4xl'} h-[80vh]`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: isVisible ? 1 : 0.95, opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <ModalHeader
                        questionId={question.question_id}
                        questionText={question.question}
                        closeModal={onClose}
                        isAIAssistantOpen={isAIAssistantOpen}
                        toggleAIAssistant={() => setIsAIAssistantOpen(prev => !prev)}
                    />
                    <div className="flex flex-1 overflow-hidden">
                        <div
                            ref={leftPanelRef}
                            className="flex-1 flex flex-col overflow-y-auto px-6 py-4 border-r border-gray-200 bg-gray-50"
                        >
                            <div className="flex-1">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{question.question}</h3>
                                    {question.guidance && (
                                        <div
                                            id={`question-${question.question_id}-guidance`}
                                            className="text-sm text-blue-600 mt-2 bg-blue-50 p-3 rounded-lg shadow-sm"
                                        >
                                            <svg className="w-4 h-4 mb-1 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <ReactMarkdown rehypePlugins={[rehypeSanitize]} className="inline-block">
                                                {question.guidance}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                <FormFields
                                    question={question}
                                    formData={formData}
                                    errors={errors}
                                    handleInputChange={handleInputChange}
                                    setFormData={setFormData}
                                    isTextareaFocused={isTextareaFocused}
                                    setIsTextareaFocused={setIsTextareaFocused}
                                    setSelectedTextInTextarea={setSelectedTextInTextarea}
                                    textareaRef={textareaRef}
                                    leftAiMessage={leftAiMessage}
                                />
                            </div>
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                <LeftAIActions {...sharedAIActionsProps} />
                            </div>
                        </div>
                        <motion.div
                            className="overflow-hidden"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: isAIAssistantOpen ? '40%' : 0,
                                opacity: isAIAssistantOpen ? 1 : 0,
                                minWidth: isAIAssistantOpen ? '300px' : 0
                            }}
                            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
                        >
                            {isAIAssistantOpen && (
                                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-4 bg-white h-full">
                                    <RightAIActionsContent {...sharedAIActionsProps} />
                                </div>
                            )}
                        </motion.div>
                    </div>
                    <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-white">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label="Cancel changes"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Save answer"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Save Answer'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default QuestionEditPopup;