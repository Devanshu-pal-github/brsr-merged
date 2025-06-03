import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes,FaUser,FaRobot, FaPaperPlane, FaClipboard, FaPen, FaQuestionCircle, FaListAlt, FaBookOpen, FaSearch, FaChartLine } from 'react-icons/fa';
import { BiCheckDouble } from 'react-icons/bi';
import axios from 'axios';
import { AppContext } from './AppProvider';
import ExplanationCarousel, { getWordCount, convertToCarouselPayload } from './ExplanationCarousel';
import { useInactivityDetector } from './UseInactivityDetector';
import { INACTIVITY_TIMEOUTS_CHATBOT, DEFAULT_API_KEY_MESSAGE } from './constants';
import { renderMarkdown } from './renderMarkdown';

const ChatbotHeader = ({ onClose, activeQuestion, isApiKeyAvailable }) => {
    return (
        <div className="bg-gradient-to-r from-slate-50/90 to-indigo-50/90 p-3 border-b border-slate-200/30 rounded-b-2xl shadow-sm animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 bg-white/90 rounded-md flex items-center justify-center border border-slate-200/30 animate-pulse-gentle">
                        {activeQuestion && activeQuestion.metadata ? (
                            <span className="text-sm">💡</span>
                        ) : (
                            <div className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-sm"></div>
                        )}
                        <div className={`absolute -top-0.5 -right-0.5 w-1 h-1 ${activeQuestion && activeQuestion.metadata ? 'bg-blue-400' : 'bg-emerald-400'} rounded-full border border-white/80`}></div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-medium text-slate-800">AI Assistant</h2>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                activeQuestion && activeQuestion.metadata ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {activeQuestion && activeQuestion.metadata ? 'Question Mode' : 'Generic Mode'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <div className={`w-1 h-1 ${activeQuestion && activeQuestion.metadata ? 'bg-blue-400' : 'bg-emerald-400'} rounded-full animate-pulse`}></div>
                            <span>{activeQuestion && activeQuestion.metadata ? 'Question Context Active' : 'Generic Assistant'}</span>
                        </div>
                    </div>
                </div>
                <div
                    onClick={onClose}
                    className="p-1 rounded-md bg-slate-100/50 hover:bg-indigo-100/50 text-slate-600 hover:text-indigo-700 cursor-pointer transition-all duration-200 animate-slide-up"
                    aria-label="Close Assistant"
                >
                    <FaTimes className="w-4 h-4" />
                </div>
            </div>
            {activeQuestion && (
                <div className="mt-2 text-[11px] text-slate-700 animate-slide-up border-t border-slate-200/40 pt-1">
                    <div className="flex flex-col gap-1">
                        {activeQuestion.metadata ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Current Question:</span>
                                </div>
                                <div className="bg-blue-50 text-blue-700 p-2 rounded-md line-clamp-2">
                                    {activeQuestion.metadata.question_text}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="truncate max-w-[200px]">{activeQuestion.question_text}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {!isApiKeyAvailable && (
                <div className="flex items-center gap-1 mt-1 text-amber-600">
                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                    <span>API Config Needed</span>
                </div>
            )}
        </div>
    );
};

// Component 2: ChatbotMessages
const ChatbotMessages = ({ messages, handleCopyMessage, copiedMessageId, isLoading, error, handleAction, formatTimestamp }) => {
  const messagesEndRef = useRef(null);

  // Find index of last AI message to show follow-up actions only there
  const lastAiIndex = messages
    .map((msg, i) => (msg.sender === "ai" ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 return (
    <div
      className="flex-1 px-6 py-2.5 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-indigo-50/50 space-y-2 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {messages.map((msg, index) => (
        <div
          key={msg.id}
          className={`flex flex-col animate-message-appear ${
            msg.sender === "user" ? "items-end" : "items-start"
          }`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* AI Message */}
          {msg.sender === "ai" && (
            <div className="flex items-end max-w-[80%] group relative">
              <div className="mr-2 flex-shrink-0">
                <FaRobot className="w-4 h-4 text-indigo-400" />
              </div>
              <div
                className="px-2.5 py-1.5 rounded-lg text-sm bg-white/80 text-slate-800 rounded-bl-none border border-slate-200/30 relative"
              >
                {msg.isMarkdown && !msg.carouselPayload
                  ? renderMarkdown(msg.text)
                  : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}

                {!msg.carouselPayload && (
                  <div
                    onClick={() => handleCopyMessage(msg.text, msg.id)}
                    className="absolute top-1 right-1 p-1 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md hover:bg-indigo-50/50 cursor-pointer animate-slide-up"
                  >
                    {copiedMessageId === msg.id ? (
                      <span className="text-[10px] text-indigo-600">✓</span>
                    ) : (
                      <FaClipboard className="w-3 h-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Message */}
          {msg.sender === "user" && (
            <div className="flex items-end max-w-[80%] group">
              {/* User message bubble first */}
              <div
                className="px-2.5 py-1.5 rounded-lg text-sm bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-br-none border border-indigo-400/30"
              >
                {msg.isMarkdown && !msg.carouselPayload
                  ? renderMarkdown(msg.text)
                  : <p className="whitespace-pre-wrap">{msg.text}</p>}
              </div>

              {/* User icon on right with spacing */}
              <div className="mb-0.5 ml-2 flex-shrink-0">
                <FaUser className="w-3 h-3 text-indigo-300" />
              </div>
            </div>
          )}

          {msg.carouselPayload && (
            <div className="w-full mt-1 animate-slide-up">
              <ExplanationCarousel
                payload={msg.carouselPayload}
                onAction={handleAction}
              />
            </div>
          )}

          {/* Follow-up actions for latest AI message only */}
          {msg.sender === "ai" &&
            msg.followUpActions &&
            index === lastAiIndex && (
              <div className="mt-1 max-w-[80%] ml-6 flex flex-wrap gap-1 animate-slide-up">
                {msg.followUpActions.map((action, actionIndex) => (
                  <div
                    key={action}
                    onClick={() =>
                      handleAction(
                        action,
                        msg.carouselPayload ? "Carousel content" : msg.text
                      )
                    }
                    className="px-2 py-0.5 text-[10px] text-slate-600 hover:text-indigo-600 bg-slate-100/50 hover:bg-indigo-50/50 rounded-md cursor-pointer transition-all duration-200"
                    style={{ animationDelay: `${actionIndex * 0.1}s` }}
                  >
                    {action.replace(/_/g, " ").toLowerCase()}
                  </div>
                ))}
              </div>
            )}
        </div>
      ))}

      <div ref={messagesEndRef} />

      {isLoading && (
        <div className="flex justify-center py-2 animate-fade-in">
          <div className="flex items-center gap-1.5 bg-white/80 rounded-lg px-2.5 py-1 border border-slate-200/30">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
            <span className="text-[10px] text-slate-600">Processing</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex justify-center py-1.5 animate-shake">
          <div className="px-2.5 py-1 bg-red-50/80 rounded-lg border border-red-200/30 text-[10px] text-red-600">
            ⚠️ {error}
          </div>
        </div>
      )}
    </div>
  );
};



// Component 3: ChatbotInput
const ChatbotInput = ({ input, setInput, handleSendMessage, isLoading, isWaitingForTerm, isApiKeyAvailable, inputRef }) => {
    return (
        <div className="p-2 bg-gradient-to-r from-slate-50/90 to-indigo-50/90 border-t border-slate-200/30 animate-fade-in">
            <div className="flex items-center gap-1.5">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                    placeholder={isWaitingForTerm ? "Enter term..." : "Type message..."}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-sm bg-white/90 text-slate-800 placeholder-slate-400/70 border border-slate-200/30 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 disabled:opacity-50 transition-all duration-200"
                    disabled={isLoading || !isApiKeyAvailable}
                />
                <div
                    onClick={handleSendMessage}
                    className="p-1.5 rounded-lg bg-slate-100/50 hover:bg-indigo-100/50 text-slate-600 hover:text-indigo-700 disabled:opacity-40 cursor-pointer transition-all duration-200 animate-slide-up"
                    aria-label="Send message"
                >
                    <FaPaperPlane className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

// Component 4: ChatbotQuickActions
const ChatbotQuickActions = ({ quickActions, handleAction, isLoading, isApiKeyAvailable, activeQuestion }) => {
    const requiresActiveQuestion = [
        'DRAFT_ANSWER', 'EXPLAIN_QUESTION', 'SUGGEST_INPUT_ELEMENTS', 'SHOW_EXAMPLE_ANSWER',
        'EXPLAIN_DRAFT', 'IMPROVE_DRAFT', 'SUGGEST_FOLLOW_UP',
    ];

    const actionConfig = {
        DRAFT_ANSWER: { label: 'Draft', icon: <FaPen />, tooltip: 'Create a draft answer' },
        EXPLAIN_QUESTION: { label: 'Explain', icon: <FaQuestionCircle />, tooltip: 'Explain the question' },
        SUGGEST_INPUT_ELEMENTS: { label: 'Inputs', icon: <FaListAlt />, tooltip: 'Suggest input elements' },
        SHOW_EXAMPLE_ANSWER: { label: 'Example', icon: <FaBookOpen />, tooltip: 'Show example answer' },
        DEFINE_TERM: { label: 'Define', icon: <FaSearch />, tooltip: 'Define a term' },
        EXPLORE_EXAMPLES: { label: 'Examples', icon: <FaBookOpen />, tooltip: 'Explore examples' },
        SUMMARIZE_CHAT: { label: 'Summarize', icon: <FaListAlt />, tooltip: 'Summarize chat' },
        SUGGEST_USER_FOLLOWUPS: { label: 'Follow-ups', icon: <FaQuestionCircle />, tooltip: 'Suggest follow-ups' },
        DRAFT_KEY_METRICS_LIST: { label: 'Metrics', icon: <FaChartLine />, tooltip: 'Draft key metrics' },
    };

    return (
        <div className="p-2 bg-gradient-to-r from-slate-50/90 to-indigo-50/90 border-t border-slate-200/30 animate-fade-in">
            <div className="flex flex-wrap gap-1 justify-center">
                {quickActions.map((action, index) => (
                    <div
                        key={action}
                        onClick={() => handleAction(action)}
                        className={`group relative flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-600 hover:text-indigo-600 rounded-md transition-all duration-200 cursor-pointer animate-slide-up ${
                            (requiresActiveQuestion.includes(action) && !activeQuestion) || !isApiKeyAvailable || isLoading
                                ? 'bg-slate-100/30 text-slate-400/70 cursor-not-allowed'
                                : 'bg-slate-100/50 hover:bg-indigo-50/50'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <span className="text-indigo-500">{actionConfig[action]?.icon}</span>
                        <span>{actionConfig[action]?.label || action.replace(/_/g, ' ').toLowerCase()}</span>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800/80 text-white text-[10px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            {actionConfig[action]?.tooltip}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Main Component: ChatbotWindow
const ChatbotWindow = ({ onClose }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { state, dispatch } = context;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isWaitingForTerm, setIsWaitingForTerm] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [storedQuestionData, setStoredQuestionData] = useState(null);
    const inputRef = useRef(null);
    const eventSourceRef = useRef(null);

    // Check localStorage for stored question data
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('questionData') || '{}');
        // Get the most recently edited question
        const latestQuestion = Object.entries(storedData)
            .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))[0];
        
        if (latestQuestion) {
            const [questionId, data] = latestQuestion;
            setStoredQuestionData({
                id: questionId,
                ...data
            });
        } else {
            setStoredQuestionData(null);
        }
    }, [state.isChatbotOpen]); // Check whenever chatbot is opened

    const activeQuestion = storedQuestionData || state.questions?.find(q => q.question_id === state.activeQuestionId);

    const geminiService = {
        isApiKeyAvailable: () => true,
        generateText: async (prompt, config = {}) => {
            const response = await axios.post('http://localhost:8000/api/messages', {
                message: prompt,
                ...config,
            });
            return response.data.reply;
        },
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const addMessage = (
        sender,
        text,
        isMarkdown = false,
        carouselPayload = null,
        timestamp = new Date().toISOString(),
        followUpActions = null,
        originalUserMessage = null
    ) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                sender,
                text,
                timestamp,
                isMarkdown,
                carouselPayload,
                followUpActions,
                originalUserMessage,
            },
        ]);
    };

    const handleCopyMessage = (textToCopy, messageId) => {
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                setCopiedMessageId(messageId);
                setTimeout(() => setCopiedMessageId(null), 1500);
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
                addMessage('system', 'Failed to copy message.', false);
            });
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const currentInput = input;
        addMessage('user', currentInput);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            let responseText = '';
            const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
            eventSourceRef.current = new EventSource(
                `http://localhost:8000/api/messages/stream?message=${encodeURIComponent(currentInput)}`
            );

            eventSourceRef.current.onmessage = (event) => {
                if (event.data) {
                    responseText += event.data;
                    setMessages((prev) => {
                        const updated = [...prev];
                        const aiMessageIndex = updated.findIndex((msg) => msg.id === messageId);
                        const followUpActions = ['DEEP_DIVE', 'SUGGEST_USER_FOLLOWUPS', 'DEFINE_TERM'];
                        if (aiMessageIndex === -1) {
                            updated.push({
                                id: messageId,
                                sender: 'ai',
                                text: responseText,
                                timestamp: new Date().toISOString(),
                                isMarkdown: true,
                                followUpActions,
                                originalUserMessage: currentInput,
                            });
                        } else {
                            updated[aiMessageIndex].text = responseText;
                        }
                        return updated;
                    });
                }
            };

            eventSourceRef.current.addEventListener('complete', async () => {
                eventSourceRef.current?.close();
                eventSourceRef.current = null;

                await axios.post('http://localhost:8000/api/messages', { message: currentInput });

                const carouselPayload = await convertToCarouselPayload(responseText, geminiService, 150);
                const finalText = carouselPayload
                    ? `✨ **Comprehensive Response Ready** ✨\n\nI've prepared a detailed ${carouselPayload.slides.length}-slide presentation covering all aspects of your request. Use the carousel below to navigate through the structured content.`
                    : responseText;

                setMessages((prev) => {
                    const updated = [...prev];
                    const aiMessageIndex = updated.findIndex((msg) => msg.id === messageId);
                    if (aiMessageIndex !== -1) {
                        updated[aiMessageIndex].text = finalText;
                        updated[aiMessageIndex].carouselPayload = carouselPayload;
                    }
                    return updated;
                });

                setIsLoading(false);
                inputRef.current?.focus();
            });

            eventSourceRef.current.onerror = (err) => {
                console.error('Stream error:', err);
                setError('Failed to stream AI response. Check console for details.');
                eventSourceRef.current?.close();
                eventSourceRef.current = null;
                setIsLoading(false);
                inputRef.current?.focus();
            };
        } catch (err) {
            console.error('Chatbot send message error:', err);
            setError('An error occurred.');
            addMessage('system', 'An error occurred.', false);
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const requiresActiveQuestion = [
        'DRAFT_ANSWER', 'EXPLAIN_QUESTION', 'SUGGEST_INPUT_ELEMENTS', 'SHOW_EXAMPLE_ANSWER',
        'EXPLAIN_DRAFT', 'IMPROVE_DRAFT', 'SUGGEST_FOLLOW_UP',
    ];

    const handleAction = useCallback(async (action, relatedText = '') => {
        if (requiresActiveQuestion.includes(action) && !activeQuestion) {
            addMessage('system', 'Please select a question first.', true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsWaitingForTerm(false);
        if (inputRef.current && isWaitingForTerm) inputRef.current.placeholder = 'Type your message...';

        addMessage('user', `Action: ${action}${relatedText ? ` (related to: "${relatedText.substring(0, 50)}...")` : ''}`);

        try {
            let prompt = '';
            let responseText = '';
            const followUpActions = ['DEEP_DIVE', 'SUGGEST_USER_FOLLOWUPS', 'DEFINE_TERM'];
            const commonPromptSuffix = 'Structure your response with clear headers for main ideas and use bullet points for lists or key details where appropriate. Respond in well-formatted markdown.';
            const qText = activeQuestion?.question_text || 'the current BRSR topic';
            const qGuidance = activeQuestion?.guidance_text || 'None provided.';
            const currentAnswer = activeQuestion ? state.answers[activeQuestion.question_id] : undefined;
            let answerText = relatedText || '';
            if (!relatedText && currentAnswer) {
                if (currentAnswer.text_value) answerText = currentAnswer.text_value;
                else if (currentAnswer.choice_value) answerText = currentAnswer.choice_value;
                else if (currentAnswer.boolean_value !== undefined) answerText = String(currentAnswer.boolean_value);
                else if (currentAnswer.decimal_value !== undefined) answerText = String(currentAnswer.decimal_value);
            }
            if (answerText === '' && ['EXPLAIN_DRAFT', 'IMPROVE_DRAFT', 'DEEP_DIVE'].includes(action)) {
                answerText = 'No current answer draft or specific context provided.';
            }

            const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user')?.text || '';

            switch (action) {
                case 'DEEP_DIVE':
                    const deepDiveTopic = relatedText === 'Carousel content'
                        ? (messages[messages.length - 1]?.originalUserMessage || lastUserMessage || 'the last AI response')
                        : relatedText || 'the last AI response';
                    prompt = `Provide a comprehensive and detailed explanation on the topic: "${deepDiveTopic}". Include background information, key concepts, practical applications, and relevant examples. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'EXPLAIN_QUESTION':
                    prompt = `Provide a comprehensive explanation of BRSR question: "${qText}" (Guidance: "${qGuidance}"). Cover its purpose, regulatory context, what constitutes a good answer, key components to include, common challenges, and its importance in ESG reporting. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'DRAFT_ANSWER':
                    prompt = `Draft a comprehensive, professional, report-ready BRSR answer for question: "${qText}". Guidance: "${qGuidance}". Current user draft (if any): "${answerText}". Include relevant metrics, frameworks, and best practices where applicable. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    dispatch({ type: 'UPDATE_ANSWER', payload: { question_id: activeQuestion.question_id, text_value: responseText } });
                    responseText += '\n\n**📝 Answer Draft Created**\n\nI\'ve drafted a comprehensive answer and pre-filled it in your form. You can ask to *Explain this Draft*, **Improve this Draft**, or do a **Deep Dive** for more details.';
                    break;
                case 'EXPLAIN_DRAFT':
                    prompt = `Question: "${qText}". Draft answer: "${answerText}". Provide a detailed explanation of this draft answer, including its strengths, how it addresses the question requirements, key components covered, and areas where it excels. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'IMPROVE_DRAFT':
                    prompt = `Question: "${qText}". Draft answer: "${answerText}". Analyze this draft comprehensively and suggest specific improvements. Consider completeness, clarity, compliance requirements, industry best practices, and ESG frameworks. Provide a detailed "Revised Version:" at the end. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    const improvementMarker = 'revised version:';
                    const markerIndex = responseText.toLowerCase().indexOf(improvementMarker);
                    if (markerIndex !== -1) {
                        const improvedText = responseText.substring(markerIndex + improvementMarker.length).trim();
                        if (improvedText.length > 10 && improvedText !== answerText) {
                            dispatch({ type: 'UPDATE_ANSWER', payload: { question_id: activeQuestion.question_id, text_value: improvedText } });
                            responseText += '\n\n**✅ Draft Updated**\n\n(Attempted to pre-fill with improved version)';
                        }
                    }
                    break;
                case 'SUGGEST_INPUT_ELEMENTS':
                    prompt = `For BRSR question: "${qText}" (Guidance: "${qGuidance}"), provide a comprehensive list of 5-8 key elements, data points, or components that should be included in a thorough answer. Explain why each element is important and how it contributes to compliance. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'SHOW_EXAMPLE_ANSWER':
                    prompt = `Provide a detailed, high-quality example answer for a BRSR question like: "${qText}". Guidance: "${qGuidance}". Include industry-specific examples, relevant metrics, frameworks, and best practices that demonstrate comprehensive ESG reporting. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'SUGGEST_FOLLOW_UP':
                    prompt = `Based on BRSR question: "${qText}", suggest 4-6 detailed follow-up considerations, related questions, implementation steps, or complementary actions that organizations should consider. Explain the rationale for each suggestion. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'DEFINE_TERM':
                    responseText = 'Please type the BRSR or ESG term you\'d like me to define in detail.';
                    setIsWaitingForTerm(true);
                    inputRef.current.placeholder = 'Enter term to define...';
                    break;
                case 'EXPLORE_EXAMPLES':
                    prompt = `Provide 3-4 comprehensive, diverse examples of common BRSR disclosures across different categories (environmental, social, governance). For each example, include context, typical metrics, reporting frameworks, and best practices. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'SUMMARIZE_CHAT':
                    if (messages.length <= 2) {
                        responseText = 'There isn\'t much conversation to summarize yet! Feel free to ask more questions about BRSR reporting, ESG compliance, or specific disclosure requirements.';
                    } else {
                        const chatHistory = messages
                            .filter(m => m.sender !== 'system')
                            .map(m => `${m.sender}: ${m.text}`)
                            .join('\n');
                        prompt = `Provide a comprehensive summary of the following conversation, including key topics discussed, main insights shared, actions taken, and important conclusions reached. Organize into clear sections with bullet points for easy reference:\n\n${chatHistory}\n\n${commonPromptSuffix}`;
                        responseText = await geminiService.generateText(prompt);
                    }
                    break;
                case 'SUGGEST_USER_FOLLOWUPS':
                    const lastAiMessage = messages.slice().reverse().find(m => m.sender === 'ai');
                    prompt = `Based on the last AI response ("${lastAiMessage?.text || relatedText || 'previous topic'}"), suggest 4-6 relevant, specific questions the user might want to ask next. Include both clarifying questions and deeper exploration topics. Frame as a detailed bulleted list with explanations for why each question would be valuable. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'DRAFT_KEY_METRICS_LIST':
                    const metricsContext = activeQuestion
                        ? `BRSR question: "${qText}" (Guidance: "${qGuidance}")`
                        : `general context "${relatedText || 'ESG reporting'}"`;
                    prompt = `For the ${metricsContext}, draft a comprehensive list of 6-10 relevant key performance indicators (KPIs) and metrics to track. For each metric, include measurement methodology, reporting frequency, industry benchmarks where applicable, and alignment with ESG frameworks. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                default:
                    responseText = 'Action not recognized. Please try one of the available quick actions.';
            }

            const carouselPayload = await convertToCarouselPayload(responseText, geminiService, 150);
            const finalText = carouselPayload
                ? `✨ **Comprehensive Response Ready** ✨\n\nI've prepared a detailed ${carouselPayload.slides.length}-slide presentation covering all aspects of your request. Use the carousel below to navigate through the structured content.`
                : responseText;

            addMessage('ai', finalText, true, carouselPayload, new Date().toISOString(), followUpActions, lastUserMessage);
        } catch (err) {
            console.error('Chatbot action error:', err);
            setError(err.message);
            addMessage('system', `Error: ${err.message}`, true);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [activeQuestion, geminiService, dispatch, messages, state.answers]);

    const handleInactivity = useCallback(() => {
        if (isLoading || !state.isChatbotOpen || !geminiService.isApiKeyAvailable() || isWaitingForTerm) return;
        const qTextShort = activeQuestion ? `${activeQuestion.question_text.substring(0, 30)}...` : 'the current topic';
        const message = activeQuestion
            ? `Still pondering ${qTextShort}? Try a quick action or ask something new!`
            : 'Need help? Try defining a term or exploring examples!';
        addMessage('system', message, true);
    }, [activeQuestion, isLoading, state.isChatbotOpen, isWaitingForTerm]);

    useInactivityDetector(handleInactivity, INACTIVITY_TIMEOUTS_CHATBOT, state.isChatbotOpen);

    const getQuickActions = () => {
        let actions = activeQuestion
            ? ['DRAFT_ANSWER', 'EXPLAIN_QUESTION', 'SUGGEST_INPUT_ELEMENTS', 'SHOW_EXAMPLE_ANSWER']
            : ['DEFINE_TERM', 'EXPLORE_EXAMPLES', 'SUMMARIZE_CHAT'];
        actions = [...actions, 'SUGGEST_USER_FOLLOWUPS', 'DRAFT_KEY_METRICS_LIST'];
        return actions.slice(0, 6);
    };
    const quickActions = getQuickActions();

    useEffect(() => {

        const fetchMessages = async () => {
            try {
                // Fetch the message history from the server
                const response = await axios.get('http://localhost:8000/api/messages');

                // Format the messages for display in the chatbot window
                const formattedMessages = response.data.map((msg) => [
                    {
                        // User message
                        sender: 'user',
                        text: msg.user_message,
                        id: msg.message_id,
                        timestamp: msg.timestamp || new Date().toISOString(),
                        isMarkdown: false,
                    },
                    {
                        // AI response
                        sender: 'ai',
                        text: msg.bot_reply,
                        id: `${msg.message_id}-bot`,
                        timestamp: msg.timestamp || new Date().toISOString(),
                        isMarkdown: true,
                        // Possible follow-up actions for the AI to take
                        followUpActions: ['DEFINE_TERM', 'DRAFT_ANSWER'],
                        // The original user message that triggered the AI response
                        originalUserMessage: msg.user_message,
                    },
                ]).flat();

                // Update the state with the formatted message history
                setMessages(formattedMessages);
            } catch (err) {
                // Set an error message if the message history cannot be fetched
                setError('Failed to load message history.');
            }
        };

        if (state.isChatbotOpen) {
            fetchMessages();
            setError(null);
            setIsWaitingForTerm(false);
            if (messages.length === 0) {
                const initialMessage = activeQuestion
                    ? `AI Assistant focused on: **"${activeQuestion.question_text.substring(0, 80)}..."**\nYour current draft (if any) will be used as context. How can I help? Structure your response with clear headers and bullet points in markdown.`
                    : 'Hello! I\'m your BRSR AI Assistant. Select a question or use quick actions. Structure your response with clear headers and bullet points in markdown.';
                addMessage('system', initialMessage, true);
            }
            inputRef.current?.focus();
        } else {
            setMessages([]);
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [state.isChatbotOpen, activeQuestion]);

    return (
<div className="fixed inset-x-0 bottom-0 w-full sm:max-w-md sm:h-[80vh] sm:max-h-[600px] sm:static bg-white/95 border border-slate-200/30 sm:rounded-2xl shadow-lg sm:shadow-xl flex flex-col overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/10 to-indigo-50/10 pointer-events-none"></div>
        <div className="relative flex flex-col h-full">
            <ChatbotHeader
                onClose={onClose}
                activeQuestion={activeQuestion}
                isApiKeyAvailable={geminiService.isApiKeyAvailable()}
            />
            <ChatbotMessages
                messages={messages}
                handleCopyMessage={handleCopyMessage}
                copiedMessageId={copiedMessageId}
                isLoading={isLoading}
                error={error}
                handleAction={handleAction}
                formatTimestamp={formatTimestamp}
            />
            <ChatbotInput
                input={input}
                setInput={setInput}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
                isWaitingForTerm={isWaitingForTerm}
                isApiKeyAvailable={geminiService.isApiKeyAvailable()}
                inputRef={inputRef}
            />
            <ChatbotQuickActions
                quickActions={quickActions}
                handleAction={handleAction}
                isLoading={isLoading}
                isApiKeyAvailable={geminiService.isApiKeyAvailable()}
                activeQuestion={activeQuestion}
            />
        </div>
        <style jsx>{`
            @media (max-width: 640px) {
                .fixed {
                    height: 80vh;
                    border-radius: 0;
                    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
                }
            }

            }
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
    </div>
    );
};

export default ChatbotWindow;