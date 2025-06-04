import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, LinkIcon, FileText, Hash, Type } from "lucide-react";
import { useSubmitQuestionAnswerMutation, useStoreQuestionDataMutation, useGenerateTextMutation } from "../api/apiSlice";
import AIResponseDisplay from "./QuestionEdit/AIResponseDisplay";
import ToneSelector from "./QuestionEdit/ToneSelector";
import AIActionButtons from "./QuestionEdit/AIActionButtons";
import FormField from "./QuestionEdit/FormField";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useInactivityDetector } from './QuestionEdit/useInactivityDetector';

// ModalHeader component with toggle button for AI Assistant
const ModalHeader = ({ questionId, questionText, closeModal, isAIAssistantOpen, toggleAIAssistant }) => (
    <div className="relative flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <h2 id={`question-${questionId}-title`} className="text-lg font-semibold text-blue-700 truncate">
            Edit Answer: {questionText}
        </h2>
        <div className="flex items-center space-x-2">
            <button
                onClick={toggleAIAssistant}
                className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 drop-shadow-[0_0_10px_rgba(79,70,229,0.5)] animate-spin-slow flex items-center justify-center"
                aria-label={isAIAssistantOpen ? "Hide Mini AI Assistant" : "Show Mini AI Assistant"}
            >
                <svg className="w-5 h-5 logo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                </svg>
            </button>
            <button
                onClick={closeModal}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close modal"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
);

export const MiniAIAssistantAction = {
    EXPLAIN_THIS_QUESTION: "EXPLAIN_THIS_QUESTION",
    RECOMMEND_AI_ANSWER: "RECOMMEND_AI_ANSWER",
    BREAK_DOWN_QUESTION: "BREAK_DOWN_QUESTION",
    IDENTIFY_KEY_TERMS: "IDENTIFY_KEY_TERMS",
    CHECK_TONE_CONSISTENCY: "CHECK_TONE_CONSISTENCY",
    SUGGEST_ALTERNATIVE_PHRASING: "SUGGEST_ALTERNATIVE_PHRASING",
    SUMMARIZE_ANSWER: "SUMMARIZE_ANSWER",
    REFINE_ANSWER: "REFINE_ANSWER",
    QUICK_COMPLIANCE_CHECK: "QUICK_COMPLIANCE_CHECK",
    IMPROVE_CLARITY: "IMPROVE_CLARITY",
    EXPAND_ANSWER: "EXPAND_ANSWER",
    MAKE_MORE_CONCISE: "MAKE_MORE_CONCISE",
    CHECK_COMPLETENESS: "CHECK_COMPLETENESS",
    EXPLAIN_ACRONYMS: "EXPLAIN_ACRONYMS",
    SUGGEST_DATA_SOURCES: "SUGGEST_DATA_SOURCES",
    SUGGEST_TABLE_STRUCTURE: "SUGGEST_TABLE_STRUCTURE",
    ELABORATE_DRAFT: "ELABORATE_DRAFT",
    CONDENSE_DRAFT: "CONDENSE_DRAFT",
    GENERATE_FOLLOWUP_QUESTIONS_FOR_USER: "GENERATE_FOLLOWUP_QUESTIONS_FOR_USER",
    COMPARE_WITH_BEST_PRACTICE: "COMPARE_WITH_BEST_PRACTICE",
    SUMMARIZE_SELECTION: "SUMMARIZE_SELECTION",
    REFINE_SELECTION: "REFINE_SELECTION",
    EXPLAIN_SELECTION: "EXPLAIN_SELECTION"
};

