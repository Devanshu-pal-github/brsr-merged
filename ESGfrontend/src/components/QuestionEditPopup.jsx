import { useCallback, useRef, useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, LinkIcon, FileText, Hash, Type } from "lucide-react";
import { useSubmitQuestionAnswerMutation, useStoreQuestionDataMutation, useGenerateTextMutation } from "../api/apiSlice";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const MiniAIAssistantAction = {
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
    CHECK_COMPLETENESS: "CHECK_COMPLETENESS"
};

// AIResponseDisplay component with enhanced UI and features
const AIResponseDisplay = ({ aiMessage, isLoading, error, handlePostResponseAction }) => {
    if (isLoading) {
        return (
            <div className="mt-2 px-4 py-3 border border-blue-300 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                    <div className="text-blue-600 font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        AI is thinking...
                    </div>
                </div>
                <p className="text-blue-600/70 text-xs mt-1">Analyzing your question and generating a response...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-2 px-4 py-3 border border-red-300 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600/70 text-sm mt-1">{error}</p>
                <button 
                    onClick={() => handlePostResponseAction(aiMessage?.action)} 
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!aiMessage) return null;

    return (
        <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown 
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                        p: ({node, ...props}) => <p className="text-sm text-gray-600 mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm text-gray-600 mb-1" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                    }}
                >
                    {aiMessage.text}
                </ReactMarkdown>
            </div>
            {aiMessage.suggestion && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                        onClick={() => handlePostResponseAction("USE_THIS", aiMessage.suggestion)}
                        className="w-full p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Use This Suggestion
                    </button>
                </div>
            )}
        </div>
    );
};

