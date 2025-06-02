import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([
        'Tell me about ESG reporting',
        'List 3 fruits',
        'Give me a table of employee data',
        'What is the weather like today?',
    ]);
    const chatEndRef = useRef(null);

    // Scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Parse Gemini API response to determine the message type
    const parseGeminiResponse = (text) => {
        // Check for table-like structure (e.g., "Header1 | Header2\nValue1 | Value2")
        const tableRegex = /^([^\n|]+ \| [^\n|]+(\n|$))+/m;
        if (tableRegex.test(text)) {
            const rows = text.split('\n').filter((row) => row.trim());
            const headers = rows[0].split('|').map((h) => h.trim());
            const data = rows.slice(1).map((row) => {
                const cols = row.split('|').map((c) => c.trim());
                return headers.reduce((obj, header, i) => {
                    obj[header] = cols[i] || '';
                    return obj;
                }, {});
            });
            return { type: 'table', data };
        }

        // Check for bulleted list (e.g., lines starting with "-" or "*")
        const listRegex = /^([-*]\s.*(\n|$))+/m;
        if (listRegex.test(text)) {
            const items = text
                .split('\n')
                .filter((line) => line.trim())
                .map((line) => line.replace(/^[-*]\s/, '').trim());
            return { type: 'list', data: items };
        }

        // Default to text
        return { type: 'text', text };
    };

    // Generate follow-up suggestions using Gemini API
    const generateSuggestions = async (context) => {
        try {
            const prompt = `Based on the following conversation context, suggest 3 follow-up questions the user might want to ask:\n\n${context}\n\nProvide the suggestions as a bulleted list (e.g., - Question 1\n- Question 2\n- Question 3).`;
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = await response.text();

            // Parse the suggestions (expecting a bulleted list)
            const suggestionList = text
                .split('\n')
                .filter((line) => line.trim().startsWith('-'))
                .map((line) => line.replace(/^-\s/, '').trim());
            setSuggestions(suggestionList.length > 0 ? suggestionList : suggestions);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            // Fallback to default suggestions if API call fails
            setSuggestions([
                'Tell me more about this topic',
                'Can you provide an example?',
                'What are the next steps?',
            ]);
        }
    };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add user message to chat
        const userMessage = { text: input, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Call Gemini API for the main response
            const result = await model.generateContent(input);
            const response = result.response;
            const text = await response.text();

            // Parse the response to determine its type
            const parsedResponse = parseGeminiResponse(text);
            const botResponse = {
                ...parsedResponse,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);

            // Generate follow-up suggestions based on the conversation
            const conversationContext = messages
                .concat(userMessage, botResponse)
                .map((msg) => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text || ''}`)
                .join('\n');
            await generateSuggestions(conversationContext);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            const errorResponse = {
                text: 'Sorry, I encountered an error. Please try again.',
                type: 'text',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setLoading(false);
        }
    };

    // Handle clicking a suggestion
    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
    };

    // Handle Enter key press to send message
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSendMessage();
        }
    };

    // Format timestamp
    const formatTimestamp = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Render message content based on type
    const renderMessageContent = (message) => {
        switch (message.type) {
            case 'table':
                return (
                    <table className="min-w-full border border-gray-300 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100">
                                {Object.keys(message.data[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {message.data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} className="px-4 py-2 text-sm text-gray-600 border-b">
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'list':
                return (
                    <ul className="list-disc list-inside">
                        {message.data.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {item}
                            </li>
                        ))}
                    </ul>
                );
            case 'text':
            default:
                return <p className="text-sm text-gray-600">{message.text}</p>;
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 shadow-md">
                <h1 className="text-lg font-semibold">Generic Chatbot</h1>
                <p className="text-sm">Powered by Gemini API</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-xs p-3 rounded-lg shadow-sm ${message.sender === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                        >
                            {renderMessageContent(message)}
                            <p className="text-xs mt-1 opacity-70">
                                {formatTimestamp(message.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs p-3 rounded-lg shadow-sm bg-white border border-gray-200">
                            <p className="text-sm text-gray-600">Loading...</p>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            <div className="bg-gray-100 p-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Suggestions:</p>
                <div className="flex overflow-x-auto gap-2 pb-2">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors whitespace-nowrap"
                            disabled={loading}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={loading}
                />
                <button
                    onClick={handleSendMessage}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;