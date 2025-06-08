import PropTypes from 'prop-types';
import { useCallback } from "react";
import { AlertCircle, Lightbulb, Sparkles, Info, FileText, ShieldCheck, Database, HelpCircle, Star, BookOpen, Edit3, Zap, Book, Edit2, HelpCircle as ExplainIcon, Key, Mic, RefreshCcw, BookMarked } from "lucide-react";
import AIActionButtons from "./AIActionButtons";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { MiniAIAssistantAction } from './MiniAIAssistantAction.js';
import AIResponseDisplay from "./AIResponseDisplay";
import ToneSelector from "./ToneSelector";
import Loader from '../../components/loader.jsx'

// Shared logic for AI actions
// Shared logic for AI actions (unchanged from your original code)
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

        const leftActions = [
            MiniAIAssistantAction.SUMMARIZE_ANSWER,
            MiniAIAssistantAction.MAKE_MORE_CONCISE,
            MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Left,
            MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK,
        ];
        const isLeftAction = leftActions.includes(action);

        setIsLoading(prev => ({ ...prev, [isLeftAction ? 'left' : 'right']: true }));
        setError(null);
        setAiMessage(null);
        setLeftAiMessage(null);

        try {
            let prompt;
            const currentValue = formData?.string_value || "";

            const jsonInstruction = `\n\nIMPORTANT: Respond ONLY with a single, minified JSON object. Do NOT include any conversational text, explanations, or markdown formatting outside of this JSON structure. The JSON object must strictly match this TypeScript interface:
interface StructuredAISuggestion {
  id: string; // Unique ID for this suggestion
  type: "${action}"; // The action that triggered this
  title?: string; // A concise title for the suggestion block (max 5-7 words)
  mainContent?: string; // For a single block of text, summary, or full recommendation. Be concise.
  points?: string[]; // For breakdowns, lists. Each point concise.
  sections?: Array<{ heading: string; content: string }>; // For detailed explanations. Each section concise.
  confidence: 'low' | 'medium' | 'high'; // Your confidence in this suggestion. MANDATORY.
  error?: string; // If you encounter an issue providing the suggestion
  ${action === MiniAIAssistantAction.REFINE_ANSWER || action === MiniAIAssistantAction.REFINE_SELECTION ? `refineParams?: { tone: "${refineTone}" };` : ''}
}`;

            switch (action) {
                case MiniAIAssistantAction.EXPLAIN_THIS_QUESTION:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Explain the purpose, expected information, and importance of this question in not more than 100 words. Return the explanation in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Left:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft (if any): "${currentValue}". Generate a professional answer in not more than 150 words. Return the full answer in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Right:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft (if any): "${currentValue}". Generate a professional answer in not more than 150 words. Return the full answer in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.BREAK_DOWN_QUESTION:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft for context: "${currentValue}". Break down the question into 3-5 smaller components as points, explaining what information is needed for each, in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.IDENTIFY_KEY_TERMS:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Identify and explain 3-5 key terms as points, each explanation concise, in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.CHECK_TONE_CONSISTENCY:
                    prompt = `Draft: "${currentValue}". Check the tone consistency and suggest improvements to make it more ${refineTone} in not more than 100 words. Provide suggestions as points. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.SUGGEST_ALTERNATIVE_PHRASING:
                    prompt = `Draft: "${currentValue}". Suggest 3-5 alternative professional phrasings as points while maintaining accuracy, in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.SUMMARIZE_ANSWER:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Provide a concise summary highlighting key points in 2-3 sentences, not more than 50 words. Return the summary in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.REFINE_ANSWER:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Refine and enhance this draft to be more ${refineTone} and comprehensive in not more than 150 words. Return the full refined answer in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Perform a quick compliance check, highlighting 2-3 strengths and 2-3 potential issues as points in not more than 100 words total. Indicate if the question seems addressed in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.IMPROVE_CLARITY:
                    prompt = `Draft: "${currentValue}". Improve the clarity and readability of this answer while maintaining its meaning in not more than 150 words. Return the improved version in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.EXPAND_ANSWER:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Expand this answer with more detailed information and examples while maintaining professionalism in not more than 150 words. Return the expanded answer in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.MAKE_MORE_CONCISE:
                    prompt = `Draft: "${currentValue}". Make this answer more concise while retaining all important information in not more than 50 words. Return the concise version in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.CHECK_COMPLETENESS:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Analyze this answer for completeness, suggesting 2-3 missing aspects as points in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.EXPLAIN_ACRONYMS:
                    prompt = `Draft: "${currentValue}". Identify and explain any acronyms as points in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.SUGGEST_DATA_SOURCES:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Suggest 2-3 reliable data sources or methods for collecting data to answer this question accurately, in not more than 100 words total. Return suggestions as points. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.SUGGEST_TABLE_STRUCTURE:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Suggest a table structure with 3-5 column headers as points and 1 example row in mainContent, in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.ELABORATE_DRAFT:
                    prompt = `Draft: "${currentValue}". Elaborate on this draft by adding more details and context in not more than 150 words. Return the elaborated version in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.CONDENSE_DRAFT:
                    prompt = `Draft: "${currentValue}". Condense this draft by removing unnecessary details, focusing on key points in not more than 50 words. Return the condensed version in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.GENERATE_FOLLOWUP_QUESTIONS_FOR_USER:
                    prompt = `Question: "${question.question}". Guidance: "${question.guidance || 'None'}". Draft: "${currentValue}". Generate 3-5 follow-up questions as points to help the user provide more comprehensive information, in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.COMPARE_WITH_BEST_PRACTICE:
                    prompt = `Draft: "${currentValue}". Compare this answer with generic best practices, suggesting 2-3 improvements as points in not more than 100 words total. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.SUMMARIZE_SELECTION:
                    prompt = `Question: "${question.question}". Selected text: "${selectedTextInTextarea}". Summarize this selected text in 2-3 sentences, keeping key points concise, in not more than 50 words. Return the summary in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.REFINE_SELECTION:
                    prompt = `Question: "${question.question}". Selected text: "${selectedTextInTextarea}". Refine this selected text to improve clarity and align with tone "${refineTone}" in not more than 100 words. Return the refined text in mainContent. ${jsonInstruction}`;
                    break;
                case MiniAIAssistantAction.EXPLAIN_SELECTION:
                    prompt = `Question: "${question.question}". Selected text: "${selectedTextInTextarea}". Explain the meaning or significance of this selected text in not more than 100 words. Return the explanation in mainContent. ${jsonInstruction}`;
                    break;
                default:
                    console.warn(`[AIActions] Unrecognized AI action: ${action}`);
                    throw new Error(`Unrecognized AI action: ${action}`);
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

            const rawResponse = await generateText({ message: prompt, context }).unwrap();
            let jsonString = rawResponse.trim();

            const fenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/s;
            const match = jsonString.match(fenceRegex);
            if (match && match[1]) {
                jsonString = match[1].trim();
            }

            try {
                const parsedResponse = JSON.parse(jsonString);
                if (!parsedResponse.confidence) {
                    console.warn(`[AIActions] Mini AI: Confidence score missing from AI response for action ${action}. Defaulting to 'medium'. Raw:`, rawResponse);
                    parsedResponse.confidence = 'medium';
                }
                const message = {
                    id: Date.now().toString(),
                    action,
                    text: parsedResponse.mainContent || parsedResponse.points?.join('\n') || parsedResponse.sections?.map(s => `${s.heading}\n${s.content}`).join('\n') || rawResponse,
                    suggestion: parsedResponse.mainContent && (
                        action === MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Right ||
                        action === MiniAIAssistantAction.REFINE_ANSWER ||
                        action === MiniAIAssistantAction.REFINE_SELECTION ||
                        action === MiniAIAssistantAction.SUMMARIZE_SELECTION
                    ) ? parsedResponse.mainContent :
                        action === MiniAIAssistantAction.SUGGEST_ALTERNATIVE_PHRASING && parsedResponse.points ? parsedResponse.points.join('\n') : null,
                    confidence: parsedResponse.confidence,
                };

                if (isLeftAction) {
                    setLeftAiMessage(message);
                } else {
                    setAiMessage(message);
                }
            } catch (parseError) {
                console.error(`[AIActions] Mini AI: Failed to parse JSON response for action ${action}:`, parseError, "\nRaw response was:", rawResponse);
                setError("AI returned an unexpected format. Please try again.");
                setErrors(prev => ({ ...prev, ai: "AI returned an unexpected format" }));
            }
        } catch (err) {
            setError(err?.data?.detail || 'Failed to fetch AI response. Please try again.');
            setErrors(prev => ({ ...prev, ai: 'Failed to fetch AI response' }));
        } finally {
            setIsLoading(prev => ({ ...prev, [isLeftAction ? 'left' : 'right']: false }));
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

// LeftAIActions component (unchanged from your original code)
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
        { action: MiniAIAssistantAction.SUMMARIZE_ANSWER, icon: BookOpen, title: "Summarize the Draft", requiresDraft: true },
        { action: MiniAIAssistantAction.MAKE_MORE_CONCISE, icon: Edit3, title: "Refine Draft", requiresDraft: true },
        { action: MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Left, icon: Zap, title: "AI Recommends" },
        { action: MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK, icon: ShieldCheck, title: "Quick Compliance Check", requiresDraft: true },
    ];

    const hasDraft = formData.string_value?.trim().length > 0;

    // Add proactive follow-up actions for left-side responses
    const renderProactiveFollowUps = (contextText) => {
        const actions = [
            { action: MiniAIAssistantAction.QUICK_COMPLIANCE_CHECK, label: 'Check This Draft Compliance', icon: ShieldCheck },
            { action: MiniAIAssistantAction.SUMMARIZE_ANSWER, label: 'Summarize This Draft', icon: BookOpen },
            { action: MiniAIAssistantAction.MAKE_MORE_CONCISE, label: 'Make This Draft More Concise', icon: Edit3 }, // Adjusted for left-side actions
        ];
        return (
            <div className="mt-2 pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2 tracking-wide">Further Actions:</p>
                {actions.map(({ action, label, icon: Icon }) => (
                    <button
                        key={action}
                        onClick={() => handleQuickAIAction(action, contextText)}
                        className="w-full text-left mb-2 px-2.5 py-2 text-[9px] font-medium text-gray-900 bg-[#E6E8F0] hover:bg-[#D1D6E8] rounded-md transition-all duration-200 ease-in-out flex items-center hover:scale-[1.02] focus:outline-none focus:ring-2"
                    >
                        <Icon className="w-3.5 h-3.5 mr-2 text-[#000D30]" /> {label}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <>
            {!isLoading.left && !leftAiMessage ? (
                <div className="flex flex-wrap justify-center gap-3 px-4 py-5">
                    {leftActions.map(({ action, icon: Icon, title, requiresDraft }) => {
                        const isDisabled = requiresDraft && !hasDraft;
                        return (
                            <div key={action} className="relative">
                                <button
                                    onClick={() => handleQuickAIAction(action)}
                                    title={title}
                                    className={`
                                        flex items-center justify-center
                                        w-12 h-12 rounded-xl
                                        bg-[#1A2B5C]
                                        hover:bg-[#0F1D42]
                                        active:bg[#000A24]
                                        text-white font-medium
                                        transition-all duration-300 ease-out
                                        transform hover:scale-110 active:scale-95
                                        shadow-lg hover:shadow-xl
                                        disabled:opacity-40 disabled:cursor-not-allowed 
                                        disabled:hover:scale-100 disabled:shadow-lg
                                        disabled:bg-gray-600
                                        focus:outline-none focus:ring-3 focus:ring-navy-hover
                                        hover:rotate-3 active:rotate-0
                                    `}
                                    disabled={isDisabled}
                                    aria-label={title}
                                >
                                    <Icon className="w-5 h-5 transition-transform duration-200" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="px-4 sm:px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-[#000D30] rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-3 h-3 bg-[#000D30] rounded-full animate-ping opacity-75"></div>
                            </div>
                            AI Assistant Actions
                        </h3>
                    </div>
                    <div className="px-4 sm:px-6 pb-6">
                        {isLoading.left ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="relative">
                                    <div className="w-10 h-10 border-4 border-blue-200 rounded-full border-t-[#000D30] animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 bg-[#000D30] rounded-full animate-pulse opacity-20"></div>
                                    </div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-600">Processing...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-800 mb-1">Error Occurred</h4>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        ) : leftAiMessage ? (
                            <div>
                                <div className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-inner border border-slate-200/60 overflow-y-auto backdrop-blur-sm scrollbar-none p-4 text-gray-700">
                                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                        {leftAiMessage.text}
                                    </ReactMarkdown>
                                </div>
                                <div className="mt-4 flex flex-wrap justify-end gap-3">
                                    {leftAiMessage.action === MiniAIAssistantAction.MAKE_MORE_CONCISE ||
                                        leftAiMessage.action === MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Left ? (
                                        <>
                                            <button
                                                onClick={() => setLeftAiMessage(null)}
                                                className="
                                                    px-4 py-2 text-sm font-medium
                                                    text-gray-700 bg-gray-200
                                                    hover:bg-gray-300
                                                    rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-300
                                                    transition-all duration-200
                                                "
                                                aria-label="Reject AI suggestion"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log("Using AI suggestion:", leftAiMessage.text);
                                                    handleQuickAIAction("USE_THIS", leftAiMessage.text);
                                                    setLeftAiMessage(null);
                                                }}
                                                className="
                                                    px-4 py-2 text-sm font-medium
                                                    text-white bg-[#0F1D42]
                                                    hover:bg-[#1A2B5C]
                                                    rounded-lg
                                                    focus:outline-none focus:ring-2 focus:ring-indigo-300
                                                    transition-all duration-200
                                                "
                                                aria-label="Accept AI suggestion"
                                            >
                                                Accept
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setLeftAiMessage(null)}
                                            className="
                                                px-4 py-2 text-sm font-medium
                                                text-white bg-[#0F1D42]
                                                hover:bg-[#1A2B5C]
                                                rounded-lg
                                                focus:outline-none focus:ring-2 focus:ring-indigo-300
                                                transition-all duration-200
                                            "
                                            aria-label="Acknowledge AI suggestion"
                                        >
                                            Okay
                                        </button>
                                    )}
                                </div>
                                {leftAiMessage.suggestion && renderProactiveFollowUps(leftAiMessage.suggestion)}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </>
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
    isLoading: PropTypes.shape({
        left: PropTypes.bool.isRequired,
        right: PropTypes.bool.isRequired,
    }).isRequired,
    setIsLoading: PropTypes.func.isRequired,
    error: PropTypes.string,
    setError: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    setAiMessage: PropTypes.func.isRequired,
    leftAiMessage: PropTypes.object,
    setLeftAiMessage: PropTypes.func.isRequired,
    refineTone: PropTypes.string.isRequired,
};

// RightAIActionsContent component (unchanged from your original code)
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

    const hasDraft = formData.string_value?.trim().length > 0;

    const defaultActions = [
        { action: MiniAIAssistantAction.RECOMMEND_AI_ANSWER_Right, icon: Sparkles, title: "AI Draft" },
        { action: MiniAIAssistantAction.EXPLAIN_THIS_QUESTION, icon: Info, title: "Explain Question" },
        hasDraft
            ? { action: MiniAIAssistantAction.IDENTIFY_KEY_TERMS, icon: Key, title: "Key Terms" }
            : { action: MiniAIAssistantAction.BREAK_DOWN_QUESTION, icon: FileText, title: "Break Down Question" },
    ];

    const persistentActionsEmpty = [
        { action: MiniAIAssistantAction.SUGGEST_DATA_SOURCES, icon: Database, title: "Data Sources" },
        { action: MiniAIAssistantAction.GENERATE_FOLLOWUP_QUESTIONS_FOR_USER, icon: HelpCircle, title: "User Qs" },
        { action: MiniAIAssistantAction.COMPARE_WITH_BEST_PRACTICE, icon: Star, title: "Best Practices" },
    ];

    const persistentActionsNonEmpty = [
        { action: MiniAIAssistantAction.CHECK_TONE_CONSISTENCY, icon: Mic, title: "Check Tone" },
        { action: MiniAIAssistantAction.SUGGEST_ALTERNATIVE_PHRASING, icon: RefreshCcw, title: "Rephrase" },
        { action: MiniAIAssistantAction.EXPLAIN_ACRONYMS, icon: BookMarked, title: "Acronyms" },
    ];

    const persistentActions = hasDraft ? persistentActionsNonEmpty : persistentActionsEmpty;

    const textSelectionActions = [
        { action: MiniAIAssistantAction.SUMMARIZE_SELECTION, icon: Book, title: "Summarize Selection" },
        { action: MiniAIAssistantAction.REFINE_SELECTION, icon: Edit2, title: "Refine Selection" },
        { action: MiniAIAssistantAction.EXPLAIN_SELECTION, icon: ExplainIcon, title: "Explain Selection" },
    ];

    const actions = selectedTextInTextarea
        ? [...textSelectionActions, ...persistentActions]
        : [...defaultActions, ...persistentActions];

    const actionsObject = actions.reduce((acc, { action, icon, title }) => ({ ...acc, [action]: { action, icon, title } }), {});

    return (
        <>
            <h5 className="text-md font-semibold text-[#000D30] flex items-center mb-4 ">
                <Lightbulb className="w-5 h-5 mr-1.5 text-[#000D30]" /> Mini AI Assistant
            </h5>

            <ToneSelector
                refineTone={refineTone}
                setRefineTone={setRefineTone}
                handleRefineDraftWithTone={handleRefineDraftWithTone}
                currentValue={formData.string_value}
                selectedTextInTextarea={selectedTextInTextarea}
                isLoading={isLoading.right}
            />

            <AIActionButtons
                selectedTextInTextarea={selectedTextInTextarea}
                handleQuickAIAction={handleQuickAIAction}
                actions={actionsObject}
                currentValue={formData.string_value}
            />

            <div className="flex-1 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-inner border border-slate-200/60 overflow-y-auto mt-3.5 backdrop-blur-sm scrollbar-none">
                <div className="p-4">
                    {isLoading.right ? (
                        <Loader />
                    ) : aiMessage ? (
                        <AIResponseDisplay
                            aiMessage={aiMessage}
                            isLoading={isLoading.right}
                            error={error}
                            handlePostResponseAction={handleQuickAIAction}
                        />
                    ) : (
                        <div className="text-gray-700 text-sm text-center ">
                            Select an AI action to see preview
                        </div>
                    )}
                </div>
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
    isLoading: PropTypes.shape({
        left: PropTypes.bool.isRequired,
        right: PropTypes.bool.isRequired,
    }).isRequired,
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