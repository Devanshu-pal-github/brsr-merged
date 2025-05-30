import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSubmodulesByModuleIdQuery, useGetQuestionResponsesMutation } from '../api/apiSlice';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import SubHeader from '../components/SubHeader';
import WorkforceQuestion from '../components/WorkforceQuestion';
import QuestionnaireItem from '../components/QuestionItem';

const DynamicEntityDetails = () => {
    const { moduleId } = useParams();
    const { data: submodules = [], isLoading, isError, error } = useGetSubmodulesByModuleIdQuery(moduleId);

    // Tabs: submodule names
    const tabs = submodules.map(sub => sub.submodule_name);
    const [activeTab, setActiveTab] = useState('');

    // Set default active tab when submodules load
    useEffect(() => {
        if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0]);
    }, [tabs, activeTab]);

    // Find the current submodule
    const currentSubmodule = submodules.find(sub => sub.submodule_name === activeTab);

    // Fetch answers for all questions in the selected submodule
    const [getQuestionResponses, { data: answers, isLoading: isAnswersLoading, isError: isAnswersError, error: answersError }] = useGetQuestionResponsesMutation();

    useEffect(() => {
        if (currentSubmodule && Array.isArray(currentSubmodule.question_categories)) {
            // Gather all question IDs for this submodule
            const questionIds = currentSubmodule.question_categories
                .flatMap(cat => Array.isArray(cat.questions) ? cat.questions.map(q => q.question_id) : []);
            if (questionIds.length > 0) {
                getQuestionResponses(questionIds)
                    .unwrap()
                    .then(res => {
                        console.log('Fetched answers:', res);
                    })
                    .catch(err => {
                        console.error('Error fetching answers:', err);
                    });
            }
        }
    }, [currentSubmodule, getQuestionResponses]);

    // Render all question categories and their questions
    const renderSubmodule = (submodule) => {
        if (!submodule || !Array.isArray(submodule.question_categories)) {
            return (
                <div className="flex items-center justify-center min-h-[40vh] text-gray-500">
                    No categories found for this submodule.
                </div>
            );
        }
        return (
            <div className="flex flex-col space-y-8">
                {/* Debug log */}
                <pre className="bg-gray-100 text-xs p-2 rounded mb-2">
                    {isAnswersLoading ? 'Loading answers...' : isAnswersError ? `Error: ${answersError?.data?.detail || 'Unknown error'}` : JSON.stringify(answers, null, 2)}
                </pre>
                {submodule.question_categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-[#000D30]">
                            {category.category_name || 'Unnamed Category'}
                        </h3>
                        <div className="space-y-4">
                            {Array.isArray(category.questions) && category.questions.length > 0 ? (
                                category.questions.map((question) => (
                                    <WorkforceQuestion
                                        key={question.question_id}
                                        question={question.question}
                                    >
                                        <QuestionnaireItem
                                            question={question}
                                            answer={answers?.[question.question_id]?.response || ''}
                                            isDropdownOpen={false}
                                            onUpdate={(updatedData) => {
                                                // TODO: Implement update logic
                                                console.log('Updated:', updatedData);
                                            }}
                                            onAIAssistantClick={() => {
                                                // TODO: Implement AI assistant logic
                                                console.log('AI Assistant clicked for:', question.question_id);
                                            }}
                                        />
                                    </WorkforceQuestion>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">No questions in this category.</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Breadcrumb */}
                <div className="h-25 w-full">
                    <div className="fixed top-[30px] ml-0.5 z-10 w-full">
                        <Breadcrumb section="Entity Details" activeTab={activeTab} />
                    </div>
                </div>
                {/* Submodule Tabs and Content */}
                <div className="mt-[10px] pt-[10px] mx-2">
                    <div className="w-full flex flex-col space-y-[10px]">
                        {/* Tabs */}
                        <div className="h-10 w-full">
                            <div className="fixed top-[140px] ml-0.5 z-10 w-[calc(100%-230px)]">
                                <SubHeader
                                    tabs={tabs}
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                />
                            </div>
                        </div>
                        {/* Content Area */}
                        <div className="mt-[180px] px-4">
                            {isLoading && (
                                <div className="flex items-center justify-center min-h-[40vh] text-gray-500">
                                    Loading submodules...
                                </div>
                            )}
                            {isError && (
                                <div className="flex items-center justify-center min-h-[40vh] text-red-500">
                                    Error loading submodules: {error?.error || 'Unknown error'}
                                </div>
                            )}
                            {!isLoading && !isError && (
                                currentSubmodule
                                    ? renderSubmodule(currentSubmodule)
                                    : <div className="flex items-center justify-center min-h-[40vh] text-gray-500">Select a submodule to view content</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DynamicEntityDetails;