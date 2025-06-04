import PropTypes from 'prop-types';
import { useCallback } from "react";
import { AlertCircle } from "lucide-react";
import AIActionButtons from "./AIActionButtons";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { MiniAIAssistantAction } from './MiniAIAssistantAction.js';
import AIResponseDisplay from "./AIResponseDisplay";
import ToneSelector from "./ToneSelector";

// Shared logic for AI actions
const useAIActionHandlers = ({
    formData,
    setFormData,
    question,
    moduleId,
    selectedTextInTextarea,
    setSelectedTextInTextarea,
    generateText,
    setIsLoading,
    setError,
    setErrors,
    setAiMessage,
    setLeftAiMessage,
    refineTone,
}) => {
    const handleQuickAIAction = useCallback(async (action, suggestion = null) => {
        if (action === "USE_THIS") {
            setFormData(prev => ({ ...prev, string_value: suggestion }));
            setAiMessage(null);
            setLeftAiMessage(null);
            setSelectedTextInTextarea(null); // Clear selection after using the suggestion
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
    }, [question, formData, refineTone, generateText, moduleId, selectedTextInTextarea, setFormData, setAiMessage, setLeftAiMessage, setError, setErrors, setIsLoading, setSelectedTextInTextarea]);

    const handleRefineDraftWithTone = useCallback(() => {
        const textToRefine = selectedTextInTextarea || formData.string_value;
        if (textToRefine.trim()) {
            handleQuickAIAction(MiniAIAssistantAction.REFINE_ANSWER);
        }
    }, [selectedTextInTextarea, formData, handleQuickAIAction]);

    return { handleQuickAIAction, handleRefineDraftWithTone };
};

// Component for left panel AI actions
export const LeftAIActions = ({
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
    setAiMessage,
    leftAiMessage,
    setLeftAiMessage,
    refineTone,
}) => {
    const { handleQuickAIAction } = useAIActionHandlers({
        formData,
        setFormData,
        question,
        moduleId,
        selectedTextInTextarea,
        setSelectedTextInTextarea,
        generateText,
        setIsLoading,
        setError,
        setErrors,
        setAiMessage,
        setLeftAiMessage,
        refineTone,
    });

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

LeftAIActions.propTypes = {
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    question: PropTypes.object.isRequired,
    moduleId: PropTypes.string.isRequired,
    selectedTextInTextarea: PropTypes.string,
    setSelectedTextInTextarea: PropTypes.func.isRequired,
    generateText: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    error: PropTypes.string,
    setError: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    setAiMessage: PropTypes.func.isRequired,
    leftAiMessage: PropTypes.object,
    setLeftAiMessage: PropTypes.func.isRequired,
    refineTone: PropTypes.string.isRequired,
};

// Component for right panel AI actions content
export const RightAIActionsContent = ({
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
    setLeftAiMessage,
    refineTone,
    setRefineTone,
}) => {
    const { handleQuickAIAction, handleRefineDraftWithTone } = useAIActionHandlers({
        formData,
        setFormData,
        question,
        moduleId,
        selectedTextInTextarea,
        setSelectedTextInTextarea,
        generateText,
        setIsLoading,
        setError,
        setErrors,
        setAiMessage,
        setLeftAiMessage,
        refineTone,
    });

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
        <>
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
                <AIActionButtons
                    selectedTextInTextarea={selectedTextInTextarea}
                    handleQuickAIAction={handleQuickAIAction}
                    actions={remainingActions}
                    currentValue={formData.string_value}
                />
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
        </>
    );
};

RightAIActionsContent.propTypes = {
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    question: PropTypes.object.isRequired,
    moduleId: PropTypes.string.isRequired,
    selectedTextInTextarea: PropTypes.string,
    setSelectedTextInTextarea: PropTypes.func.isRequired,
    generateText: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    setIsLoading: PropTypes.func.isRequired,
    error: PropTypes.string,
    setError: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    aiMessage: PropTypes.object,
    setAiMessage: PropTypes.func.isRequired,
    setLeftAiMessage: PropTypes.func.isRequired,
    refineTone: PropTypes.string.isRequired,
    setRefineTone: PropTypes.func.isRequired,
};