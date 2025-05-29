import { useState } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import WorkforceQuestion from '../components/WorkforceQuestion';
import QuestionnaireItem from '../components/QuestionItem';

const EntityDetails = () => {
    const renderSubmodule = (submodule) => {
        return (
            <div className="flex flex-col space-y-[10px]">
                {submodule.question_categories?.map((category) => (
                    <div key={category.id}>
                        <h3 className="text-lg font-semibold mb-4">{category.category_name}</h3>
                        {category.questions.map((question) => (
                            <WorkforceQuestion key={question.question_id} question={question.question}>
                                <QuestionnaireItem
                                    question={question.question}
                                    answer=""
                                    isDropdownOpen={false}
                                    onUpdate={(updatedData) => {
                                        console.log('Updated:', updatedData);
                                    }}
                                    onAIAssistantClick={() => console.log('AI Assistant clicked for:', question.question_id)}
                                />
                            </WorkforceQuestion>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return <ModuleLayout renderSubmodule={renderSubmodule} />;
};

export default EntityDetails; 