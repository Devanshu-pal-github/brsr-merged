import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaClipboard } from 'react-icons/fa';
import { BiCheckDouble } from 'react-icons/bi';
import axios from 'axios';
import { AppContext } from './AppProvider';
import ExplanationCarousel from './ExplanationCarousel';
import { useInactivityDetector } from './UseInactivityDetector';
import { INACTIVITY_TIMEOUTS_CHATBOT, DEFAULT_API_KEY_MESSAGE } from './constants';
import { renderMarkdown } from './renderMarkdown';

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
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const eventSourceRef = useRef(null);

    const activeQuestion = state.questions?.find(q => q.question_id === state.activeQuestionId);
    const MIN_WORDS_FOR_CAROUSEL = 500;

    // API service (mocked for frontend; backend handles API key validation)
    const geminiService = {
        isApiKeyAvailable: () => true, // Backend handles API key validation
        generateText: async (prompt, config = {}) => {
            const response = await axios.post('http://localhost:8000/api/messages', {
                message: prompt,
                ...config,
            });
            return response.data.reply;
        },
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize and fetch message history
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/messages');
                const formattedMessages = response.data.map((msg) => [
                    {
                        sender: 'user',
                        text: msg.user_message,
                        id: msg.message_id,
                        timestamp: msg.timestamp || new Date().toISOString(),
                        isMarkdown: false,
                    },
                    {
                        sender: 'ai',
                        text: msg.bot_reply,
                        id: `${msg.message_id}-bot`, // Fixed: Use template literal correctly
                        timestamp: msg.timestamp || new Date().toISOString(),
                        isMarkdown: true,
                        followUpActions: ['DEFINE_TERM', 'DRAFT_ANSWER'],
                        originalUserMessage: msg.user_message,
                    },
                ]).flat();
                setMessages(formattedMessages);
            } catch (err) {
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

    const convertToCarouselPayloadIfNeeded = async (originalText) => {
        if (originalText.split(/\s+/).length <= MIN_WORDS_FOR_CAROUSEL) return null;

        const conversionPrompt = `The following text is too long for a standard chat message. Please convert it into a structured JSON object suitable for a carousel display.
The JSON object must have slides array with title (max 5-10 words) and text (50-150 words, use markdown bullet points).
Break down into 2-5 slides. Original text:
---
${originalText}
---
Respond ONLY with minified JSON object.`;

        try {
            const jsonResponse = await geminiService.generateText(conversionPrompt, { responseMimeType: 'application/json' });
            let jsonStr = jsonResponse.trim();
            const fenceRegex = /^(?:json)?\s*\n?([\s\S]*?)\n?\s*$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[1]) jsonStr = match[1].trim();
            const parsed = JSON.parse(jsonStr);
            if (
                parsed.slides &&
                Array.isArray(parsed.slides) &&
                parsed.slides.every((s) => typeof s.title === 'string' && typeof s.text === 'string')
            ) {
                return parsed;
            }
            console.warn('[Chatbot] Carousel conversion: Parsed JSON does not match expected structure.', parsed);
            return null;
        } catch (error) {
            console.error('[Chatbot] Error converting text to carousel payload:', error);
            return null;
        }
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
                    scrollToBottom();
                }
            };

            eventSourceRef.current.addEventListener('complete', async () => {
                eventSourceRef.current?.close();
                eventSourceRef.current = null;

                await axios.post('http://localhost:8000/api/messages', { message: currentInput });

                const dynamicCarouselPayload = await convertToCarouselPayloadIfNeeded(responseText);
                if (dynamicCarouselPayload) {
                    setMessages((prev) => {
                        const updated = [...prev];
                        const aiMessageIndex = updated.findIndex((msg) => msg.id === messageId);
                        if (aiMessageIndex !== -1) {
                            updated[aiMessageIndex].carouselPayload = dynamicCarouselPayload;
                            updated[aiMessageIndex].text = 'AI has provided a detailed response!';
                        }
                        return updated;
                    });
                }

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
                    prompt = `Provide a detailed explanation on the topic: "${deepDiveTopic}". ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'EXPLAIN_QUESTION':
                    prompt = `Explain BRSR question: "${qText}" (Guidance: "${qGuidance}") in detail. Cover its purpose, what a good answer includes, and its importance. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'DRAFT_ANSWER':
                    prompt = `Draft a concise, professional, report-ready BRSR answer for question: "${qText}". Guidance: "${qGuidance}". Current user draft (if any): "${answerText}". ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    dispatch({ type: 'UPDATE_ANSWER', payload: { question_id: activeQuestion.question_id, text_value: responseText } });
                    responseText += '\n\nI\'ve drafted an answer and pre-filled it. You can ask to *Explain this Draft*, **Improve this Draft**, or do a **Deep Dive*.';
                    break;
                case 'EXPLAIN_DRAFT':
                    prompt = `Question: "${qText}". Draft answer: "${answerText}". Explain this draft clearly and concisely. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'IMPROVE_DRAFT':
                    prompt = `Question: "${qText}". Draft answer: "${answerText}". Suggest specific improvements. Provide a revised version labeled "Revised Version:". ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    const improvementMarker = 'revised version:';
                    const markerIndex = responseText.toLowerCase().indexOf(improvementMarker);
                    if (markerIndex !== -1) {
                        const improvedText = responseText.substring(markerIndex + improvementMarker.length).trim();
                        if (improvedText.length > 10 && improvedText !== answerText) {
                            dispatch({ type: 'UPDATE_ANSWER', payload: { question_id: activeQuestion.question_id, text_value: improvedText } });
                            responseText += '\n\n(Attempted to pre-fill with improved version)';
                        }
                    }
                    break;
                case 'SUGGEST_INPUT_ELEMENTS':
                    prompt = `For BRSR question: "${qText}" (Guidance: "${qGuidance}"), list 2-3 key elements or data points for a comprehensive answer as bullet points. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'SHOW_EXAMPLE_ANSWER':
                    prompt = `Provide a generic, high-quality example answer for a BRSR question like: "${qText}". Guidance: "${qGuidance}". ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'SUGGEST_FOLLOW_UP':
                    prompt = `Based on BRSR question: "${qText}", suggest 1-2 brief follow-up considerations or actions. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'DEFINE_TERM':
                    responseText = 'Please type the BRSR or ESG term to define.';
                    setIsWaitingForTerm(true);
                    inputRef.current.placeholder = 'Enter term...';
                    break;
                case 'EXPLORE_EXAMPLES':
                    prompt = `Provide 2 brief, diverse examples of common BRSR disclosures (e.g., environmental, social). Use headers for each example. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'SUMMARIZE_CHAT':
                    if (messages.length <= 2) {
                        responseText = 'There isn\'t much conversation to summarize yet!';
                    } else {
                        const chatHistory = messages
                            .filter(m => m.sender !== 'system')
                            .map(m => `${m.sender}: ${m.text}`)
                            .join('\n');
                        prompt = `Summarize the key points of the following conversation concisely (3-4 bullet points):\n\n${chatHistory}\n\n${commonPromptSuffix}`;
                        responseText = await geminiService.generateText(prompt);
                    }
                    break;
                case 'SUGGEST_USER_FOLLOWUPS':
                    const lastAiMessage = messages.slice().reverse().find(m => m.sender === 'ai');
                    prompt = `Based on the last AI response ("${lastAiMessage?.text || relatedText || 'previous topic'}"), suggest 2-3 relevant questions the user might ask next. Frame as a bulleted list of questions. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                case 'DRAFT_KEY_METRICS_LIST':
                    const metricsContext = activeQuestion
                        ? `BRSR question: "${qText}" (Guidance: "${qGuidance}")`
                        : `general context "${relatedText || 'ESG reporting'}"`;
                    prompt = `For the ${metricsContext}, draft a list of 3-5 relevant key metrics to track as bullet points. ${commonPromptSuffix}`;
                    responseText = await geminiService.generateText(prompt);
                    break;
                default:
                    responseText = 'Action not recognized.';
            }

            const carouselPayload = await convertToCarouselPayloadIfNeeded(responseText);
            addMessage('ai', carouselPayload ? 'AI has provided a detailed response!' : responseText, true, carouselPayload, new Date().toISOString(), followUpActions, lastUserMessage);
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

    return (
        <div className="w-full max-w-md h-[80vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-t-lg md:rounded-lg shadow-xl flex flex-col">
            <div className="flex justify-between p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-t-lg items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">AI Assistant</h2>
                    <span className="text-sm">Online</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-indigo-700 rounded-full"
                    aria-label="Close"
                >
                    <FaTimes className="text-xl" />
                </button>
            </div>
            <div className="p-2.5 text-xs text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                {activeQuestion ? `Focused on: ${activeQuestion.question_text.substring(0, 50)}...` : 'General BRSR Assistance'}
                {!geminiService.isApiKeyAvailable() && (
                    <p className="text-red-600 mt-0.5">{DEFAULT_API_KEY_MESSAGE}</p>
                )}
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`flex items-end max-w-[90%] group ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div
                                className={`px-3.5 py-2.5 rounded-xl text-sm shadow-md ${msg.sender === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-lg'
                                        : msg.sender === 'ai'
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-lg prose prose-sm dark:prose-invert max-w-none [&_code]:text-blue-600 [&_code]:dark:text-blue-300 [&_code]:bg-gray-100 [&_code]:dark:bg-gray-600 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded'
                                            : 'bg-transparent text-gray-500 dark:text-gray-400 italic text-xs w-full text-center shadow-none px-0 py-0.5'
                                    }`}
                            >
                                <div className="flex items-end gap-1">
                                    {msg.isMarkdown && !msg.carouselPayload ? renderMarkdown(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    {msg.sender === 'user' && (
                                        <BiCheckDouble className="text-xs text-white opacity-80" />
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatTimestamp(msg.timestamp)}
                                </div>
                            </div>
                            {msg.sender === 'ai' && !msg.carouselPayload && (
                                <button
                                    onClick={() => handleCopyMessage(msg.text, msg.id)}
                                    title="Copy message"
                                    className="ml-2 p-1 text-gray-400 hover:text-blue-500 group-hover:opacity-100 transition-opacity"
                                >
                                    {copiedMessageId === msg.id ? (
                                        <span className="text-xs text-blue-500">Copied!</span>
                                    ) : (
                                        <FaClipboard className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                        {msg.carouselPayload && (
                            <div className="w-full mt-1.5">
                                <ExplanationCarousel payload={msg.carouselPayload} />
                            </div>
                        )}
                        {msg.sender === 'ai' && msg.followUpActions && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {msg.followUpActions.map(action => (
                                    <button
                                        key={action}
                                        onClick={() => handleAction(action, msg.carouselPayload ? 'Carousel content' : msg.text)}
                                        disabled={isLoading || !geminiService.isApiKeyAvailable() || (requiresActiveQuestion.includes(action) && !activeQuestion)}
                                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-gray-500 disabled:opacity-50"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
                {isLoading && (
                    <div className="text-center text-xs text-gray-500 py-2 animate-pulse">
                        AI is thinking...
                    </div>
                )}
                {error && (
                    <div className="text-center text-xs text-red-600 py-2">Error: {error}</div>
                )}
            </div>
            <div className="p-3.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        placeholder={isWaitingForTerm ? 'Enter term...' : 'Type your message...'}
                        className="flex-1 p-3 border border-transparent focus:border-blue-300 rounded-full text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50 shadow-sm"
                        disabled={isLoading || !geminiService.isApiKeyAvailable()}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim() || !geminiService.isApiKeyAvailable()}
                        className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50 transition-colors shadow-md"
                        aria-label="Send message"
                    >
                        <FaPaperPlane className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                    {quickActions.map(action => (
                        <button
                            key={action}
                            onClick={() => handleAction(action)}
                            disabled={isLoading || !geminiService.isApiKeyAvailable() || (requiresActiveQuestion.includes(action) && !activeQuestion)}
                            className="p-2 text-xs bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-gray-500 disabled:opacity-50"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatbotWindow;