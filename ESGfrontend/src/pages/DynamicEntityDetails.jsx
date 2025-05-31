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
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-[6px] shadow-2xl max-w-2xl w-full p-0 overflow-hidden border border-gray-200 relative animate-fadeIn">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                    onClick={() => setEditModalQuestionId(null)}
                    aria-label="Close"
                >
                    ×
                </button>
                <div className="p-0">
                    <img
                        src="https://files.oaiusercontent.com/file-1b1e2e2e-6e2e-4e2e-8e2e-1e2e2e2e2e2e.png"
                        alt="Edit Answer Placeholder"
                        className="w-full rounded-t-[6px]"
                    />
                    <div className="p-6 text-center text-gray-700 text-base font-medium border-t border-gray-100">Edit popup placeholder for: <span className="font-semibold">{(currentSubmodule?.question_categories.flatMap(cat => cat.questions).find(q => q.question_id === editModalQuestionId)?.question) || ''}</span></div>
                </div>
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
            <div className="flex flex-col gap-4">
                {submodule.question_categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-[6px] shadow-sm p-4 border border-gray-200 transition-all duration-300 hover:shadow-md">
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between text-base md:text-lg font-semibold mb-2 text-[#000D30] hover:text-[#20305D] transition-colors focus:outline-none rounded-[6px] px-2 py-2"
                            style={{ borderBottom: openCategories[category.id] ? '1px solid #e5e7eb' : 'none' }}
                        >
                            <span>{category.category_name || 'Unnamed Category'}</span>
                            <span className={`transition-transform duration-300 ${openCategories[category.id] ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" fill="none" stroke="#20305D" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                            </span>
                        </button>
                        {openCategories[category.id] && (
                            <div className="flex flex-col gap-3 px-1 pb-2 pt-1">
                                {Array.isArray(category.questions) && category.questions.length > 0 ? (
                                    category.questions.map((question) => (
                                        <WorkforceQuestion
                                            key={question.question_id}
                                            question={question.question}
                                        >
                                            <div className="flex flex-col relative bg-white rounded-[6px] shadow border border-gray-100 p-4 mb-1 transition-all duration-300 hover:shadow-lg group">
                                                <div className="text-[15px] md:text-base font-semibold text-[#1A2341] mb-1 leading-tight transition-all duration-300">{question.question}</div>
                                                <div className="text-gray-700 text-[13px] md:text-[14px] leading-relaxed mb-1 transition-all duration-300">
                                                    {getBestAnswerValue(answers?.[question.question_id]) || <span className="italic text-gray-400">No answer provided.</span>}
                                                </div>
                                                <button
                                                    className="absolute top-3 right-3 bg-gradient-to-br from-[#0A2E87] to-[#4F46E5] text-white font-semibold py-1 px-3 rounded-[6px] text-xs shadow-sm focus:outline-none transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
                                                    onClick={() => setEditModalQuestionId(question.question_id)}
                                                >
                                                    <span className="inline-block align-middle">✏️</span>
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
            <div className="relative flex w-full h-screen bg-[#F6F8FA]">
                {/* Main Content Area */}
                <section className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto bg-transparent px-2 sm:px-4 md:px-6 pt-0 pb-0">
                    {/* Fixed Header: Breadcrumb + SubHeader */}
                    <div className="sticky top-0 z-30 pt-6 pb-2 border-b border-gray-200 bg-[#F6F8FA]">
                        <div className="w-full max-w-4xl mx-auto px-0 sm:px-2 md:px-0">
                            <Breadcrumb section="Entity Details" activeTab={activeTab} />
                        </div>
                        <div className="w-full max-w-4xl mx-auto px-0 sm:px-2 md:px-0 mt-2">
                            <SubHeader
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        </div>
                    </div>
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 py-6 pr-2 custom-scrollbar flex flex-col gap-6 scroll-smooth hover:scroll-auto transition-all duration-500">
                        {isLoading && (
                            <div className="flex items-center justify-center min-h-[30vh] text-gray-500 text-base">Loading submodules...</div>
                        )}
                        {isError && (
                            <div className="flex items-center justify-center min-h-[30vh] text-red-500 text-base">Error loading submodules: {error?.error || 'Unknown error'}</div>
                        )}
                        {!isLoading && !isError && (
                            currentSubmodule
                                ? renderSubmodule(currentSubmodule)
                                : <div className="flex items-center justify-center min-h-[30vh] text-gray-500 text-base">Select a submodule to view content</div>
                        )}
                    </div>
                </section>
                {/* Right Sidebar: Progress + AI Assistant */}
                <aside className="hidden lg:flex flex-col mt-[32px] gap-4 px-3 pt-6 pb-4 bg-white border-l border-gray-200 shadow-lg min-w-[220px] max-w-[250px] w-full sticky top-0 h-[85vh] z-20 items-center justify-start rounded-[6px] transition-all duration-500">
                    {/* Progress Circle */}
                    <div className="flex flex-col items-center mb-2">
                        <svg width="64" height="64" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#4F46E5" strokeWidth="10" strokeDasharray="314" strokeDashoffset="60" strokeLinecap="round" />
                        </svg>
                        <div className="mt-2 text-gray-700 font-semibold text-xs">38 of 50 questions completed</div>
                    </div>
                    {/* Course Sections */}
                    <div className="bg-[#F8FAFC] rounded-[6px] shadow p-3 border border-gray-100 w-full flex flex-col gap-2">
                        <div className="font-semibold text-xs mb-1 text-[#000D30]">Course Sections</div>
                        <div className="flex flex-col gap-1">
                            <div>
                                <div className="text-xs font-medium text-[#000D30] mb-0.5">Section 1: Introduction</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '80%' }}></div>
                                </div>
                                <div className="text-[10px] text-gray-500">8 of 10 completed</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-[#000D30] mb-0.5">Section 2: Fundamentals</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '60%' }}></div>
                                </div>
                                <div className="text-[10px] text-gray-500">6 of 10 completed</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-[#000D30] mb-0.5">Section 3: Advanced Topics</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '40%' }}></div>
                                </div>
                                <div className="text-[10px] text-gray-500">4 of 10 completed</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-[#000D30] mb-0.5">Section 4: Practice</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '20%' }}></div>
                                </div>
                                <div className="text-[10px] text-gray-500">2 of 10 completed</div>
                            </div>
                        </div>
                    </div>
                    {/* Category Overview */}
                    <div className="bg-[#F8FAFC] rounded-[6px] shadow p-3 border border-gray-100 w-full flex flex-col gap-1">
                        <div className="font-semibold text-xs mb-1 text-[#000D30]">Category Overview</div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between text-[11px]"><span>Fundamentals</span><span>15/20 questions</span></div>
                            <div className="flex justify-between text-[11px]"><span>Theory</span><span>12/15 questions</span></div>
                            <div className="flex justify-between text-[11px]"><span>Practical Examples</span><span>8/10 questions</span></div>
                            <div className="flex justify-between text-[11px]"><span>Assessments</span><span>3/5 questions</span></div>
                        </div>
                    </div>
                </aside>
                {/* Floating AI Button and Overlay Chat */}
                <button
                    className="fixed z-[120] bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-[#0A2E87] to-[#4F46E5] shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white focus:outline-none"
                    style={{ boxShadow: '0 8px 32px 0 rgba(10,46,135,0.25)' }}
                    onClick={() => setAiChatOpen(true)}
                    aria-label="Open AI Assistant Chat"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.333-2 6.667-2 8 0"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
                </button>
                {aiChatOpen && (
                    <div className="fixed inset-0 z-[130] flex items-end justify-end bg-black bg-opacity-40">
                        <div className="w-full h-full absolute top-0 left-0" onClick={() => setAiChatOpen(false)} />
                        <div className="relative z-10 w-full max-w-md m-8">
                            <div className="bg-white rounded-[6px] shadow-2xl p-0 overflow-hidden border border-gray-200">
                                <AIAssisstantChat onClose={() => setAiChatOpen(false)} />
                            </div>
                        </div>
                    </div>
                )}
                {/* Edit Modal Overlay (UI improved) */}
                {editModalQuestionId && (
                    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-[6px] shadow-2xl max-w-2xl w-full p-0 overflow-hidden border border-gray-200 relative animate-fadeIn">
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none transition-colors duration-200"
                                onClick={() => setEditModalQuestionId(null)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <div className="p-0">
                                <img
                                    src="https://files.oaiusercontent.com/file-1b1e2e2e-6e2e-4e2e-8e2e-1e2e2e2e2e2e.png"
                                    alt="Edit Answer Placeholder"
                                    className="w-full rounded-t-[6px]"
                                />
                                <div className="p-6 text-center text-gray-700 text-base font-medium border-t border-gray-100">Edit popup placeholder for: <span className="font-semibold">{(currentSubmodule?.question_categories.flatMap(cat => cat.questions).find(q => q.question_id === editModalQuestionId)?.question) || ''}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DynamicEntityDetails;
