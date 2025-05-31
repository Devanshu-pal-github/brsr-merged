import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import WorkforceQuestion from './WorkforceQuestion';

const QuestionCategory = ({ category, renderQuestion }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center h-[36px] px-2 pt-1 cursor-pointer select-none"
            >
                <span className="flex-1 flex items-center h-full font-medium text-[0.92rem] mb-4 text-[#000D30] hover:text-[#20305D] transition-colors">
                    {category.category_name}
                </span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </div>
            
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