import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetSubmodulesByModuleIdQuery,
    useGetQuestionResponsesMutation,
    useSubmitQuestionAnswerMutation
} from '../api/apiSlice';
import { BarChart3, X, Edit3 } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import SubHeader from '../components/SubHeader';
import QuestionnaireItem from '../components/QuestionItem';
import ProgressCard from '../components/ProgressCard';
import AIAssistant from '../components/WorkforceAi';
import QuestionEditPopup from "../components/QuestionEditPopup";
import TableQuestionRenderer from "../components/TableQuestionRenderer";
import ChatbotWindow from '../AICHATBOT/ChatbotWindow';
import { AppProvider } from '../AICHATBOT/AppProvider';
import { transformTableMetadata, createEmptyTableResponse } from '../components/tableUtils';

const getBestAnswerValue = (answerObj) => {
    if (!answerObj) return '';
    if (typeof answerObj.string_value !== 'undefined') return answerObj.string_value;
    if (typeof answerObj.decimal_value !== 'undefined') return answerObj.decimal_value;
    if (typeof answerObj.bool_value !== 'undefined') return answerObj.bool_value;
    if (typeof answerObj.link !== 'undefined') return answerObj.link;
    if (typeof answerObj.note !== 'undefined') return answerObj.note;
    if (typeof answerObj.response !== 'undefined') return answerObj.response;
    return '';
};

// Utility to map flat table array to row/column structure for TableQuestionRenderer
const mapFlatTableToRows = (flatTable, meta) => {
    if (!Array.isArray(flatTable) || !meta || !meta.rows || !meta.headers) return [];
    // For each row index, get the row label and rowKey (activity_1, activity_2, ...)
    return meta.rows.map((rowObj, rowIdx) => {
        const rowKey = `activity_${rowIdx + 1}`;
        const rowLabel = rowObj.name || rowObj.label || '';
        const rowData = { __rowLabel: rowLabel };
        meta.headers.forEach((colObj) => {
            const colKey = colObj.key || colObj.label?.replace(/\s+/g, '_').toLowerCase();
            const cell = flatTable.find(cell => cell.row === rowKey && cell.col === colKey);
            rowData[colKey] = cell ? cell.value : '';
        });
        return rowData;
    });
};

