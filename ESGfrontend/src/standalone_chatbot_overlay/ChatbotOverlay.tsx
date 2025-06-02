import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatbotAction, ChatMessage, Question, QuestionInputType, RichAIResponse } from './types/ChatbotOverlayTypes';
import { SparklesIcon, XIcon, ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, ClipboardDocumentIcon } from './icons/CoreIcons';
import { useInactivityDetector } from './hooks/useInactivityDetector';
import { CHATBOT_INACTIVITY_TIMEOUTS, CHATBOT_GEMINI_MODEL_NAME, CHATBOT_DEFAULT_API_KEY_MESSAGE } from './constants/ChatbotOverlayConstants';
import { renderMarkdown } from './utils/renderMarkdown';
import ChatbotExplanationCarousel from './ChatbotExplanationCarousel';
import { CarouselExplanationPayload } from './types/ChatbotOverlayTypes';


interface ChatbotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  initialAction?: ChatbotAction;
  initialContextText?: string;
  activeQuestion?: Question; // Optional: For providing context about a specific item/page user is viewing
  currentAnswerText?: string; // Optional: For providing more context (e.g., user's current text in an input field)
  customWelcomeMessage?: string;
  customFocusMessage?: (questionText: string) => string;
  // Add any other props your standalone chatbot might need, e.g., callbacks for specific AI actions
}

