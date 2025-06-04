const ModalHeader = ({ questionId, questionText, closeModal, isAIAssistantOpen, toggleAIAssistant }) => (
    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <h2 id={`question-${questionId}-title`} className="text-lg font-semibold text-blue-700 truncate">
            Edit Answer: {questionText}
        </h2>
        <div className="flex items-center space-x-2">
            <button
                onClick={toggleAIAssistant}
                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                aria-label={isAIAssistantOpen ? "Hide Mini AI Assistant" : "Show Mini AI Assistant"}
            >
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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