import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSubmodulesByModuleIdQuery, useGetQuestionResponsesMutation } from '../api/apiSlice';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import SubHeader from '../components/SubHeader';
import QuestionnaireItem from '../components/QuestionItem';
import ProgressCard from '../components/ProgressCard';
import AIAssistant from '../components/WorkforceAi';
import AIAssisstantChat from '../components/AIAssisstantChat';
import QuestionFormPopup from "../components/QuestionFormPopup";

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
    const renderEditModal = (question, answers, setEditModalQuestionId) => {
        const initialValues = answers?.[question.question_id] || {};
        console.log('[DynamicEntityDetails] Rendering QuestionFormPopup for question:', question);
        console.log('[DynamicEntityDetails] initialValues:', initialValues);
        const handleSubmit = (response) => {
            console.log('[DynamicEntityDetails] onSubmit from QuestionFormPopup:', response);
            // TODO: Integrate with actual update logic
            setEditModalQuestionId(null);
        };
        return (
            <QuestionFormPopup
                questionData={question}
                onSubmit={handleSubmit}
                onClose={() => setEditModalQuestionId(null)}
                initialValues={initialValues}
            />
        );
    };

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
        // Log all questions and their current answers for view-only mode
        submodule.question_categories.forEach(category => {
            if (Array.isArray(category.questions)) {
                category.questions.forEach(question => {
                    const answer = answers?.[question.question_id];
                    console.log('[DynamicEntityDetails][View] Question:', question);
                    console.log('[DynamicEntityDetails][View] Answer:', answer);
                });
            }
        });
        return (
            <div className="flex flex-col gap-4">
                {submodule.question_categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-[6px] shadow-sm p-0 border border-gray-200 transition-all duration-300 hover:shadow-md">
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between text-base md:text-lg font-semibold mb-1 text-[#000D30] hover:text-[#20305D] transition-colors focus:outline-none rounded-[6px] px-6 py-1 pt-1 h-[36px]"
                            style={{ borderBottom: openCategories[category.id] ? '1px solid #e5e7eb' : 'none' }}
                        >
                            <span className="flex items-center pl-[8px] h-full">{category.category_name || 'Unnamed Category'}</span>
                            <span className={`transition-transform duration-300 ${openCategories[category.id] ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" fill="none" stroke="#20305D" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                            </span>
                        </button>
                        {openCategories[category.id] && (
                            <div className="flex flex-col gap-2 px-0.5 pb-1 pt-0.5">
                                {Array.isArray(category.questions) && category.questions.length > 0 ? (
                                    category.questions.map((question) => (
                                        <div key={question.question_id} className="flex flex-col relative bg-white rounded-[4px] shadow border border-gray-100 p-2 mb-0.5 transition-all duration-300 hover:shadow-md group min-h-[36px]">
                                            <div className="flex flex-row flex-nowrap items-start justify-between gap-2 pr-[60px] relative">
                                                {/* Question text, wraps before Edit button */}
                                                <div className="flex-1 min-w-0 max-w-full break-words text-[13px] md:text-[14px] font-medium text-[#1A2341] leading-tight transition-all duration-300 self-start">
                                                    {question.question}
                                                </div>
                                                {/* Edit button absolutely positioned, always top right, aligned with top of question */}
                                                <button
                                                    className="absolute right-2 top-0 bg-[#002A85] text-white font-medium px-2 min-w-[32px] min-h-[20px] rounded-[4px] text-[11px] shadow-sm focus:outline-none transition-all duration-200 hover:bg-[#0A2E87]"
                                                    onClick={() => setEditModalQuestionId(question.question_id)}
                                                    aria-label="Edit"
                                                    style={{ marginLeft: 'auto' }}
                                                >
                                                    Edit
                                                </button>
                                                {editModalQuestionId === question.question_id && renderEditModal(question, answers, setEditModalQuestionId)}
                                            </div>
                                            {/* ANSWER DISPLAY ROW: prevent overlap with Edit button, show all fields clearly */}
                                            <div className="flex flex-row flex-wrap items-start justify-between gap-2 pr-[60px] relative mt-1">
                                                <div className="flex flex-col gap-1 min-w-0 max-w-full break-words">
                                                    {(() => {
                                                        const answer = answers?.[question.question_id];
                                                        const displayItems = [];
                                                        // Link (top row)
                                                        if (answer && answer.link) {
                                                            displayItems.push(
                                                                <span key="link" className="flex items-center flex-wrap">
                                                                    <span className="font-semibold">Link:</span> <a href={answer.link} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer">{answer.link}</a>
                                                                </span>
                                                            );
                                                        }
                                                        // Boolean (Yes/No) always shown, on its own line if no link, or beside link if both
                                                        if (typeof answer?.bool_value === 'boolean') {
                                                            displayItems.push(
                                                                <span key="bool" className={answer.bool_value ? 'text-green-600 font-semibold ml-0' : 'text-red-600 font-semibold ml-0'}>
                                                                    {answer.bool_value ? 'Yes' : 'No'}
                                                                </span>
                                                            );
                                                        }
                                                        // String value
                                                        if (answer && answer.string_value) {
                                                            displayItems.push(
                                                                <span key="string">
                                                                    <span className="font-semibold">Response:</span> {answer.string_value}
                                                                </span>
                                                            );
                                                        }
                                                        // Decimal value
                                                        if (answer && typeof answer.decimal_value !== 'undefined') {
                                                            displayItems.push(
                                                                <span key="decimal">
                                                                    <span className="font-semibold">Value:</span> {answer.decimal_value}
                                                                </span>
                                                            );
                                                        }
                                                        // Note
                                                        if (answer && answer.note) {
                                                            displayItems.push(
                                                                <span key="note">
                                                                    <span className="font-semibold">Note:</span> {answer.note}
                                                                </span>
                                                            );
                                                        }
                                                        if (displayItems.length === 0) {
                                                            return <span className="italic text-gray-400">No answer provided.</span>;
                                                        }
                                                        // If both link and bool, show them together on top row, else each on its own line
                                                        if (displayItems.length > 1 && displayItems[0].key === 'link' && displayItems[1].key === 'bool') {
                                                            return (
                                                                <>
                                                                    <div className="flex flex-row flex-wrap items-center gap-2">{displayItems[0]}{displayItems[1]}</div>
                                                                    {displayItems.slice(2).map((item, idx) => <div key={item.key || idx}>{item}</div>)}
                                                                </>
                                                            );
                                                        }
                                                        // Otherwise, all on their own lines
                                                        return displayItems.map((item, idx) => <div key={item.key || idx}>{item}</div>);
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 italic text-xs">No questions in this category.</div>
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
            <div className="relative flex w-full h-screen">
                {/* Main Content Area */}
                <section className="flex-1 flex flex-col min-w-0 max-w-[70vw] mx-auto bg-transparent px-[2vw] pt-0 pb-0">
                    {/* Fixed Header: Breadcrumb + SubHeader */}
                    <div className="sticky top-0 z-30 pt-[2vh] pb-[1vh] border-b border-gray-200">
                        <div className="w-full max-w-[70vw] mx-auto px-0 sm:px-[1vw] md:px-0">
                            <Breadcrumb section="Entity Details" activeTab={activeTab} />
                        </div>
                        <div className="w-full max-w-[70vw] mx-auto px-0 sm:px-[1vw] md:px-0 mt-[1vh]">
                            <SubHeader
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        </div>
                    </div>
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 py-[2vh] pr-[1vw] custom-scrollbar flex flex-col gap-[2vh] scroll-smooth hover:scroll-auto transition-all duration-500 scrollbar-hide">
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
                <aside className="hidden lg:flex flex-col mt-[3vh] mr-[30px] gap-[1.2vh] px-[0.7vw] pt-[1.2vh] pb-[1.2vh] bg-white border-l border-gray-200 shadow-lg min-w-[16vw] max-w-[18vw] w-full sticky top-0 h-[82vh] z-20 items-center justify-start rounded-[4px] transition-all duration-500">
                    {/* Progress Circle */}
                    <div className="flex flex-col items-center mb-[0.7vh]">
                        <svg width="6vw" height="6vw" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#4F46E5" strokeWidth="8" strokeDasharray="314" strokeDashoffset="60" strokeLinecap="round" />
                        </svg>
                        <div className="mt-[0.7vh] text-gray-700 font-semibold text-[11px]">38 of 50 questions completed</div>
                    </div>
                    {/* Course Sections */}
                    <div className="bg-[#F8FAFC] rounded-[4px] shadow p-[0.7vw] border border-gray-100 w-full flex flex-col gap-[0.7vh]">
                        <div className="font-semibold text-[11px] mb-[0.3vh] text-[#000D30]">Course Sections</div>
                        <div className="flex flex-col gap-[0.3vh]">
                            <div>
                                <div className="text-[11px] font-medium text-[#000D30] mb-0.5">Section 1: Introduction</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '80%' }}></div>
                                </div>
                                <div className="text-[9px] text-gray-500">8 of 10 completed</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-[#000D30] mb-0.5">Section 2: Fundamentals</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '60%' }}></div>
                                </div>
                                <div className="text-[9px] text-gray-500">6 of 10 completed</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-[#000D30] mb-0.5">Section 3: Advanced Topics</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '40%' }}></div>
                                </div>
                                <div className="text-[9px] text-gray-500">4 of 10 completed</div>
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-[#000D30] mb-0.5">Section 4: Practice</div>
                                <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                    <div className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700" style={{ width: '20%' }}></div>
                                </div>
                                <div className="text-[9px] text-gray-500">2 of 10 completed</div>
                            </div>
                        </div>
                    </div>
                    {/* Category Overview */}
                    <div className="bg-[#F8FAFC] rounded-[4px] shadow p-[0.7vw] border border-gray-100 w-full flex flex-col gap-[0.3vh]">
                        <div className="font-semibold text-[11px] mb-[0.3vh] text-[#000D30]">Category Overview</div>
                        <div className="flex flex-col gap-[0.15vh]">
                            <div className="flex justify-between text-[10px]"><span>Fundamentals</span><span>15/20 questions</span></div>
                            <div className="flex justify-between text-[10px]"><span>Theory</span><span>12/15 questions</span></div>
                            <div className="flex justify-between text-[10px]"><span>Practical Examples</span><span>8/10 questions</span></div>
                            <div className="flex justify-between text-[10px]"><span>Assessments</span><span>3/5 questions</span></div>
                        </div>
                    </div>
                </aside>
                {/* Floating AI Button and Overlay Chat */}
                <button
                    className="fixed z-[120] bottom-[3vh] right-[3vw] w-[6vw] h-[6vw] min-w-[48px] min-h-[48px] max-w-[80px] max-h-[80px] rounded-full bg-gradient-to-br from-[#0A2E87] to-[#4F46E5] shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white focus:outline-none"
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
