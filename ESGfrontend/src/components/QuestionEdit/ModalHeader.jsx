import PropTypes from 'prop-types';

const ModalHeader = ({ questionId, questionText, closeModal }) => (
    <div className="relative flex justify-between items-center px-6 py-1 border-b border-gray-200 bg-white">
        <h2 id={`question-${questionId}-title`} className="text-lg font-semibold text-blue-700 truncate">
            Edit Answer : AI Assistance
        </h2>
        <div className="flex items-center">
            <button
                onClick={closeModal}
                className="p-1 !rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close modal"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
);

ModalHeader.propTypes = {
    questionId: PropTypes.string.isRequired,
    questionText: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
};

export default ModalHeader;