const DynamicEntityDetails = () => {
    const { moduleId } = useParams();
    const { data: submodules = [], isLoading, isError, error } = useGetSubmodulesByModuleIdQuery(moduleId);

    const tabs = submodules.map(sub => sub.submodule_name);
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0]);
    }, [tabs, activeTab]);

    // Reset activeTab when moduleId changes (i.e., when a new module is selected from the sidebar)
    useEffect(() => {
        if (tabs.length > 0) {
            setActiveTab(tabs[0]);
        }
        // eslint-disable-next-line
    }, [moduleId]);

    const currentSubmodule = submodules.find(sub => sub.submodule_name === activeTab);

    const [getQuestionResponses, { isLoading: isAnswersLoading, isError: isAnswersError, error: answersError }] = useGetQuestionResponsesMutation(); useEffect(() => {
        const fetchAllAnswers = async () => {
            if (submodules && submodules.length > 0) {
                // Get all question IDs from all submodules
                const questionIds = submodules.flatMap(submodule =>
                    submodule.question_categories?.flatMap(cat =>
                        Array.isArray(cat.questions) ?
                            cat.questions.map(q => q.question_id)
                            : []
                    ) || []
                );

                if (questionIds.length > 0) {
                    try {
                        const responses = await getQuestionResponses(questionIds).unwrap();
                        console.log('Fetched all answers:', responses);

                        const newAnswers = {};
                        if (Array.isArray(responses)) {
                            responses.forEach(response => {
                                if (response && response.question_id) {
                                    newAnswers[response.question_id] = response;
                                }
                            });
                        } else if (responses && typeof responses === 'object') {
                            Object.entries(responses).forEach(([questionId, response]) => {
                                if (response) {
                                    newAnswers[questionId] = response;
                                }
                            });
                        }
                        setAnswers(prev => ({ ...prev, ...newAnswers }));
                    } catch (err) {
                        console.error('Error fetching answers:', err);
                    }
                }
            }
        };

        fetchAllAnswers();
    }, [submodules]); // Only depend on submodules, so it runs once when submodules are loaded

    const [openCategories, setOpenCategories] = useState({});
    useEffect(() => {
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

    const [editModalQuestionId, setEditModalQuestionId] = useState(null);
    const [editModalTableQuestion, setEditModalTableQuestion] = useState(null); const [answers, setAnswers] = useState({});
    const [aiChatOpen, setAiChatOpen] = useState(false);
    const [chatbotInitialMode, setChatbotInitialMode] = useState("general");
    const [showMobileProgress, setShowMobileProgress] = useState(false);

    useEffect(() => {
        console.log('aiChatOpen state changed:', aiChatOpen);
    }, [aiChatOpen]);

    const handleAIClick = (question) => {
        // Get current answer for this question from state
        const currentAnswer = answers[question.question_id] || {};

        // Get question metadata when AI is clicked
        const metadata = {
            question_text: question.question,
            has_string_value: question.has_string_value,
            has_decimal_value: question.has_decimal_value,
            has_boolean_value: question.has_boolean_value,
            has_link: question.has_link,
            has_note: question.has_note,
            string_value_required: question.string_value_required,
            decimal_value_required: question.decimal_value_required,
            boolean_value_required: question.boolean_value_required,
            link_required: question.link_required,
            note_required: question.note_required,
            type: question.type
        };

        // Store the current question data
        const questionData = {
            metadata,
            currentAnswer: {
                string_value: currentAnswer.string_value,
                decimal_value: currentAnswer.decimal_value,
                bool_value: currentAnswer.bool_value,
                link: currentAnswer.link,
                note: currentAnswer.note,
                table: currentAnswer.table
            },
            timestamp: new Date().toISOString(),
            editCount: 1
        };

        // Store in localStorage
        try {
            const storedQuestions = JSON.parse(localStorage.getItem('questionData') || '{}');
            storedQuestions[question.question_id] = questionData;
            localStorage.setItem('questionData', JSON.stringify(storedQuestions));
            console.log('Stored question data:', questionData);
        } catch (error) {
            console.error('Error storing question data:', error);
        }

        setChatbotInitialMode("question");
        setAiChatOpen(true);
    };
    const [submitAnswer] = useSubmitQuestionAnswerMutation();

    const handleEditClick = (question) => {
        // Get current answer for this question from state
        const currentAnswer = answers[question.question_id] || {};

        // Update state for modal
        if (question.type === 'table') {
            setEditModalTableQuestion(question);
        } else {
            setEditModalQuestionId(question.question_id);
        }
    }; const handleEditClose = () => {
        setEditModalQuestionId(null);
        setEditModalTableQuestion(null);
    }; const handleEditSuccess = (questionId, result) => {
        // Update stored question data with the new answer while preserving history
        const storedQuestions = JSON.parse(localStorage.getItem('questionData') || '{}');
        if (storedQuestions[questionId]) {
            const currentTimestamp = new Date().toISOString();

            // Store previous answer in history
            const history = storedQuestions[questionId].history || [];
            history.push({
                previousAnswer: storedQuestions[questionId].currentAnswer,
                timestamp: storedQuestions[questionId].timestamp,
                editCount: storedQuestions[questionId].editCount
            });

            storedQuestions[questionId] = {
                ...storedQuestions[questionId],
                currentAnswer: result,
                previousAnswer: storedQuestions[questionId].currentAnswer, // Keep immediate previous answer
                lastUpdated: currentTimestamp,
                history: history.slice(-5) // Keep last 5 changes
            };

            localStorage.setItem('questionData', JSON.stringify(storedQuestions));
            console.log('Updated question data after submit:', storedQuestions[questionId]);
        }

        // Update answers state
        setAnswers(prev => ({
            ...prev,
            [questionId]: result
        }));

        handleEditClose();
    };

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
                    <div key={category.id} className="bg-white rounded-[6px] shadow-sm p-0 border border-gray-200 transition-all duration-300 hover:shadow-md">
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between text-base md:text-lg font-semibold mb-1 text-[#000D30] hover:text-[#20305D] transition-colors focus:outline-none rounded-[6px] px-6 py-1 pt-1 h-[36px]"
                            style={{ borderBottom: openCategories[category.id] ? '1px solid #e5e7eb' : 'none' }}
                        >
                            <span className="flex items-center pl-[8px] h-full">{category.category_name || 'Unnamed Category'}</span>
                            <span className={`transition-transform duration-300 ${openCategories[category.id] ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" fill="none" stroke="#20305D" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                            </span>
                        </button>
                        {openCategories[category.id] && (
                            <div className="flex flex-col gap-2 px-0.5 m-4 mt-2">
                                {Array.isArray(category.questions) && category.questions.length > 0 ? (
                                    category.questions.map((question) => {
                                        const answer = answers[question.question_id];

                                        return (<div key={question.question_id} className="flex flex-col relative bg-white rounded-[4px] shadow border border-gray-100 p-2 mt-2 mb-0.5 transition-all duration-300 hover:shadow-md group min-h-[30px]">
                                            <div className="flex flex-row flex-nowrap items-start justify-between gap-2 pr-[60px] relative">
                                                <div className="flex-1 min-w-0 max-w-[95%] break-words text-[13px] md:text-[14px] font-medium text-[#1A2341] leading-tight transition-all duration-300 self-start pl-2 font-roboto mb-2">
                                                    {question.question}
                                                </div>
                                                <div className="absolute right-2 top-0 flex gap-2">
                                                    <button
                                                        className="bg-[#4F46E5] text-white font-medium px-2 min-w-[32px] min-h-[20px] rounded-[4px] text-[11px] shadow-sm focus:outline-none transition-all duration-200 hover:bg-[#4338CA] flex items-center gap-1"
                                                        onClick={() => handleAIClick(question)}
                                                        aria-label="AI Assist"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        AI
                                                    </button>
                                                    <button
                                                        className="bg-[#002A85] text-white font-medium px-2 min-w-[32px] min-h-[20px] rounded-[4px] text-[11px] shadow-sm focus:outline-none transition-all duration-200 hover:bg-[#0A2E87]"
                                                        onClick={() => handleEditClick(question)}
                                                        aria-label="Edit"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 pl-2 relative">                                    {question.type === 'table' ? (
                                                (() => {
                                                    // Transform metadata first
                                                    const transformedMeta = transformTableMetadata(question);
                                                    // Remove duplicate S No. columns (flexible match)
                                                    let columns = transformedMeta.columns.filter((col, idx, arr) => {
                                                        const isSNo = col.col_id.toLowerCase().replace(/\s/g, '').includes('sno') || col.label.toLowerCase().replace(/\s/g, '').includes('sno');
                                                        // Keep only the first occurrence
                                                        if (!isSNo) return true;
                                                        return arr.findIndex(c => (c.col_id.toLowerCase().replace(/\s/g, '').includes('sno') || c.label.toLowerCase().replace(/\s/g, '').includes('sno'))) === idx;
                                                    });
                                                    // Ensure 'S No.' is always the first column
                                                    if (!columns.length || !(columns[0].col_id.toLowerCase().replace(/\s/g, '').includes('sno') || columns[0].label.toLowerCase().replace(/\s/g, '').includes('sno'))) {
                                                        columns = [
                                                            { col_id: 's_no', label: 'S No.' },
                                                            ...columns
                                                        ];
                                                    }
                                                    // Ensure '% turnover of the entity' column is present (flexible match)
                                                    let turnoverCol = columns.find(col => col.col_id.toLowerCase().includes('turnover'));
                                                    if (!turnoverCol) {
                                                        columns.push({ col_id: 'percent_turnover_of_the_entity', label: '% turnover of the entity' });
                                                    }
                                                    // Create response object using the transformed metadata's IDs
                                                    const response = {
                                                        columns,
                                                        rows: transformedMeta.rows.map((row, idx) => {
                                                            return {
                                                                row_id: row.row_id,
                                                                label: row.label,
                                                                cells: columns.map(col => {
                                                                    if (col.col_id === 's_no' || col.label.toLowerCase().includes('s no')) {
                                                                        return { col_id: col.col_id, value: (idx + 1).toString() };
                                                                    }
                                                                    // Flexible match for turnover column
                                                                    const isTurnover = col.col_id.toLowerCase().includes('turnover') || col.label.toLowerCase().includes('turnover');
                                                                    let tableArray = Array.isArray(answer?.table) ? answer.table : [];
                                                                    let cell = tableArray.find(cell => {
                                                                        const rowMatch = cell.row === row.row_id || cell.row === `activity_${idx + 1}`;
                                                                        if (isTurnover) {
                                                                            return rowMatch && (cell.col.toLowerCase().includes('turnover') || cell.col === col.col_id);
                                                                        }
                                                                        return rowMatch && (cell.col === col.col_id || cell.col.toLowerCase() === col.col_id.toLowerCase());
                                                                    });
                                                                    return {
                                                                        col_id: col.col_id,
                                                                        value: cell?.value ?? ''
                                                                    };
                                                                })
                                                            };
                                                        })
                                                    };
                                                    return (
                                                        <TableQuestionRenderer
                                                            meta={{ ...transformedMeta, columns }}
                                                            response={response}
                                                            editable={false}
                                                        />
                                                    );
                                                })()
                                            ) : answer ? (
                                                <div className="space-y-2">
                                                    <div className="flex flex-row gap-4 items-start">
                                                        {answer.bool_value !== undefined && (
                                                            <div className={`text-[13px] font-medium break-words min-w-[30px] ${answer.bool_value ? 'text-green-600' : 'text-red-600'}`}>
                                                                {answer.bool_value ? "Yes" : "No"}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 flex flex-row gap-4 items-start overflow-hidden">
                                                            {answer.string_value && (
                                                                <div className="text-[13px] text-gray-600 break-words flex-1 ">
                                                                    <span className="line-clamp-3">{answer.string_value}</span>
                                                                    {answer.string_value.split(' ').length > 50 && (
                                                                        <button className="text-blue-600 hover:underline text-[11px] mt-1">Show more...</button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {answer.decimal_value !== undefined && (
                                                                <div className="text-[13px] text-gray-600 whitespace-nowrap pr-42">
                                                                    <span className="font-medium">Value:</span> {answer.decimal_value}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {answer.note && (
                                                        <div className="text-[10px] text-gray-600 pr-[60px] break-words italic">
                                                            <span className="font-medium not-italic"></span> {answer.note}
                                                        </div>
                                                    )}
                                                    {answer.link && (
                                                        <div className="text-[13px] absolute bottom-0 right-2 pr-36">
                                                            <a href={answer.link} target="_blank" rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline">
                                                                View Document
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-[13px] text-gray-600">
                                                    No response provided yet
                                                </div>
                                            )}
                                            </div>                                                {editModalQuestionId === question.question_id && question.type !== 'table' && (
                                                <QuestionEditPopup
                                                    question={question}
                                                    initialAnswer={answer}
                                                    onClose={handleEditClose}
                                                    onSuccess={handleEditSuccess}
                                                    moduleId={moduleId}
                                                />
                                            )}
                                            {editModalTableQuestion && editModalTableQuestion.question_id === question.question_id && question.type === 'table' && (
                                                <QuestionEditPopup
                                                    question={question}
                                                    initialAnswer={(() => {
                                                        // Prefill table: create empty structure, then fill with current values
                                                        const meta = transformTableMetadata(question);
                                                        // Remove duplicate S No. columns (flexible match)
                                                        let columns = meta.columns.filter((col, idx, arr) => {
                                                            const isSNo = col.col_id.toLowerCase().replace(/\s/g, '').includes('sno') || col.label.toLowerCase().replace(/\s/g, '').includes('sno');
                                                            // Keep only the first occurrence
                                                            if (!isSNo) return true;
                                                            return arr.findIndex(c => (c.col_id.toLowerCase().replace(/\s/g, '').includes('sno') || c.label.toLowerCase().replace(/\s/g, '').includes('sno'))) === idx;
                                                        });
                                                        // Ensure 'S No.' is always the first column
                                                        if (!columns.length || !(columns[0].col_id.toLowerCase().replace(/\s/g, '').includes('sno') || columns[0].label.toLowerCase().replace(/\s/g, '').includes('sno'))) {
                                                            columns = [
                                                                { col_id: 's_no', label: 'S No.' },
                                                                ...columns
                                                            ];
                                                        }
                                                        // Ensure '% turnover of the entity' column is present (flexible match)
                                                        let turnoverCol = columns.find(col => col.col_id.toLowerCase().includes('turnover'));
                                                        if (!turnoverCol) {
                                                            columns.push({ col_id: 'percent_turnover_of_the_entity', label: '% turnover of the entity' });
                                                        }
                                                        const emptyTable = createEmptyTableResponse({ ...meta, columns });
                                                        const currentTable = answer?.table || [];
                                                        // Fill values from currentTable (flat array) into emptyTable (structured)
                                                        const filledRows = emptyTable.rows.map((row, idx) => ({
                                                            ...row,
                                                            cells: row.cells.map(cell => {
                                                                if (cell.col_id === 's_no' || cell.label?.toLowerCase().includes('s no')) {
                                                                    return { ...cell, value: (idx + 1).toString() };
                                                                }
                                                                // Flexible match for turnover column
                                                                const isTurnover = cell.col_id.toLowerCase().includes('turnover') || cell.label?.toLowerCase().includes('turnover');
                                                                let tableArray = Array.isArray(currentTable) ? currentTable : [];
                                                                let found = tableArray.find(c => {
                                                                    const rowMatch = c.row === row.row_id || c.row === row.label || c.row === `activity_${meta.rows.findIndex(r => r.row_id === row.row_id) + 1}`;
                                                                    if (isTurnover) {
                                                                        return rowMatch && (c.col.toLowerCase().includes('turnover') || c.col === cell.col_id);
                                                                    }
                                                                    return rowMatch && (c.col === cell.col_id || c.col.toLowerCase() === cell.col_id.toLowerCase());
                                                                });
                                                                return found ? { ...cell, value: found.value } : cell;
                                                            })
                                                        }));
                                                        return { ...answer, table: { columns, rows: filledRows } };
                                                    })()}
                                                    onClose={handleEditClose}
                                                    onSuccess={handleEditSuccess}
                                                    moduleId={moduleId}
                                                />
                                            )}
                                        </div>
                                        );
                                    })
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
        <AppProvider>
            <Layout>
                <div className="relative flex w-full h-screen scrollbar-none ">
                    <section className=" flex-1 flex flex-col min-w-0 max-w-[70vw] mx-auto bg-transparent px-[2vw] pt-0 pb-0 overflow-y-auto mr-[20vw]">
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
                    <aside className="hidden lg:flex flex-col mt-[11vh] mr-[30px] gap-[1.2vh] px-[0.7vw] pt-[1.2vh] pb-[1.2vh] bg-white border-l border-gray-200 shadow-lg min-w-[16vw] max-w-[18vw] w-full fixed right-4 top-0 h-[82vh] z-20 items-center justify-start rounded-[4px] transition-all duration-500 overflow-y-auto">
                        {/* Overall Progress Circle */}                        <div className="flex flex-col items-center mb-[0.7vh]">
                            <div className="font-semibold text-[13px] mb-[1vh] text-[#000D30]">Module Progress</div>
                            {submodules.length > 0 && (
                                <>
                                    {(() => {
                                        // Overall Module Progress
                                        const questionTracker = new Set(); // Track unique question IDs

                                        // Count total questions from submodules structure
                                        const totalQuestions = submodules.reduce((total, sub) =>
                                            total + (sub.question_categories?.reduce((catTotal, cat) =>
                                                catTotal + (cat.questions?.length || 0), 0) || 0), 0);

                                        // Count answered questions by tracking unique question IDs from submodules
                                        const totalAnswered = submodules.reduce((moduleTotal, sub) =>
                                            moduleTotal + (sub.question_categories?.reduce((catTotal, cat) =>
                                                catTotal + (cat.questions?.filter(q => {
                                                    // Only count each question once
                                                    if (questionTracker.has(q.question_id)) {
                                                        return false;
                                                    }
                                                    const hasAnswer = answers[q.question_id] && (
                                                        answers[q.question_id].string_value !== undefined ||
                                                        answers[q.question_id].bool_value !== undefined ||
                                                        answers[q.question_id]?.decimal_value !== undefined ||
                                                        (answers[q.question_id].response && answers[q.question_id].response.table)
                                                    );
                                                    if (hasAnswer) {
                                                        questionTracker.add(q.question_id);
                                                    }
                                                    return hasAnswer;
                                                }).length || 0), 0) || 0), 0);

                                        console.log('Detailed Progress Stats:', {
                                            totalAnsweredQuestions: totalAnswered,
                                            totalQuestions: totalQuestions,
                                            uniqueQuestionIds: Array.from(questionTracker),
                                            answerDetails: Object.entries(answers).map(([key, val]) => ({
                                                questionId: key,
                                                hasStringValue: !!val?.string_value,
                                                hasBoolValue: val?.bool_value !== undefined,
                                                hasDecimalValue: val?.decimal_value !== undefined,
                                                hasTableResponse: !!(val?.response?.table)
                                            }))
                                        });

                                        return (
                                            <>
                                                <svg width="6vw" height="6vw" viewBox="0 0 120 120">
                                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                                                    <circle
                                                        cx="60"
                                                        cy="60"
                                                        r="50"
                                                        fill="none"
                                                        stroke="#4F46E5"
                                                        strokeWidth="8"
                                                        strokeDasharray="314"
                                                        strokeDashoffset={314 * (1 - (totalAnswered / totalQuestions))}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="mt-[0.7vh] text-gray-700 font-semibold text-[11px]">
                                                    {totalAnswered} of {totalQuestions} questions completed
                                                </div>
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </div>

                        {/* Submodules Progress */}
                        <div className="bg-[#F8FAFC] rounded-[4px] shadow p-[0.7vw] border border-gray-100 w-full flex flex-col gap-[0.7vh]">
                            <div className="font-semibold text-[11px] mb-[0.3vh] text-[#000D30]">Submodules Progress</div>
                            <div className="flex flex-col gap-[0.3vh]">
                                {submodules.map((submodule, index) => {
                                    const questionTracker = new Set(); // Track unique question IDs for this submodule

                                    const totalQuestions = submodule.question_categories?.reduce(
                                        (total, cat) => total + (cat.questions?.length || 0),
                                        0
                                    ) || 0;

                                    const answeredQuestions = submodule.question_categories?.reduce((total, cat) => {
                                        const categoryAnswered = cat.questions?.filter(q => {
                                            if (questionTracker.has(q.question_id)) {
                                                return false;
                                            } const hasAnswer = answers[q.question_id] && (
                                                answers[q.question_id].string_value !== undefined ||
                                                answers[q.question_id].bool_value !== undefined ||
                                                answers[q.question_id]?.decimal_value !== undefined ||
                                                (answers[q.question_id].response && answers[q.question_id].response.table)
                                            );
                                            if (hasAnswer) {
                                                questionTracker.add(q.question_id);
                                            }
                                            return hasAnswer;
                                        }).length || 0;
                                        return total + categoryAnswered;
                                    }, 0) || 0;

                                    const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

                                    console.log(`Submodule ${submodule.submodule_name} Progress:`, {
                                        totalQuestions,
                                        answeredQuestions,
                                        completionPercentage,
                                        uniqueQuestionIds: Array.from(questionTracker),
                                        categories: submodule.question_categories?.map(cat => ({
                                            categoryName: cat.category_name,
                                            totalQuestions: cat.questions?.length || 0,
                                            answeredQuestions: cat.questions?.filter(q => !questionTracker.has(q.question_id) && answers[q.question_id] && (
                                                answers[q.question_id].string_value !== undefined || answers[q.question_id].bool_value !== undefined ||
                                                answers[q.question_id]?.decimal_value !== undefined ||
                                                (answers[q.question_id].response && answers[q.question_id].response.table)
                                            )).length || 0
                                        }))
                                    });

                                    return (
                                        <div key={submodule.submodule_id}>
                                            <div className="text-[11px] font-medium text-[#000D30] mb-0.5">{submodule.submodule_name}</div>
                                            <div className="w-full h-1 bg-gray-200 rounded-full mb-0.5">
                                                <div
                                                    className="h-1 bg-[#4F46E5] rounded-full transition-all duration-700"
                                                    style={{ width: `${completionPercentage}%` }}
                                                />
                                            </div>
                                            <div className="text-[9px] text-gray-500">{answeredQuestions} of {totalQuestions} completed</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Category Overview for Current Submodule */}
                        {currentSubmodule && (
                            <div className="bg-[#F8FAFC] rounded-[4px] shadow p-[0.7vw] border border-gray-100 w-full flex flex-col gap-[0.3vh]">
                                <div className="font-semibold text-[11px] mb-[0.3vh] text-[#000D30]">Category Overview</div>
                                <div className="flex flex-col gap-[0.15vh]">                                    {currentSubmodule.question_categories?.map((category, idx) => {
                                    const totalQuestions = category.questions?.length || 0;
                                    const answeredQuestions = category.questions?.filter(q => answers[q.question_id])?.length || 0;
                                    const categoryName = category.category_name || 'Unnamed Category';
                                    const truncatedName = categoryName.length > 15
                                        ? categoryName.substring(0, 15) + '...'
                                        : categoryName;

                                    // Use category.id if available, otherwise fallback to a stable string key
                                    const key = category.id || `category-${categoryName.replace(/\s+/g, '-')}-${idx}`;
                                    return (
                                        <div key={key} className="flex justify-between text-[10px]">
                                            <span
                                                className="hover:cursor-help truncate max-w-[120px]"
                                                title={categoryName}
                                            >
                                                {truncatedName}
                                            </span>
                                            <span>{answeredQuestions}/{totalQuestions} questions</span>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        )}
                    </aside>
                    <button
                        className="fixed z-[120] bottom-[3vh] right-[3vw] w-[6vw] h-[6vw] min-w-[48px] min-h-[48px] max-w-[80px] max-h-[80px] rounded-full bg-gradient-to-br from-[#0A2E87] to-[#4F46E5] shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white focus:outline-none "
                        style={{ boxShadow: '0 8px 32px 0 rgba(10,46,135,0.25)' }}
                        onClick={() => setAiChatOpen(true)}
                        aria-label="Open AI Assistant Chat"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

  <rect x="4" y="6" width="16" height="12" rx="2"/>

  <line x1="12" y1="6" x2="12" y2="3"/>
  <circle cx="12" cy="3" r="1"/>

  <circle cx="9" cy="10" r="1"/>
  <circle cx="15" cy="10" r="1"/>
  
  <path d="M8 14h8"/>
</svg>
                    </button>
                    {aiChatOpen && (
                        <div className="fixed inset-0 z-[1000] flex items-end justify-end bg-opacity-50 transition-opacity duration-300">
                            <div className="w-full h-full absolute top-0 left-0" onClick={() => setAiChatOpen(false)} />
                            <div className="relative z-10 w-full max-w-md m-4 md:m-8 animate-slide-up">
                                <div className="bg-white rounded-lg shadow-2xl p-0 overflow-hidden border border-gray-200">
                                    <ChatbotWindow
                                        onClose={() => setAiChatOpen(false)}
                                        initialMode={chatbotInitialMode}
                                    />
                                </div>                            </div>
                        </div>
                    )}

                    {/* Mobile Progress Button */}
                    <button
                        onClick={() => setShowMobileProgress(true)}
                        className="fixed z-[120] bottom-[20vh] right-[3vw] w-[6vw] h-[6vw] min-w-[48px] min-h-[48px] max-w-[80px] max-h-[80px] rounded-full bg-gradient-to-br from-[#4F46E5] to-[#0A2E87] shadow-xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white focus:outline-none lg:hidden"
                        style={{ boxShadow: '0 8px 32px 0 rgba(79,70,229,0.25)' }}
                    >
                        <BarChart3 className="w-6 h-6 text-white" />
                    </button>                    {/* Mobile Progress Modal */}
                    {showMobileProgress && (
                        <div className="fixed inset-0 z-[1000] flex items-end justify-end bg-opacity-50 transition-opacity duration-300 lg:hidden">
                            <div className="w-full h-full absolute top-0 left-0" onClick={() => setShowMobileProgress(false)} />
                            <div className="relative z-10 w-full max-w-md m-4 md:m-8 animate-slide-up" style={{ marginBottom: 'calc(20vh + 80px)' }}>
                                <div className="bg-white rounded-lg shadow-2xl p-4 overflow-hidden border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold text-[#000D30]">Progress Overview</h2>
                                        <button
                                            onClick={() => setShowMobileProgress(false)}
                                            className="p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* Progress Content */}
                                    <div className="flex flex-col gap-4">
                                        {/* Module Progress */}
                                        <div className="flex flex-col items-center">
                                            <div className="font-semibold text-[13px] mb-[1vh] text-[#000D30]">Module Progress</div>
                                            {submodules.length > 0 && (
                                                <>
                                                    <svg width="80" height="80" viewBox="0 0 120 120">
                                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                                                        <circle
                                                            cx="60" cy="60" r="50" fill="none"
                                                            stroke="#4F46E5" strokeWidth="8" strokeDasharray="314"
                                                            strokeDashoffset={314 * (1 - (Object.values(answers).filter(a => a !== null && a !== undefined).length) / submodules.reduce((total, sub) =>
                                                                total + (sub.question_categories?.reduce((catTotal, cat) =>
                                                                    catTotal + (cat.questions?.length || 0), 0) || 0), 0))}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="mt-2 text-gray-700 font-semibold text-sm">
                                                        {Object.values(answers).filter(a => a !== null && a !== undefined).length} of {submodules.reduce((total, sub) =>
                                                            total + (sub.question_categories?.reduce((catTotal, cat) =>
                                                                catTotal + (cat.questions?.length || 0), 0) || 0), 0)} questions completed
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Submodules Progress */}
                                        <div className="bg-[#F8FAFC] rounded-lg p-3 border border-gray-100">
                                            <div className="font-semibold text-sm mb-2 text-[#000D30]">Submodules Progress</div>
                                            <div className="flex flex-col gap-2">
                                                {submodules.map(submodule => {
                                                    const totalQuestions = submodule.question_categories?.reduce((total, cat) =>
                                                        total + (cat.questions?.length || 0), 0) || 0;
                                                    const answeredQuestions = submodule.question_categories?.reduce((total, cat) =>
                                                        total + (cat.questions?.filter(q => answers[q.question_id])?.length || 0), 0) || 0;
                                                    const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

                                                    return (
                                                        <div key={submodule.submodule_id} className="mb-2">
                                                            <div className="text-sm font-medium text-[#000D30] mb-1">{submodule.submodule_name}</div>
                                                            <div className="w-full h-2 bg-gray-200 rounded-full">
                                                                <div
                                                                    className="h-2 bg-[#4F46E5] rounded-full transition-all duration-700"
                                                                    style={{ width: `${completionPercentage}%` }}
                                                                />
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">{answeredQuestions} of {totalQuestions} completed</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </AppProvider>
    );
};

export default DynamicEntityDetails;