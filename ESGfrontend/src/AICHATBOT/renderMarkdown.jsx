import ReactMarkdown from 'react-markdown';

export const renderMarkdown = (text) => {
    return (
        <div>
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
};