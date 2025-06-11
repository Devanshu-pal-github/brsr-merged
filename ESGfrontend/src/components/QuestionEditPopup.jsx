import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    useSubmitQuestionAnswerMutation,
    useStoreQuestionDataMutation,
    useGenerateTextMutation,
} from "../api/apiSlice";
import { useInactivityDetector } from "./QuestionEdit/useInactivityDetector";
import ModalHeader from "../components/QuestionEdit/ModalHeader";
import FormFields from "../components/QuestionEdit/FormFields";
import {
    LeftAIActions,
    RightAIActionsContent,
} from "../components/QuestionEdit/AIActions";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { transformTableMetadata, createEmptyTableResponse } from "./tableUtils";
import TableQuestionRenderer from "./TableQuestionRenderer";
import toast from "react-hot-toast";

const QuestionEditPopup = ({
    question,
    initialAnswer,
    onClose,
    onSuccess,
    moduleId,
}) => {


    console.log( "question", question);
    console.log( "initialAnswer", initialAnswer);
    const [formData, setFormData] = useState({
        string_value: initialAnswer?.string_value || "",
        decimal_value: initialAnswer?.decimal_value || "",
        boolean_value: initialAnswer?.boolean_value || false,
        link: initialAnswer?.link || "",
        note: initialAnswer?.note || "",
    });
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [submitAnswer] = useSubmitQuestionAnswerMutation();
    const [storeQuestionData] = useStoreQuestionDataMutation();

    // Table editing state for table questions
    const [currentValue, setCurrentValue] = useState(() => {
        if (question.type === "table") {
            const meta = transformTableMetadata(question);
            
            // If we have initial answer data
            if (initialAnswer?.table) {
                // Ensure the structure matches our requirements
                const formattedTable = {
                    columns: meta.columns,
                    rows: meta.rows.map((row, idx) => ({
                        row_id: row.row_id,
                        cells: meta.columns.map(col => {
                            // Try to find existing value
                            const existingCell = initialAnswer.table.rows?.[idx]?.cells?.find(cell => {
                                const normalizeId = (id) => id?.toLowerCase().replace(/[^a-z0-9]/g, '');
                                const normalizedColId = normalizeId(cell.col_id);
                                const normalizedTargetColId = normalizeId(col.col_id);
                                return normalizedColId === normalizedTargetColId;
                            });

                            return {
                                row_id: row.row_id,
                                col_id: col.col_id,
                                value: existingCell?.value ?? null,
                                calc: col.calc || false
                            };
                        })
                    }))
                };
                return {
                    table: formattedTable
                };
            }
            
            // Otherwise create empty response
            return {
                table: createEmptyTableResponse(meta)
            };
        }
        return {};
    });

    useEffect(() => {
        if (question.type === "table") {
            const meta = transformTableMetadata(question);
            
            // If we have initial answer data
            if (initialAnswer?.table) {
                // Ensure the structure matches our requirements
                const formattedTable = {
                    columns: meta.columns,
                    rows: meta.rows.map((row, idx) => ({
                        row_id: row.row_id,
                        cells: meta.columns.map(col => {
                            // Try to find existing value
                            const existingCell = initialAnswer.table.rows?.[idx]?.cells?.find(cell => {
                                const normalizeId = (id) => id?.toLowerCase().replace(/[^a-z0-9]/g, '');
                                const normalizedColId = normalizeId(cell.col_id);
                                const normalizedTargetColId = normalizeId(col.col_id);
                                return normalizedColId === normalizedTargetColId;
                            });

                            return {
                                row_id: row.row_id,
                                col_id: col.col_id,
                                value: existingCell?.value ?? null,
                                calc: col.calc || false
                            };
                        })
                    }))
                };
                setCurrentValue({
                    table: formattedTable
                });
            } else {
                setCurrentValue({
                    table: createEmptyTableResponse(meta)
                });
            }
        }
    }, [initialAnswer, question]);

    const [generateText] = useGenerateTextMutation();
    const [isLoading, setIsLoading] = useState({ left: false, right: false });
    const [error, setError] = useState(null);
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    const [selectedTextInTextarea, setSelectedTextInTextarea] = useState(null);
    const [aiMessage, setAiMessage] = useState(null);
    const [leftAiMessage, setLeftAiMessage] = useState(null);
    const [refineTone, setRefineTone] = useState("concise");
    const textareaRef = useRef(null);
    const leftPanelRef = useRef(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (initialAnswer) {
            setFormData({
                string_value: initialAnswer?.string_value || "",
                decimal_value: initialAnswer?.decimal_value || "",
                boolean_value: initialAnswer?.boolean_value || false,
                link: initialAnswer?.link || "",
                note: initialAnswer?.note || "",
            });
        }
    }, [initialAnswer]);

    useInactivityDetector({
        timeouts: [300000],
        onTimeout: () => {
            setAiMessage(null);
            setLeftAiMessage(null);
            setError(null);
            setIsLoading({ left: false, right: false });
        },
    });

    const handleInputChange = (e, fieldType) => {
        const { name, value, type, checked } = e.target;
        let isValid = true;
        let errorMessage = "";
        if (fieldType === "string") {
            if (question.string_value_required && !value.trim()) {
                isValid = false;
                errorMessage = "This field is required.";
            }
        } else if (fieldType === "decimal") {
            if (isNaN(value) || value === "") {
                isValid = false;
                errorMessage = "Please enter a valid number.";
            }
        } else if (fieldType === "link") {
            const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
            if (value && !urlRegex.test(value)) {
                isValid = false;
                errorMessage = "Please enter a valid URL.";
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: isValid ? "" : errorMessage }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaveLoading(true);
        setError(null);
        try {
            if (question.type === "table") {
                const response = {
                    question_id: question.question_id,
                    type: "table",
                    response: {
                        table: currentValue.table,
                        meta_version: question.table_metadata?.version,
                    },
                };
                await onSuccess?.(question.question_id, response.response);
                toast.success("Question updated successfully!");
                setTimeout(() => {
                    onClose();
                }, 1500);
                return;
            }

            const hasErrors = Object.values(errors).some((error) => error);
            const requiredFields = [];

            if (question.string_value_required && !formData.string_value)
                requiredFields.push("String value is required.");
            if (question.decimal_value_required && !formData.decimal_value)
                requiredFields.push("Decimal value is required.");
            if (question.boolean_value_required && formData.boolean_value === undefined)
                requiredFields.push("Boolean value is required.");
            if (question.link_required && !formData.link)
                requiredFields.push("Link is required.");
            if (question.note_required && !formData.note)
                requiredFields.push("Note is required.");

            if (hasErrors || requiredFields.length > 0) {
                setErrors((prev) => ({ ...prev, form: requiredFields.join(" ") }));
                setIsSaveLoading(false);
                return;
            }

            const response = {
                question_id: question.question_id,
                response: {
                    string_value: question.has_string_value
                        ? formData.string_value || null
                        : undefined,
                    decimal_value: question.has_decimal_value
                        ? formData.decimal_value
                            ? Number(formData.decimal_value)
                            : null
                        : undefined,
                    bool_value: question.has_boolean_value
                        ? formData.boolean_value || null
                        : undefined,
                    link: question.has_link ? formData.link || null : undefined,
                    note: question.has_note ? formData.note || null : undefined,
                },
            };

            Object.keys(response.response).forEach(
                (key) =>
                    response.response[key] === undefined && delete response.response[key]
            );

            const result = await submitAnswer({
                questionId: question.question_id,
                answerData: response.response,
            }).unwrap();

            await storeQuestionData({
                moduleId,
                questionId: question.question_id,
                metadata: {
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
                },
                answer: response.response,
            });

            toast.success("Question updated successfully!");
            await onSuccess?.(question.question_id, response.response);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                form: "Failed to submit answer. Please try again.",
            }));
        } finally {
            setIsSaveLoading(false);
        }
    };

    const handleTableCellChange = (rowId, colId, value) => {
        const updatedTable = {
            ...currentValue.table,
            rows: currentValue.table.rows.map((row) => {
                if (row.row_id === rowId) {
                    return {
                        ...row,
                        cells: row.cells.map((cell) =>
                            cell.col_id === colId ? { ...cell, value } : cell
                        ),
                    };
                }
                return row;
            }),
        };
        setCurrentValue({
            ...currentValue,
            table: updatedTable,
        });
    };

    const sharedAIActionsProps = {
        formData,
        setFormData,
        question,
        moduleId,
        selectedTextInTextarea,
        setSelectedTextInTextarea,
        generateText,
        isLoading,
        setIsLoading,
        error,
        setError,
        setErrors,
        aiMessage,
        setAiMessage,
        leftAiMessage,
        setLeftAiMessage,
        refineTone,
        setRefineTone,
    };

    // Table rendering logic extracted for clarity
    const renderTable = () => {
        if (question.type !== "table") return null;
        const meta = transformTableMetadata(question);
        
        // Get current table data, preserving existing values
        const currentTable = currentValue?.table || createEmptyTableResponse(meta);
        
        // Map the table data while preserving existing values
        const tableWithSNo = {
            columns: meta.columns,
            rows: currentTable.rows.map((row, idx) => ({
                row_id: row.row_id,
                cells: meta.columns.map(col => {
                    // Find existing cell value
                    const existingCell = row.cells?.find(cell => {
                        const normalizeId = (id) => id?.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const normalizedColId = normalizeId(cell.col_id);
                        const normalizedTargetColId = normalizeId(col.col_id);
                        return normalizedColId === normalizedTargetColId;
                    });

                    return existingCell ? 
                        { ...existingCell, col_id: col.col_id } : 
                        { col_id: col.col_id, value: null };
                }),
            }))
        };

        return (
            <div className="mb-4">
                <TableQuestionRenderer
                    meta={meta}
                    response={tableWithSNo}
                    editable={true}
                    onCellChange={(rowId, colId, value) => {
                        handleTableCellChange(rowId, colId, value);
                    }}
                />
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`question-${question.question_id}-title`}
        >
            <div className="relative">
                <motion.div
                    className={`bg-white rounded-2xl shadow-xl transition-all duration-700 ease-in-out flex flex-col overflow-hidden ${isAIAssistantOpen ? "w-[90vw] max-w-6xl" : "w-[70vw] max-w-4xl"} h-[75vh]`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: isVisible ? 1 : 0.95, opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <ModalHeader
                        questionId={question.question_id}
                        questionText={question.question}
                        closeModal={onClose}
                    />
                    <div className="flex flex-1 overflow-hidden">
                        <div
                            ref={leftPanelRef}
                            className="flex-1 flex flex-col overflow-y-auto px-6 py-4 border-r border-gray-200 bg-gray-50 scrollbar-none"
                        >
                            <div className="flex-1">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        {question.question}
                                    </h3>
                                    {question.guidance && (
                                        <div
                                            id={`question-${question.question_id}-guidance`}
                                            className="text-sm text-blue-600 mt-2 bg-blue-50 p-3 rounded-lg shadow-sm"
                                        >
                                            <svg
                                                className="w-4 h-4 mb-1 ml-1 inline-block"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13 16h-1v-4h-1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeSanitize]}
                                                className="inline-block"
                                            >
                                                {question.guidance}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                {renderTable()}
                                <FormFields
                                    question={question}
                                    formData={formData}
                                    errors={errors}
                                    handleInputChange={handleInputChange}
                                    setFormData={setFormData}
                                    isTextareaFocused={isTextareaFocused}
                                    setIsTextareaFocused={setIsTextareaFocused}
                                    setSelectedTextInTextarea={setSelectedTextInTextarea}
                                    textareaRef={textareaRef}
                                    leftAiMessage={leftAiMessage}
                                />
                            </div>
                            <div>
                                <LeftAIActions {...sharedAIActionsProps} />
                            </div>
                        </div>
                        <motion.div
                            className="overflow-hidden"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: isAIAssistantOpen ? "40%" : 0,
                                opacity: isAIAssistantOpen ? 1 : 0,
                                minWidth: isAIAssistantOpen ? "300px" : 0,
                            }}
                            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
                        >
                            {isAIAssistantOpen && (
                                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-4 bg-white h-full">
                                    <RightAIActionsContent {...sharedAIActionsProps} />
                                </div>
                            )}
                        </motion.div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-white">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                aria-label="Cancel changes"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaveLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSaveLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#000D30] hover:bg-[#001A4D]"}`}
                                aria-label="Save answer"
                            >
                                {isSaveLoading ? "Submitting..." : "Save Answer"}
                            </button>
                        </div>
                        {errors.form && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-[6px]">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">
                                        Please fix the following errors:
                                    </span>
                                </div>
                                <p className="text-red-600 text-xs mt-1">{errors.form}</p>
                            </div>
                        )}
                    </form>
                </motion.div>
                <button
                    onClick={() => setIsAIAssistantOpen((prev) => !prev)}
                    className="absolute top-1 right-[-40px] w-10 h-10 !rounded-full bg-white text-blue-700 hover:bg-gray-100 transition-colors duration-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] z-50 focus:outline-none focus:ring-1 focus:ring-[#1A2B5C] flex items-center justify-center"
                    aria-label={isAIAssistantOpen ? "Hide Mini AI Assistant" : "Show Mini AI Assistant"}
                    style={{
                        animation: 'spin-smooth 8s ease-in-out infinite',
                    }}
                >
                    <svg className="w-6 h-6 text-[#1A2B5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                    </svg>
                    <style jsx>{`
                        @keyframes spin-smooth {
                            0% { transform: rotate(0deg); }
                            15% { transform: rotate(260deg); }
                            30% { transform: rotate(180deg); }
                            50% { transform: rotate(180deg); }
                            65% { transform: rotate(440deg); }
                            80% { transform: rotate(360deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </button>
            </div>
        </div>
    );
};

export default QuestionEditPopup;