const QuestionInputType = {
    TEXTAREA: "TEXTAREA",
    DECIMAL: "DECIMAL",
    CHOICE: "CHOICE",
    TABLE_LIKE: "TABLE_LIKE"
};

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
    const [leftAiMessage, setLeftAiMessage] = useState(null); // New state for left panel AI responses
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

    // useEffect(() => {
    //     if (isAIAssistantOpen && !aiMessage) {
    //         handleQuickAIAction(MiniAIAssistantAction.EXPLAIN_THIS_QUESTION);
    //     }
    // }, [isAIAssistantOpen]);

    useInactivityDetector({
        timeouts: [300000],
        onTimeout: () => {
            setAiMessage(null);
            setLeftAiMessage(null); // Clear left panel message on timeout
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

    const getFieldIcon = (fieldType) => {
        switch (fieldType) {
            case "string": return <Type className="w-4 h-4 text-gray-500" />;
            case "decimal": return <Hash className="w-4 h-4 text-gray-500" />;
            case "link": return <LinkIcon className="w-4 h-4 text-gray-500" />;
            case "note": return <FileText className="w-4 h-4 text-gray-500" />;
            case "boolean": return <CheckCircle className="w-5 h-5 text-gray-600" />;
            default: return null;
        }
    };

    const handleTextareaSelectionChange = useCallback(() => {
        if (textareaRef.current && isTextareaFocused && question.has_string_value) {
            const selection = window.getSelection().toString();
            setSelectedTextInTextarea(selection);
        } else {
            setSelectedTextInTextarea(null);
        }
    }, [isTextareaFocused, question]);

    const handleQuickAIAction = useCallback(async (action, suggestion = null) => {
        if (action === "USE_THIS") {
            setFormData(prev => ({ ...prev, string_value: suggestion }));
            setAiMessage(null);
            setLeftAiMessage(null); // Clear left panel message when using the suggestion
            return;
        }

        setIsLoading(true);
        setError(null);
        setAiMessage(null);
        setLeftAiMessage(null);

        try {
            let prompt;
            const currentValue = formData?.string_value || "";

            switch (action) {
                case MiniAIAssistantAction.EXPLAIN_THIS_QUESTION:
                    prompt = `Explain the following question in the context of sustainability reporting: "${question.question}"`;
                    break;
                case MiniAIAssistantAction.RECOMMEND_AI_ANSWER:
                    prompt = `Generate a professional answer for the question: "${question.question}" ${currentValue ? `based on the draft: "${currentValue}"` : ''}`;
                    break;
                case MiniAIAssistantAction.BREAK_DOWN_QUESTION:
                    prompt = `Break down the following question into smaller components and explain what information is needed for each: "${question.question}"`;
                    break;
                case MiniAIAssistantAction.IDENTIFY_KEY_TERMS:
                    prompt = `Identify and explain key terms in the following question and draft answer: Question: "${question.question}" ${currentValue ? `Draft: "${currentValue}"` : ''}`;
                    break;
                case MiniAIAssistantAction.CHECK_TONE_CONSISTENCY:
                    prompt = `Check the tone consistency of the following draft answer: "${currentValue}" and suggest improvements to make it more ${refineTone}`;
                    break;
                case MiniAIAssistantAction.SUGGEST_ALTERNATIVE_PHRASING:
                    prompt = `Suggest alternative professional phrasing for the following draft answer while maintaining accuracy: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.SUMMARIZE_ANSWER:
                    prompt = `Provide a concise summary highlighting key points from this draft answer: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.REFINE_ANSWER:
                    prompt = `Refine and enhance the following draft answer to be more ${refineTone} and comprehensive: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK:
                    prompt = `Perform a quick compliance check for this sustainability report answer, highlighting any potential issues or missing elements: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.IMPROVE_CLARITY:
                    prompt = `Improve the clarity and readability of this answer while maintaining its meaning: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.EXPAND_ANSWER:
                    prompt = `Expand this answer with more detailed information and examples while maintaining professionalism: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.MAKE_MORE_CONCISE:
                    prompt = `Make this answer more concise while retaining all important information: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.CHECK_COMPLETENESS:
                    prompt = `Analyze this answer for completeness and suggest any missing information or aspects that should be addressed: "${currentValue}"`;
                    break;
                case MiniAIAssistantAction.EXPLAIN_ACRONYMS:
                    prompt = `Identify and explain any acronyms present in the user's draft answer in not more than 100 words in the context of sustainability reporting.`;
                    break;
                case MiniAIAssistantAction.SUGGEST_DATA_SOURCES:
                    prompt = `Suggest reliable data sources or methods for collecting data to answer the question accurately in the context of sustainability reporting, in not more than 100 words.`;
                    break;
                case MiniAIAssistantAction.SUGGEST_TABLE_STRUCTURE:
                    prompt = `Suggest a table structure for organizing the answer to the question in the context of sustainability reporting in not more than 100 words.`;
                    break;
                case MiniAIAssistantAction.ELABORATE_DRAFT:
                    prompt = `Elaborate on the user's draft answer by adding more details and context relevant to sustainability reporting in not more than 100 words.`;
                    break;
                case MiniAIAssistantAction.CONDENSE_DRAFT:
                    prompt = `Condense the user's draft answer in not more than 100 words by removing unnecessary details, focusing on key points relevant to sustainability reporting.`;
                    break;
                case MiniAIAssistantAction.GENERATE_FOLLOWUP_QUESTIONS_FOR_USER:
                    prompt = `Generate follow-up questions based on the question and draft answer in not more than 100 words to help the user provide more comprehensive information.`;
                    break;
                case MiniAIAssistantAction.COMPARE_WITH_BEST_PRACTICE:
                    prompt = `Compare the user's draft answer with best practices in sustainability reporting and suggest improvements in not more than 100 words.`;
                    break;
                case MiniAIAssistantAction.SUMMARIZE_SELECTION:
                    prompt = `Summarize the selected text from the user's draft answer in not more than 100 words, keeping key points concise and relevant: "${selectedTextInTextarea}"`;
                    break;
                case MiniAIAssistantAction.REFINE_SELECTION:
                    prompt = `Refine the selected text from the user's draft answer in not more than 100 words to improve clarity and alignment with tone "${refineTone}": "${selectedTextInTextarea}"`;
                    break;
                case MiniAIAssistantAction.EXPLAIN_SELECTION:
                    prompt = `Explain the meaning or significance of the selected text in not more than 100 words in the context of the question: "${selectedTextInTextarea}"`;
                    break;
                default:
                    prompt = `${action} for question: "${question.question}" with draft: "${currentValue}"`;
            }

            const context = {
                questionText: question.question,
                guidanceText: question.guidance || "",
                metadata: {
                    question_id: question.question_id,
                    module_id: moduleId
                },
                answer: currentValue
            };

            const response = await generateText({ message: prompt, context }).unwrap();
            const message = {
                id: Date.now().toString(),
                action,
                text: response,
                suggestion: response.includes('revised version:') ?
                    response.split('revised version:')[1].trim() :
                    action === MiniAIAssistantAction.RECOMMEND_AI_ANSWER ? response : null,
                confidence: 'medium'
            };

            // Check if the action is one of the left panel actions
            const leftActions = [
                MiniAIAssistantAction.RECOMMEND_AI_ANSWER,
                MiniAIAssistantAction.EXPLAIN_THIS_QUESTION,
                MiniAIAssistantAction.BREAK_DOWN_QUESTION,
                MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK
            ];
            if (leftActions.includes(action)) {
                setLeftAiMessage(message);
            } else {
                setAiMessage(message);
            }
        } catch (err) {
            setError(err?.data?.detail || 'Failed to fetch AI response. Please try again.');
            setErrors(prev => ({ ...prev, ai: 'Failed to fetch AI response' }));
        } finally {
            setIsLoading(false);
        }
    }, [question, formData, refineTone, generateText, moduleId, selectedTextInTextarea]);

    const handleRefineDraftWithTone = () => {
        const textToRefine = selectedTextInTextarea || formData.string_value;
        if (textToRefine.trim()) {
            handleQuickAIAction(MiniAIAssistantAction.REFINE_ANSWER);
        }
    };

    const renderTableAsMarkdown = (tableData, rows) => {
        if (!rows || rows.length === 0) return '';

        const header = `| ${tableData.join(' | ')} |\n| ${tableData.map(() => '---').join(' | ')} |`;
        const body = rows
            .map(row => {
                const cells = row.split('|').map(cell => cell.trim());
                return `| ${cells.join(' | ')} |`;
            })
            .join('\n');

        return `${header}\n${body}`;
    };

    const renderStringValueField = () => {
        const inputType = question.input_type || QuestionInputType.TEXTAREA;

        if (inputType === QuestionInputType.TABLE_LIKE) {
            const tableData = leftAiMessage?.action === MiniAIAssistantAction.SUGGEST_TABLE_STRUCTURE
                ? (leftAiMessage.points || ['Category', 'Value', 'Description'])
                : ['Category', 'Value', 'Description'];
            const rows = formData.string_value ? formData.string_value.split('\n').map(row => row.split('|')) : [tableData.map(() => '')];

            return (
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        {getFieldIcon("string")} Response {question.string_value_required && <span className="text-red-500 text-xs">*</span>}
                    </label>
                    <div className="w-full">
                        <table className="w-full border-collapse border border-gray-300" role="grid">
                            <thead>
                                <tr>
                                    {tableData.map((col, i) => (
                                        <th key={i} className="border border-gray-500 p-2 bg-gray-100 text-sm font-semibold text-gray-700" scope="col">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {tableData.map((_, colIndex) => (
                                            <td key={colIndex} className="border border-gray-300 p-2">
                                                <input
                                                    type="text"
                                                    value={row[colIndex] || ''}
                                                    onChange={(e) => {
                                                        const newRows = [...rows];
                                                        newRows[rowIndex][colIndex] = e.target.value;
                                                        setFormData(prev => ({ ...prev, string_value: newRows.map(r => r.join('|')).join('\n') }));
                                                    }}
                                                    className="w-full p-1 text-sm border-none focus:ring-0 focus:outline-none"
                                                    aria-label={`${tableData[colIndex]} for row ${rowIndex + 1}`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={() => {
                                const newRows = [...rows, tableData.map(() => '')];
                                setFormData(prev => ({ ...prev, string_value: newRows.map(r => r.join('|')).join('\n') }));
                            }}
                            className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Add new row to table"
                        >
                            Add Row
                        </button>
                        {formData.string_value.trim().length > 0 && (
                            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-800 mb-2">Table Preview:</h3>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                        {renderTableAsMarkdown(tableData, formData.string_value.split('\n'))}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                    {errors?.string_value && (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            {errors.string_value}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    {getFieldIcon("string")} Response {question.string_value_required && <span className="text-red-500 text-xs">*</span>}
                </label>
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        name="string_value"
                        value={formData.string_value || ""}
                        onChange={(e) => handleInputChange(e, "string")}
                        onFocus={() => setIsTextareaFocused(true)}
                        onBlur={() => setTimeout(() => setIsTextareaFocused(false), 200)}
                        onMouseUp={handleTextareaSelectionChange}
                        onKeyUp={handleTextareaSelectionChange}
                        onSelect={handleTextareaSelectionChange}
                        onTouchEnd={handleTextareaSelectionChange}
                        placeholder="Enter your response..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 text-sm transition-all duration-200 resize-y min-h-[100px] max-h-[300px]"
                        rows={4}
                    />
                </div>
                {formData.string_value.trim().length > 0 && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Answer Preview:</h3>
                        <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                {formData.string_value}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
                {errors?.string_value && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        {errors.string_value}
                    </div>
                )}
            </div>
        );
    };

    const renderDecimalValueField = () => (
        <FormField
            type="number"
            name="decimal_value"
            label="Numeric Value"
            icon={getFieldIcon("decimal")}
            value={formData.decimal_value}
            onChange={(e) => handleInputChange(e, "decimal")}
            placeholder="Enter a number"
            required={question.decimal_value_required}
            error={errors?.decimal_value}
            step="any"
            className="space-y-3"
        />
    );

    const renderBooleanValueField = () => (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                {getFieldIcon("boolean")} Yes/No Response {question.boolean_value_required && <span className="text-red-500 text-xs">*</span>}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    name="boolean_value"
                    checked={formData.boolean_value || false}
                    onChange={(e) => handleInputChange(e, "boolean")}
                    className="w-4 h-4 accent-blue-500 rounded focus:ring-2 focus:ring-blue-500/50"
                />
                <span className="text-sm text-gray-800">{formData.boolean_value ? "Yes" : "No"}</span>
            </div>
            {errors?.boolean_value && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {errors.boolean_value}
                </div>
            )}
        </div>
    );

    const renderLinkField = () => (
        <FormField
            type="text"
            name="link"
            label="Link/URL"
            icon={getFieldIcon("link")}
            value={formData.link}
            onChange={(e) => handleInputChange(e, "link")}
            placeholder="Enter a URL"
            required={question.link_required}
            error={errors.link}
            className="space-y-3"
        />
    );

    const renderNoteField = () => (
        <FormField
            type="textarea"
            name="note"
            label="Additional Notes"
            icon={getFieldIcon("note")}
            value={formData.note}
            onChange={(e) => handleInputChange(e, "note")}
            placeholder="Enter additional notes..."
            required={question.note_required}
            error={errors.note}
            className="space-y-3"
        />
    );

    const renderLeftAIActions = () => {
        const leftActions = [
            { action: MiniAIAssistantAction.RECOMMEND_AI_ANSWER, icon: 'SparklesIcon', title: "Draft" },
            { action: MiniAIAssistantAction.EXPLAIN_THIS_QUESTION, icon: 'InformationCircleIcon', title: "Explain Question" },
            { action: MiniAIAssistantAction.BREAK_DOWN_QUESTION, icon: 'DocumentTextIcon', title: "Break Down Question" },
            { action: MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK, icon: 'ShieldCheckIcon', title: "Compliance Check", requiresDraft: true },
        ];

        const iconMap = {
            SparklesIcon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            ),
            InformationCircleIcon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            DocumentTextIcon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-9-8h.01M4 4h16v16H4V4z" />
                </svg>
            ),
            ShieldCheckIcon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.504A9.956 9.956 0 0112 2C6.48 2 2 6.48 2 12a9.956 9.956 0 014.382 7.496l-1.392 1.392A1 1 0 005.172 22h13.656a1 1 0 00.707-1.707l-1.392-1.392z" />
                </svg>
            ),
        };

        const hasDraft = formData.string_value?.trim().length > 0;

        return (
            <div className="space-y-4">
                <div className="flex justify-center space-x-3 mt-4">
                    {leftActions.map(({ action, icon, title, requiresDraft }) => {
                        const isDisabled = isLoading || (requiresDraft && !hasDraft);
                        return (
                            <button
                                key={action}
                                onClick={() => handleQuickAIAction(action)}
                                title={title}
                                className={`p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed`}
                                disabled={isDisabled}
                                aria-label={title}
                            >
                                {iconMap[icon]}
                            </button>
                        );
                    })}
                </div>
                {leftAiMessage && (
                    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                        {isLoading ? (
                            <div className="text-gray-500 text-sm">Loading...</div>
                        ) : error ? (
                            <div className="text-red-600 text-sm flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        ) : (
                            <div>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                        {leftAiMessage.text}
                                    </ReactMarkdown>
                                </div>
                                {leftAiMessage.suggestion && (
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => handleQuickAIAction("USE_THIS", leftAiMessage.suggestion)}
                                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label="Use this AI suggestion"
                                        >
                                            Use This
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderRightAIActions = () => {
        const leftActionKeys = [
            MiniAIAssistantAction.RECOMMEND_AI_ANSWER,
            MiniAIAssistantAction.EXPLAIN_THIS_QUESTION,
            MiniAIAssistantAction.BREAK_DOWN_QUESTION,
            MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK
        ];
        const remainingActions = Object.entries(MiniAIAssistantAction)
            .filter(([key]) => !leftActionKeys.includes(key))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        return (
            <AIActionButtons
                selectedTextInTextarea={selectedTextInTextarea}
                handleQuickAIAction={handleQuickAIAction}
                actions={remainingActions}
                currentValue={formData.string_value}
            />
        );
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
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {question.has_string_value && renderStringValueField()}
                                    {question.has_decimal_value && renderDecimalValueField()}
                                    {question.has_boolean_value && renderBooleanValueField()}
                                    {question.has_link && renderLinkField()}
                                    {question.has_note && renderNoteField()}
                                    {errors?.form && (
                                        <div className="mt-4 flex items-center gap-1 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.form}
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                {renderLeftAIActions()}
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
                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                                        <ToneSelector
                                            refineTone={refineTone}
                                            setRefineTone={setRefineTone}
                                            handleRefineDraftWithTone={handleRefineDraftWithTone}
                                            currentValue={formData.string_value}
                                            selectedTextInTextarea={selectedTextInTextarea}
                                            isLoading={isLoading}
                                        />
                                    </div>
                                    <div className="flex-1 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
                                        {renderRightAIActions()}
                                        {aiMessage && (
                                            <div className="mt-4">
                                                <AIResponseDisplay
                                                    aiMessage={aiMessage}
                                                    isLoading={isLoading}
                                                    error={error}
                                                    handlePostResponseAction={handleQuickAIAction}
                                                />
                                            </div>
                                        )}
                                    </div>
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