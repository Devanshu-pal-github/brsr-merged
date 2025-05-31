import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSubmodulesByModuleIdQuery, useGetQuestionResponsesMutation } from '../api/apiSlice';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import SubHeader from '../components/SubHeader';
import WorkforceQuestion from '../components/WorkforceQuestion';
import QuestionnaireItem from '../components/QuestionItem';
import ProgressCard from '../components/ProgressCard';
import AIAssistant from '../components/WorkforceAi';

const getBestAnswerValue = (answerObj) => {
    if (!answerObj) return '';
    // Prefer string_value, then decimal_value, then bool_value, then link, then note
    if (typeof answerObj.string_value !== 'undefined') return answerObj.string_value;
    if (typeof answerObj.decimal_value !== 'undefined') return answerObj.decimal_value;
    if (typeof answerObj.bool_value !== 'undefined') return answerObj.bool_value;
    if (typeof answerObj.link !== 'undefined') return answerObj.link;
    if (typeof answerObj.note !== 'undefined') return answerObj.note;
    if (typeof answerObj.response !== 'undefined') return answerObj.response;
    return '';
};

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

    // Collapsible state for each category
    const [openCategories, setOpenCategories] = useState({});
    useEffect(() => {
        // Reset open state when submodule changes
        if (currentSubmodule) {
            const initial = {};
            currentSubmodule.question_categories?.forEach(cat => {
                initial[cat.id] = false;
            });
            setOpenCategories(initial);
        }
    }, [currentSubmodule]);
    const toggleCategory = (catId) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

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
            <div className="flex flex-col space-y-6">
                {submodule.question_categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg shadow-sm p-0 border border-gray-200">
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between text-lg font-semibold px-6 py-4 text-[#000D30] hover:text-[#20305D] transition-colors focus:outline-none"
                            style={{ borderBottom: openCategories[category.id] ? '1px solid #e5e7eb' : 'none' }}
                        >
                            <span>{category.category_name || 'Unnamed Category'}</span>
                            <span className={`transition-transform ${openCategories[category.id] ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" fill="none" stroke="#20305D" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                            </span>
                        </button>
                        {openCategories[category.id] && (
                            <div className="space-y-4 px-6 pb-6 pt-2">
                                {Array.isArray(category.questions) && category.questions.length > 0 ? (
                                    category.questions.map((question) => (
                                        <WorkforceQuestion
                                            key={question.question_id}
                                            question={question.question}
                                        >
                                            <QuestionnaireItem
                                                question={question}
                                                answer={getBestAnswerValue(answers?.[question.question_id])}
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
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row w-full h-full">
                {/* Main Content Area */}
                <section className="flex-1 w-full max-w-4xl mx-auto bg-transparent rounded-lg shadow-none px-0 sm:px-2 md:px-4 pt-2 pb-8 space-y-6 min-h-0 flex flex-col">
                    {/* Breadcrumb */}
                    <div className="w-full">
                        <Breadcrumb section="Entity Details" activeTab={activeTab} />
                    </div>
                    {/* Submodule Tabs and Content */}
                    <div className="flex flex-col space-y-6">
                        {/* Tabs */}
                        <div className="w-full sticky top-0 z-20 bg-[#F2F4F5] pt-2 pb-2">
                            <SubHeader
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        </div>
                        {/* Content Area (scrollable) */}
                        <div className="flex-1 w-full overflow-y-auto min-h-0">
                            {isLoading && (
                                <div className="flex items-center justify-center min-h-[30vh] text-gray-500">
                                    Loading submodules...
                                </div>
                            )}
                            {isError && (
                                <div className="flex items-center justify-center min-h-[30vh] text-red-500">
                                    Error loading submodules: {error?.error || 'Unknown error'}
                                </div>
                            )}
                            {!isLoading && !isError && (
                                currentSubmodule
                                    ? renderSubmodule(currentSubmodule)
                                    : <div className="flex items-center justify-center min-h-[30vh] text-gray-500">Select a submodule to view content</div>
                            )}
                        </div>
                    </div>
                </section>
                {/* Right Sidebar: Progress + AI Assistant */}
                <aside className="w-full lg:w-1/3 xl:w-1/4 min-w-0 max-w-md flex flex-col gap-6 px-4 pt-4 pb-8 lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)]">
                    <div className="mb-2">
                        <ProgressCard covered={14} total={20} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <AIAssistant />
                    </div>
                </aside>
            </div>
        </Layout>
    );
};

export default DynamicEntityDetails;