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
import AIAssisstantChat from '../components/AIAssisstantChat';

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

    // Modal state for editing answers
    const [editModalQuestionId, setEditModalQuestionId] = useState(null);
    const renderEditModal = (question) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-0 max-w-3xl w-full relative">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    onClick={() => setEditModalQuestionId(null)}
                    aria-label="Close"
                >
                    ×
                </button>
                <img
                    src="https://files.oaiusercontent.com/file-1b1e2e2e-6e2e-4e2e-8e2e-1e2e2e2e2e2e.png" // Replace with your uploaded image URL or local asset
                    alt="Edit Answer Placeholder"
                    className="w-full rounded-lg"
                />
                <div className="p-4 text-center text-gray-600">Edit popup placeholder for: <span className="font-semibold">{question.question}</span></div>
            </div>
        </div>
    );

    // AI Chat state
    const [aiChatOpen, setAiChatOpen] = useState(false);

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
                                            <div className="flex flex-col relative">
                                                {/* Render QuestionnaireItem as view-only by disabling input */}
                                                <QuestionnaireItem
                                                    question={question}
                                                    answer={getBestAnswerValue(answers?.[question.question_id])}
                                                    isDropdownOpen={false}
                                                    isReadOnly={true}
                                                    onUpdate={() => {}}
                                                    onAIAssistantClick={() => {}}
                                                />
                                                <button
                                                    className="absolute top-4 right-4 bg-[#0A2E87] hover:bg-[#20305D] text-white font-medium py-1.5 px-5 rounded focus:outline-none transition-colors"
                                                    onClick={() => setEditModalQuestionId(question.question_id)}
                                                >
                                                    Edit
                                                </button>
                                                {editModalQuestionId === question.question_id && renderEditModal(question)}
                                            </div>
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
                    {/* Progress Circle */}
                    <div className="flex flex-col items-center mb-2">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#4F46E5" strokeWidth="12" strokeDasharray="314" strokeDashoffset="60" strokeLinecap="round" />
                        </svg>
                        <div className="mt-2 text-gray-700 font-medium text-base">38 of 50 questions completed</div>
                    </div>
                    {/* Course Sections */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="font-semibold text-lg mb-2 text-[#000D30]">Course Sections</div>
                        <div className="mb-3">
                            <div className="text-sm font-medium text-[#000D30] mb-1">Section 1: Introduction</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                                <div className="h-2 bg-[#4F46E5] rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500">8 of 10 completed</div>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm font-medium text-[#000D30] mb-1">Section 2: Fundamentals</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                                <div className="h-2 bg-[#4F46E5] rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500">6 of 10 completed</div>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm font-medium text-[#000D30] mb-1">Section 3: Advanced Topics</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                                <div className="h-2 bg-[#4F46E5] rounded-full" style={{ width: '40%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500">4 of 10 completed</div>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm font-medium text-[#000D30] mb-1">Section 4: Practice</div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                                <div className="h-2 bg-[#4F46E5] rounded-full" style={{ width: '20%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500">2 of 10 completed</div>
                        </div>
                    </div>
                    {/* Category Overview */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="font-semibold text-lg mb-2 text-[#000D30]">Category Overview</div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm"><span>Fundamentals</span><span>15/20 questions</span></div>
                            <div className="flex justify-between text-sm"><span>Theory</span><span>12/15 questions</span></div>
                            <div className="flex justify-between text-sm"><span>Practical Examples</span><span>8/10 questions</span></div>
                            <div className="flex justify-between text-sm"><span>Assessments</span><span>3/5 questions</span></div>
                        </div>
                    </div>
                </aside>
            </div>
            {/* Floating AI Button and Overlay Chat */}
            <button
                className="fixed z-[120] bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#0A2E87] to-[#4F46E5] shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-4 border-white"
                style={{ boxShadow: '0 8px 32px 0 rgba(10,46,135,0.25)' }}
                onClick={() => setAiChatOpen(true)}
                aria-label="Open AI Assistant Chat"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.333-2 6.667-2 8 0"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
            </button>
            {aiChatOpen && (
                <div className="fixed inset-0 z-[110] flex items-end justify-end bg-opacity-30">
                    <div className="w-full h-full absolute top-0 left-0" onClick={() => setAiChatOpen(false)} />
                    <div className="relative z-10 w-full max-w-md m-6">
                        <AIAssisstantChat onClose={() => setAiChatOpen(false)} />
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DynamicEntityDetails;