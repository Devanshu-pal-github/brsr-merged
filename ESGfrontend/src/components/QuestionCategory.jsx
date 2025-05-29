import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import WorkforceQuestion from './WorkforceQuestion';

const QuestionCategory = ({ category, renderQuestion }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-lg font-semibold mb-4 text-[#000D30] hover:text-[#20305D] transition-colors"
            >
                <span>{category.category_name}</span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>
            
            {isExpanded && (
                <div className="space-y-6">
                    {category.questions.map((question) => (
                        <WorkforceQuestion 
                            key={question.question_id} 
                            question={question.question}
                        >
                            {renderQuestion(question)}
                        </WorkforceQuestion>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestionCategory; 