const ChatbotOverlay: React.FC<ChatbotOverlayProps> = ({
  isOpen,
  onClose,
  apiKey,
  initialAction,
  initialContextText,
  activeQuestion,
  currentAnswerText = "",
  customWelcomeMessage,
  customFocusMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForTerm, setIsWaitingForTerm] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [aiInstance, setAiInstance] = useState<GoogleGenAI | null>(null);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);

  const CHATBOT_SYSTEM_PROMPT = `You are "InsightAssistant", a friendly and highly capable AI assistant.
Your goal is to provide helpful, accurate, and context-aware responses.
If the user has an active question/context provided, tailor your responses to it.
Response Guidelines:
- Clarity & Professionalism: Be clear, concise, and professional.
- Markdown Formatting: Use markdown for all textual responses (headers, bold, italics, lists).
- Structured JSON: For complex explanations or when asked, respond ONLY with a single, minified JSON object adhering to 'RichAIResponse' schema (provided in prompts).
  - 'primaryContent' for main text.
  - 'sections' for detailed breakdowns (title, content).
  - 'suggestedFollowUpActions' to proactively suggest 1-2 relevant next steps.
- Simple Queries: For simple queries, direct markdown is fine.
- Error Handling: If issues arise, explain clearly (in 'error' field of JSON or plain text).
`;

 const RICH_AI_RESPONSE_SCHEMA_FOR_PROMPT = `
The JSON object must strictly match this TypeScript interface:
interface RichAIResponseSection { title?: string; content: string; isCollapsible?: boolean; }
interface RichAIActionableItem { text: string; action: string; /* Use a generic string for action type */ actionContext: string; }
interface RichAIResponse {
  id: string; // Generate a unique ID
  primaryContent?: string; // Brief textual summary (markdown).
  sections?: RichAIResponseSection[]; // Main explanation (markdown). Max 3-4 sections.
  actionableItems?: RichAIActionableItem[]; // Key terms. Max 2-3 items.
  suggestedFollowUpActions?: { action: string, displayText: string, context?: string }[]; // Suggest 1-2 ChatbotActions.
  error?: string; // Error description.
}`;


  useEffect(() => {
    if (apiKey) {
      try {
        const newAiInstance = new GoogleGenAI({ apiKey });
        setAiInstance(newAiInstance);
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI for ChatbotOverlay:", e);
        setError("AI Service initialization failed. API key might be invalid.");
        setAiInstance(null);
        setChatInstance(null);
      }
    } else {
      setAiInstance(null);
      setChatInstance(null);
    }
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && aiInstance && !chatInstance) {
      try {
        const newChat = aiInstance.chats.create({
          model: CHATBOT_GEMINI_MODEL_NAME,
          config: { systemInstruction: CHATBOT_SYSTEM_PROMPT }
        });
        setChatInstance(newChat);
      } catch (e) {
        console.error("Failed to create chat instance for ChatbotOverlay:", e);
        setError("Could not initialize AI chat session.");
        addMessage('system', "Error: Could not initialize AI chat session.", true);
      }
    } else if (!isOpen) {
        setMessages([]);
        setChatInstance(null); // Reset chat instance when closed
        setError(null);
        setIsLoading(false);
        setUserInput("");
    }
  }, [isOpen, aiInstance, chatInstance]);


  useEffect(() => {
    if (isOpen && chatInstance) {
      setError(null);
      setIsWaitingForTerm(false);

      if (initialAction) {
        handleAction(initialAction as ChatbotAction, initialContextText); // Cast if ChatbotAction enum is used internally
      } else if (messages.length === 0) {
        let initialMessageText = "";
        if (activeQuestion) {
          initialMessageText = customFocusMessage 
            ? customFocusMessage(activeQuestion.question_text) 
            : `AI Assistant focused on: **"${activeQuestion.question_text.substring(0, 80)}..."** How can I help?`;
        } else {
          initialMessageText = customWelcomeMessage || "Hello! I'm your AI Assistant. How can I help you today?";
        }
        addMessage('system', initialMessageText, true);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    } else if (isOpen && !apiKey) {
        addMessage('system', CHATBOT_DEFAULT_API_KEY_MESSAGE, true);
    }
  }, [isOpen, chatInstance, activeQuestion, initialAction, initialContextText, customWelcomeMessage, customFocusMessage, apiKey]);


  const addMessage = (
    sender: 'user' | 'ai' | 'system',
    text: string,
    isMarkdown: boolean = false,
    richResponse?: RichAIResponse
  ) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      sender,
      text: richResponse?.primaryContent || text, // Prefer primaryContent if available
      timestamp: Date.now(),
      isMarkdown,
      richResponse
    }]);
  };

  const handleCopyMessage = (textToCopy: string, messageId: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1500);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      addMessage('system', "Failed to copy message.", true);
    });
  };
  
  const parseAndAddRichResponse = (
    aiRawResponseText: string,
    intendedAction: string, // General action string
    fallbackTextPrefix: string = "AI Response:"
    ) => {
    try {
        let jsonStr = aiRawResponseText.trim();
        const fenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) jsonStr = match[1].trim();

        const parsedJson = JSON.parse(jsonStr) as RichAIResponse;
        
        if (parsedJson.error) {
            addMessage('ai', parsedJson.error, true, parsedJson);
            return;
        }
        addMessage('ai', parsedJson.primaryContent || fallbackTextPrefix, true, parsedJson);

    } catch (parseError) {
        console.warn(`[ChatbotOverlay] Failed to parse RichAIResponse JSON for action ${intendedAction}. Raw:`, aiRawResponseText, parseError);
        addMessage('ai', `${fallbackTextPrefix}\n${aiRawResponseText}`, true); // Fallback to raw text
    }
  };


  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !chatInstance || !aiInstance) return;
    if (!apiKey) {
      addMessage('system', CHATBOT_DEFAULT_API_KEY_MESSAGE, true);
      return;
    }

    const currentInput = userInput;
    addMessage('user', currentInput);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      let prompt = "";
      const commonPromptSuffix = "Remember to use markdown for formatting.";
      const availableActionsList = Object.values(ChatbotAction).join(', '); // Assuming ChatbotAction enum is available

      if (isWaitingForTerm) {
        prompt = `User wants to define the term: "${currentInput}".
Provide a concise and clear definition.
${commonPromptSuffix}
IMPORTANT: Respond using the RichAIResponse JSON schema.
'primaryContent' should contain your main textual answer.
Suggest relevant 'suggestedFollowUpActions' if applicable (e.g., ChatbotAction.DEEP_DIVE).
${RICH_AI_RESPONSE_SCHEMA_FOR_PROMPT}`;
        setIsWaitingForTerm(false);
        if(inputRef.current) inputRef.current.placeholder = "Ask something...";
      } else if (activeQuestion) {
        prompt = `User is focused on context: "${activeQuestion.question_text}".
User's current related text (if any): "${currentAnswerText}".
User's query: "${currentInput}".
Respond helpfully.
${commonPromptSuffix}
IMPORTANT: Respond using the RichAIResponse JSON schema.
'primaryContent' should contain your main textual answer.
'suggestedFollowUpActions' could include relevant actions like ${ChatbotAction.EXPLAIN_DRAFT}, ${ChatbotAction.IMPROVE_DRAFT}.
${RICH_AI_RESPONSE_SCHEMA_FOR_PROMPT}`;
      } else {
        prompt = `User has a general query: "${currentInput}".
Provide a helpful answer.
${commonPromptSuffix}
IMPORTANT: Respond using the RichAIResponse JSON schema.
'primaryContent' should contain your main textual answer.
Suggest relevant 'suggestedFollowUpActions' if applicable.
${RICH_AI_RESPONSE_SCHEMA_FOR_PROMPT}`;
      }
      
      const responseStream = await chatInstance.sendMessageStream({ message: prompt });
      let aggregatedResponseText = "";
      for await (const chunk of responseStream) {
        aggregatedResponseText += chunk.text;
      }
      parseAndAddRichResponse(aggregatedResponseText, 'USER_QUERY', `Regarding "${currentInput}":`);

    } catch (err) {
      console.error("ChatbotOverlay send message error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred with AI.";
      setError(errorMessage);
      addMessage('system', `Error: ${errorMessage}`, true);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleAction = useCallback(async (action: ChatbotAction | string, relatedText?: string, actionContextFromAI?: string) => {
    if (!chatInstance || !aiInstance) {
      addMessage('system', "AI chat session not ready.", true);
      return;
    }
    if (!apiKey) {
      addMessage('system', CHATBOT_DEFAULT_API_KEY_MESSAGE, true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsWaitingForTerm(false); 
    if(inputRef.current && isWaitingForTerm) inputRef.current.placeholder = "Ask something...";

    const userActionText = actionContextFromAI ? `${action} (context: ${actionContextFromAI.substring(0,30)}...)` : action.toString();
    addMessage('user', `Action: ${userActionText}`);

    try {
      let prompt = "";
      let plainTextResponse = ""; // For actions not expected to return JSON
      
      const qText = activeQuestion?.question_text || "the current topic";
      const qGuidance = activeQuestion?.guidance_text || 'None provided.';
      let answerTextForActionCxt = relatedText || currentAnswerText || ""; 
      if (actionContextFromAI) answerTextForActionCxt = actionContextFromAI;

      const baseJsonPrompt = `User action: ${action}.
Context: ${answerTextForActionCxt || "No specific prior text context for this action."}
IMPORTANT: Respond using the RichAIResponse JSON schema.
'primaryContent' should contain your main textual answer or a summary.
Available actions for 'suggestedFollowUpActions': ${Object.values(ChatbotAction).join(', ')}.
${RICH_AI_RESPONSE_SCHEMA_FOR_PROMPT}\n\nSpecific task for AI: `;

      switch (action) {
        case ChatbotAction.EXPLAIN_QUESTION: 
        case ChatbotAction.DEEP_DIVE:
          let explainContext = "";
          if (action === ChatbotAction.DEEP_DIVE) {
            explainContext = `Provide a detailed explanation or elaboration (a "deep dive") on the topic: "${answerTextForActionCxt || "the last AI response or current context"}".`;
          } else { // EXPLAIN_QUESTION
            explainContext = `Explain context: "${qText}" (Guidance: "${qGuidance}") in detail. Cover its purpose and what good information includes.`;
          }
          prompt = `${baseJsonPrompt}${explainContext} Break down the information into logical 'sections'. Suggest relevant follow-up actions.`;
          break;
        case ChatbotAction.DRAFT_ANSWER:
          prompt = `${baseJsonPrompt}Draft a concise, professional answer for context: "${qText}". Guidance: "${qGuidance}". Current user draft (if any, for inspiration): "${answerTextForActionCxt}". Focus on generating a new draft in 'primaryContent'.`;
          break;
        // Add more cases as needed from the main Chatbot.tsx's handleAction, adapting prompts.
        // For simple text responses:
        case ChatbotAction.DEFINE_TERM:
          plainTextResponse = "Understood. Please type the term you'd like me to define.";
          setIsWaitingForTerm(true);
          if(inputRef.current) inputRef.current.placeholder = "Enter term to define...";
          inputRef.current?.focus();
          break;
        default:
          prompt = `${baseJsonPrompt}Perform the action: "${action}" regarding the text: "${answerTextForActionCxt || qText}". Provide a concise response in 'primaryContent'.`;
      }

      if (prompt && chatInstance) { 
        const responseStream = await chatInstance.sendMessageStream({ message: prompt });
        let aggregatedResponseText = "";
        for await (const chunk of responseStream) {
            aggregatedResponseText += chunk.text;
        }
        parseAndAddRichResponse(aggregatedResponseText, action.toString(), `For action "${action}":`);
      } else if (plainTextResponse) { 
        addMessage('ai', plainTextResponse, true);
      }

    } catch (err) {
      console.error("ChatbotOverlay action error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred with AI.";
      setError(errorMessage);
      addMessage('system', `Error processing action: ${errorMessage}`, true);
    } finally {
      setIsLoading(false);
      if (!isWaitingForTerm) inputRef.current?.focus();
    }
  }, [activeQuestion, currentAnswerText, messages, chatInstance, aiInstance, apiKey]);

  const handleInactivity = useCallback((level: number) => {
    if (isLoading || !isOpen || !apiKey || !chatInstance || isWaitingForTerm) return;
    const qTextShort = activeQuestion ? `"${activeQuestion.question_text.substring(0,30)}..."` : "the current topic";
    let suggestionMessage = "";
    if (level === 0) {
        suggestionMessage = `Still pondering ${qTextShort}? I can suggest what to ask next.`;
    } else { 
        suggestionMessage = `Need a fresh perspective on ${qTextShort}? How about we explore some examples?`;
    }
    const lastMessage = messages[messages.length-1];
    if (!lastMessage || !(lastMessage.sender === 'ai' && lastMessage.richResponse?.suggestedFollowUpActions?.length)) {
      addMessage('system', suggestionMessage, true, {
        id: `inactive-${Date.now()}`,
        primaryContent: suggestionMessage,
        suggestedFollowUpActions: [{ action: ChatbotAction.SUGGEST_USER_FOLLOWUPS, displayText: "Suggest What I Ask Next" }]
      });
    }
  }, [activeQuestion, isLoading, isOpen, apiKey, chatInstance, isWaitingForTerm, messages]); 

  useInactivityDetector(handleInactivity, CHATBOT_INACTIVITY_TIMEOUTS, isOpen && !!apiKey && !!chatInstance);

  const getQuickActions = (): {action: ChatbotAction | string, display: string}[] => {
    let actions: {action: ChatbotAction | string, display: string}[] = [];
    if (activeQuestion) {
      actions = [
        {action: ChatbotAction.DRAFT_ANSWER, display: "Draft Answer"},
        {action: ChatbotAction.EXPLAIN_QUESTION, display: "Explain Context"},
      ];
    } else {
      actions = [
        {action: ChatbotAction.DEFINE_TERM, display: "Define Term"},
        {action: "GENERAL_HELP", display: "General Help"}, // Example custom action
      ];
    }
    actions.push({action: ChatbotAction.SUGGEST_USER_FOLLOWUPS, display: "Suggest Qs for Me"});
    return actions.slice(0,3); 
  };
  
  const currentQuickActions = getQuickActions();


  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/75 z-[9990] animate-fade-in-backdrop backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[calc(100%-3rem)] md:max-w-md lg:max-w-lg 
                    h-[calc(100%-3rem)] max-h-[80vh] md:h-[700px] md:max-h-[700px] 
                    z-[9999] flex flex-col bg-white dark:bg-slate-850 
                    shadow-2xl rounded-t-2xl md:rounded-lg border border-slate-300 dark:border-slate-700 animate-scale-up-chat">
        <header className="p-4 bg-blue-600 text-white rounded-t-2xl md:rounded-t-lg flex justify-between items-center border-b border-blue-700 dark:border-slate-700 shadow-md">
          <div className="flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-md">AI Assistant</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
            aria-label="Close AI Assistant"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="p-2.5 text-xs text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          {activeQuestion ? <span>Context: <strong className="text-blue-700 dark:text-blue-400">{activeQuestion.question_text.substring(0, 50)}...</strong></span> : "General Assistance."}
          {!apiKey && <p className="text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">{CHATBOT_DEFAULT_API_KEY_MESSAGE}</p>}
        </div>

        <div className="flex-grow p-4 overflow-y-auto bg-transparent space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col animate-message-appear ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
               <div className={`flex items-end max-w-[90%] group ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`px-3.5 py-2.5 rounded-xl text-sm shadow-md
                    ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : ''}
                    ${msg.sender === 'ai' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-lg prose prose-sm dark:prose-invert max-w-none [&_code]:text-blue-600 [&_code]:dark:text-blue-300 [&_code]:bg-slate-200 [&_code]:dark:bg-slate-600/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded' : ''}
                    ${msg.sender === 'system' ? `bg-transparent text-slate-500 dark:text-slate-400 italic text-xs w-full text-center shadow-none px-0 py-0.5 ${(msg.richResponse && msg.richResponse.suggestedFollowUpActions) ? 'rounded-lg p-2 border border-blue-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-800' : ''}` : ''}
                `}>
                    {msg.isMarkdown ? renderMarkdown(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
                {(msg.sender === 'ai' || (msg.sender === 'system' && msg.richResponse)) && msg.text && msg.text.length > 20 && (
                    <button 
                        onClick={() => handleCopyMessage(msg.text, msg.id)} 
                        title="Copy message content"
                        aria-label="Copy AI message content to clipboard"
                        className="ml-1.5 p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {copiedMessageId === msg.id ? <span className="text-xs text-blue-500">Copied!</span> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    </button>
                )}
              </div>
              {msg.richResponse?.sections && msg.richResponse.sections.length > 0 && (
                 <div className="w-full mt-1.5">
                   <ChatbotExplanationCarousel payload={{ slides: msg.richResponse.sections.map(s => ({ title: s.title || "Details", text: s.content })) }} />
                 </div>
              )}
              {msg.richResponse?.suggestedFollowUpActions && msg.richResponse.suggestedFollowUpActions.length > 0 && (
                <div className={`mt-2 flex flex-wrap gap-2 ${msg.sender === 'user' ? 'justify-end mr-0' : (msg.sender === 'system' ? 'justify-center' : 'justify-start ml-0')}`}>
                  {msg.richResponse.suggestedFollowUpActions.map((fActionObj, index) => (
                    <button
                      key={`${msg.id}-followup-${index}`}
                      onClick={() => handleAction(fActionObj.action as ChatbotAction, msg.text, fActionObj.context || fActionObj.displayText)}
                      disabled={isLoading || !chatInstance}
                      className="px-2.5 py-1 text-xs font-medium bg-blue-100 hover:bg-blue-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-blue-700 dark:text-blue-200 rounded-md transition-colors disabled:opacity-50 shadow-sm"
                      aria-label={`AI Suggested Action: ${fActionObj.displayText}`}
                    >
                      {fActionObj.displayText}
                    </button>
                  ))}
                </div>
              )}
              <p className={`text-[10px] mt-0.5 ${msg.sender === 'user' ? 'text-slate-400 dark:text-slate-500 mr-1' : 'text-slate-400 dark:text-slate-500 ml-1'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-2 animate-pulse">AI is thinking...</div>}
          {error && <div className="text-center text-xs text-red-600 dark:text-red-400 py-2">Error: {error}</div>}
        </div>
        
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <div className="flex items-center space-x-2">
            <input 
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder={apiKey && chatInstance ? (isWaitingForTerm ? "Enter term..." : "Type your message...") : "API Key needed..."}
              className="flex-grow p-3 border border-transparent focus:border-blue-300 dark:focus:border-blue-500 rounded-full text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white disabled:opacity-50 shadow-sm"
              disabled={isLoading || !apiKey || !chatInstance}
              aria-label="Chat input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim() || !apiKey || !chatInstance}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 transition-colors shadow-md"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          {apiKey && chatInstance && currentQuickActions.length > 0 && (
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {currentQuickActions.map(qActionObj => (
                <button
                  key={qActionObj.action}
                  onClick={() => handleAction(qActionObj.action as ChatbotAction)}
                  disabled={isLoading || (!activeQuestion && qActionObj.action === ChatbotAction.EXPLAIN_QUESTION)}
                  className="p-2 text-xs font-medium bg-blue-100 hover:bg-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-300 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  title={qActionObj.display}
                  aria-label={`Quick AI Action: ${qActionObj.display}`}
                >
                  {qActionObj.display}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatbotOverlay;