const QuestionEditPopup = ({ question, initialAnswer, onClose, onSuccess, moduleId }) => {
    console.log('Rendering QuestionEditPopup for question:', question.question_id);
    console.log('Initial answer:', initialAnswer);    const [formData, setFormData] = useState({
        string_value: initialAnswer?.string_value || "",
        decimal_value: initialAnswer?.decimal_value || "",
        boolean_value: initialAnswer?.boolean_value || false,
        link: initialAnswer?.link || "",
        note: initialAnswer?.note || ""
    });
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [submitAnswer] = useSubmitQuestionAnswerMutation();
    const [storeQuestionData] = useStoreQuestionDataMutation();
    const [generateText] = useGenerateTextMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    const [selectedTextInTextarea, setSelectedTextInTextarea] = useState(null);
    const [aiMessage, setAiMessage] = useState(null);
    const [refineTone, setRefineTone] = useState("professional");
    const textareaRef = useRef(null);    useEffect(() => {
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

            console.log('📥 Submitting answer:', response);
            const result = await submitAnswer({
                questionId: question.question_id,
                answerData: response.response
            }).unwrap();
            console.log('✅ Answer submitted successfully:', result);

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
            console.error('Error submitting answer:', error);
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
    }, [isTextareaFocused, question]);    const handleQuickAIAction = useCallback(async (action) => {
        setIsLoading(true);
        setErrors(null);
        setAiMessage(null);

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
                default:
                    prompt = `${action} for question: "${question.question}" with draft: "${currentValue}"`;
            }

            // Use RTK Query to generate text
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
            setAiMessage({
                id: Date.now().toString(),
                action,
                text: response,
                suggestion: response.includes('revised version:') ? 
                    response.split('revised version:')[1].trim() : 
                    action === MiniAIAssistantAction.RECOMMEND_AI_ANSWER ? response : null
            });        } catch (err) {
            console.error('AI Action Error:', err);
            setError(err?.data?.detail || 'Failed to fetch AI response. Please try again.');
            setErrors(prev => ({ ...prev, ai: 'Failed to fetch AI response' }));
        } finally {
            setIsLoading(false);
        }
    }, [question, formData, refineTone, generateText, moduleId]);

    const AIActionButton = ({ action, icon, title }) => (
        console.log(`Rendering AI action button for: ${action}`),
        <button
            type="button"
            onClick={() => handleQuickAIAction(action)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title={title}
        >
            {icon}
        </button>
    );

    const renderAIButtons = () => (
        <div className="absolute right-2 bottom-2 flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-gray-100">
            <AIActionButton
                action={MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK}
                icon={<CheckCircle className="w-4 h-4" />}
                title="Quick compliance check"
            />
            <AIActionButton
                action={MiniAIAssistantAction.RECOMMEND_AI_ANSWER}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>}
                title="Get AI suggestions"
            />
            <AIActionButton
                action={MiniAIAssistantAction.IMPROVE_CLARITY}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>}
                title="Improve clarity"
            />
            {selectedTextInTextarea && (
                <>
                    <AIActionButton
                        action={MiniAIAssistantAction.EXPLAIN_THIS_QUESTION}
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>}
                        title="Explain selected text"
                    />
                    <AIActionButton
                        action={MiniAIAssistantAction.IDENTIFY_KEY_TERMS}
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>}
                        title="Identify key terms"
                    />
                </>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[140] p-4">
            <div className={`bg-white rounded-[6px] shadow-lg border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"}`}>
                <div className="bg-[#F9FAFB] p-4 border-b border-gray-200 relative">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#1A2341] uppercase bg-gray-200 px-2 py-1 rounded">{question.question_id}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-[#1A2341] leading-tight">{question.question}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-[#1A2341] transition-all duration-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {question.has_string_value && (
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                            {getFieldIcon("string")} Response {question.string_value_required && <span className="text-red-500 text-xs">*</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={refineTone}
                                                onChange={(e) => setRefineTone(e.target.value)}
                                                className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
                                            >
                                                <option value="professional">Professional</option>
                                                <option value="technical">Technical</option>
                                                <option value="detailed">Detailed</option>
                                                <option value="concise">Concise</option>
                                            </select>
                                        </div>
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
                                            placeholder="Enter your response..."
                                            className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 resize-y"
                                            rows={4}
                                            required={question.string_value_required}
                                        />
                                        {renderAIButtons()}
                                    </div>
                                    {errors?.string_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.string_value}
                                        </div>
                                    )}                    {aiMessage && (
                        <AIResponseDisplay
                            aiMessage={aiMessage}
                            isLoading={isLoading}
                            error={error}
                            handlePostResponseAction={handleQuickAIAction}
                        />
                    )}
                                </div>
                            )}
                            {question.has_decimal_value && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("decimal")} Numeric Value {question.decimal_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        name="decimal_value"
                                        value={formData.decimal_value || ""}
                                        onChange={(e) => handleInputChange(e, "decimal")}
                                        placeholder="Enter a number"
                                        step="any"
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200"
                                        required={question.decimal_value_required}
                                    />
                                    {errors?.decimal_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.decimal_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_boolean_value && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("boolean")} Yes/No Response {question.boolean_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="boolean_value"
                                            checked={formData.boolean_value || false}
                                            onChange={(e) => handleInputChange(e, "boolean")}
                                            className="w-4 h-4 accent-[#002A85] rounded focus:ring-2 focus:ring-[#002A85]/50"
                                        />
                                        <span className="text-sm text-[#1A2341]">{formData.boolean_value ? "Yes" : "No"}</span>
                                    </div>
                                    {errors.boolean_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.boolean_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_link && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("link")} Link/URL {question.link_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link || ""}
                                        onChange={(e) => handleInputChange(e, "link")}
                                        placeholder="Enter a URL"
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200"
                                        required={question.link_required}
                                    />
                                    {errors.link && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.link}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_note && (
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("note")} Additional Notes {question.note_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note || ""}
                                        onChange={(e) => handleInputChange(e, "note")}
                                        placeholder="Enter additional notes..."
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 resize-y"
                                        rows={3}
                                        required={question.note_required}
                                    />
                                    {errors.note && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.note}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors?.form && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-[6px]">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">Please fix the following errors:</span>
                                </div>
                                <p className="text-red-600 text-xs mt-1">{errors.form}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-4 py-2 text-[#1A2341] border border-gray-200 rounded-[6px] hover:bg-gray-50 text-sm font-medium transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none px-4 py-2 bg-[#002A85] text-white rounded-[6px] hover:bg-[#0A2E87] text-sm font-medium transition-all duration-200"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuestionEditPopup;