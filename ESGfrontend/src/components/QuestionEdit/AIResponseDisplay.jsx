import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

const AIResponseDisplay = ({ aiMessage, isLoading, error, handlePostResponseAction }) => {
    if (isLoading) {
        console.log("AI is thinking...");
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
                <p className="text-blue-600/70 text-xs mt-1">Analyzing your response...</p>
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

export default AIResponseDisplay;
