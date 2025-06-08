import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
    useSubmitQuestionAnswerMutation,
    useGenerateTextMutation,
    apiSlice,
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
import { Button } from "@mui/material";

const QuestionEditPopup = ({
    question,
    initialAnswer,
    onClose,
    onSuccess,
    moduleId,
}) => {
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
    const dispatch = useDispatch();

    const [currentValue, setCurrentValue] = useState(() => {
        if (question.type === "table") {
            const meta = transformTableMetadata(question);
            return {
                table: initialAnswer?.table || createEmptyTableResponse(meta),
            };
        }
        return {};
    });

    useEffect(() => {
        if (question.type === "table") {
            const meta = transformTableMetadata(question);
            setCurrentValue({
                table: initialAnswer?.table || createEmptyTableResponse(meta),
            });
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

    // Function to determine the new row label based on the previous row
    const getNewRowLabel = (existingRows, metaRows) => {
        // If there are no existing rows, determine the prefix from meta.rows
        if (existingRows.length === 0) {
            if (metaRows.length > 0) {
                const firstMetaRowLabel = metaRows[0].label || "Row 1";
                const match = firstMetaRowLabel.match(/^(\D+)(\d+)$/);
                if (match) {
                    const prefix = match[1].trim();
                    return `${prefix} 1`; // Start with the same prefix as the first row
                }
                // If the first row doesn't have a number, use it as the prefix
                return `${firstMetaRowLabel} 1`;
            }
            return "Row 1"; // Fallback if meta.rows is empty
        }

        // Get the last row's label from metaRows
        const lastRow = existingRows[existingRows.length - 1];
        const lastRowMeta = metaRows.find(r => r.row_id === lastRow.row_id);
        if (!lastRowMeta) {
            // If the last row isn't in metaRows, we might have an issue with metaRows not being updated
            // Fallback to constructing a label based on the last known pattern
            const previousRows = metaRows.filter(r => existingRows.some(er => er.row_id === r.row_id));
            const lastKnownLabel = previousRows.length > 0 ? previousRows[previousRows.length - 1].label : "Row 1";
            const match = lastKnownLabel.match(/^(\D+)(\d+)$/);
            if (match) {
                const prefix = match[1].trim();
                const number = parseInt(match[2], 10);
                return `${prefix} ${number + existingRows.length - previousRows.length + 1}`;
            }
            return `${lastKnownLabel} ${existingRows.length + 1}`;
        }

        const lastLabel = lastRowMeta.label;

        // Use a regex to split the label into prefix and number
        const match = lastLabel.match(/^(\D+)(\d+)$/);
        if (match) {
            const prefix = match[1].trim(); // e.g., "Action"
            const number = parseInt(match[2], 10); // e.g., 3
            return `${prefix} ${number + 1}`; // e.g., "Action 4"
        }

        // If the label doesn't match the "Prefix Number" format, append a number
        return `${lastLabel} ${existingRows.length + 1}`;
    };

    // Function to add a new row dynamically
    const handleAddRow = () => {
        const meta = transformTableMetadata(question);
        let columns = meta.columns
            .map(col => {
                const colIdLower = col.col_id.toLowerCase();
                let colType;
                if (colIdLower.includes("sno") || colIdLower.includes("s_no")) {
                    colType = "number";
                } else if (colIdLower.includes("boolean")) {
                    colType = "boolean";
                } else if (colIdLower.includes("number") || colIdLower.includes("percent") || colIdLower.includes("turnover")) {
                    colType = "number";
                } else if (question.has_string_value && question.has_decimal_value) {
                    colType = "mixed";
                } else if (question.has_string_value) {
                    colType = "string";
                } else if (question.has_decimal_value) {
                    colType = "number";
                } else {
                    colType = "string";
                }
                return { ...col, type: colType };
            })
            .filter((col, idx, arr) => {
                const isSNo =
                    col.col_id.toLowerCase().replace(/\s/g, "").includes("sno") ||
                    col.label.toLowerCase().replace(/\s/g, "").includes("sno");
                if (!isSNo) return true;
                return (
                    arr.findIndex(
                        (c) =>
                            c.col_id.toLowerCase().replace(/\s/g, "").includes("sno") ||
                            c.label.toLowerCase().replace(/\s/g, "").includes("sno")
                    ) === idx
                );
            });

        if (
            !columns.length ||
            !(
                columns[0].col_id.toLowerCase().replace(/\s/g, "").includes("sno") ||
                columns[0].label.toLowerCase().replace(/\s/g, "").includes("sno")
            )
        ) {
            columns = [{ col_id: "s_no", label: "S No.", type: "number" }, ...columns];
        }

        const newRowId = `row_${Date.now()}`; // Unique row ID
        const newRowLabel = getNewRowLabel(currentValue.table.rows, meta.rows);

        const newRow = {
            row_id: newRowId,
            cells: columns.map(col => ({
                col_id: col.col_id,
                value: col.col_id === "s_no" ? (currentValue.table.rows.length + 1).toString() : "",
                readOnly: col.col_id === "s_no",
            })),
        };

        setCurrentValue(prev => ({
            ...prev,
            table: {
                ...prev.table,
                rows: [...prev.table.rows, newRow],
            },
        }));

        // Update meta.rows with the new row's label
        meta.rows = [
            ...meta.rows,
            { row_id: newRowId, label: newRowLabel, calc: false }
        ];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaveLoading(true);
        setError(null);
        try {
            let response;
            if (question.type === "table") {
                const validatedTable = {
                    ...currentValue.table,
                    rows: currentValue.table.rows.map(row => ({
                        ...row,
                        cells: row.cells.map(cell => {
                            let value = cell.value;
                            if (value === null || value === undefined) {
                                if (cell.col_id === 's_no') {
                                    value = (currentValue.table.rows.indexOf(row) + 1).toString();
                                } else if (cell.col_id.includes('number_of_participants') || cell.col_id.includes('percent_turnover')) {
                                    value = '0';
                                } else {
                                    value = '';
                                }
                            }
                            return { ...cell, value };
                        }),
                    })),
                };
                response = {
                    question_id: question.question_id,
                    type: "table",
                    response: {
                        table: validatedTable,
                        meta_version: question.table_metadata?.version || null,
                        last_updated: new Date().toISOString(),
                        updated_by: localStorage.getItem('user_id') || 'unknown',
                    },
                };
            } else {
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
                    console.log("Validation errors:", requiredFields);
                    setErrors((prev) => ({ ...prev, form: requiredFields.join(" ") }));
                    setIsSaveLoading(false);
                    return;
                }

                response = {
                    question_id: question.question_id,
                    response: {
                        string_value: question.has_string_value ? formData.string_value || null : undefined,
                        decimal_value: question.has_decimal_value ? (formData.decimal_value ? Number(formData.decimal_value) : null) : undefined,
                        bool_value: question.has_boolean_value ? formData.boolean_value || null : undefined,
                        link: question.has_link ? formData.link || null : undefined,
                        note: question.has_note ? formData.note || null : undefined,
                        last_updated: new Date().toISOString(),
                        updated_by: localStorage.getItem('user_id') || 'unknown',
                    },
                };

                Object.keys(response.response).forEach(
                    (key) => response.response[key] === undefined && delete response.response[key]
                );
            }

            console.log("Submitting answer:", JSON.stringify(response, null, 2));
            const result = await submitAnswer({
                questionId: question.question_id,
                answerData: response.response,
            }).unwrap();
            console.log("Submit result:", result);

            const company_id = localStorage.getItem("company_id");
            const plant_id = localStorage.getItem("plant_id");
            const financial_year = localStorage.getItem("financial_year");

            if (!company_id || !plant_id || !financial_year) {
                throw new Error('Missing required context for updating answers');
            }

            const storedAnswers = JSON.parse(localStorage.getItem('answers') || '{"responses":{},"meta":{}}');
            const updatedResponses = {
                ...storedAnswers.responses,
                [question.question_id]: response.response,
            };
            const mergedAnswers = {
                responses: updatedResponses,
                meta: {
                    version: "1.0.0",
                    last_updated: new Date().toISOString(),
                    updated_by: localStorage.getItem('user_id') || 'current_user',
                    ...storedAnswers.meta,
                },
            };
            localStorage.setItem('answers', JSON.stringify(mergedAnswers));
            console.log('✅ Updated localStorage answers:', mergedAnswers);

            dispatch(
                apiSlice.util.updateQueryData('getAnswers', undefined, (draft) => {
                    draft.responses[question.question_id] = response.response;
                    draft.meta = {
                        ...draft.meta,
                        last_updated: new Date().toISOString(),
                        updated_by: localStorage.getItem('user_id') || 'current_user',
                    };
                })
            );

            onSuccess?.(question.question_id, response.response);
            onClose();
        } catch (error) {
            console.error("Submit error:", error);
            const errorMessage = error?.data?.detail
                ? error.data.detail.map(d => d.msg).join("; ")
                : error?.message || "Failed to submit answer. Please try again.";
            setErrors((prev) => ({ ...prev, form: errorMessage }));
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

    const renderTable = () => {
        if (question.type !== "table") return null;
        let meta = transformTableMetadata(question);
        let columns = meta.columns
            .map(col => {
                const colIdLower = col.col_id.toLowerCase();
                let colType;
                if (colIdLower.includes("sno") || colIdLower.includes("s_no")) {
                    colType = "number";
                } else if (colIdLower.includes("boolean")) {
                    colType = "boolean";
                } else if (colIdLower.includes("number") || colIdLower.includes("percent") || colIdLower.includes("turnover")) {
                    colType = "number";
                } else if (question.has_string_value && question.has_decimal_value) {
                    colType = "mixed";
                } else if (question.has_string_value) {
                    colType = "string";
                } else if (question.has_decimal_value) {
                    colType = "number";
                } else {
                    colType = "string";
                }
                return { ...col, type: colType };
            })
            .filter((col, idx, arr) => {
                const isSNo =
                    col.col_id.toLowerCase().replace(/\s/g, "").includes("sno") ||
                    col.label.toLowerCase().replace(/\s/g, "").includes("sno");
                if (!isSNo) return true;
                return (
                    arr.findIndex(
                        (c) =>
                            c.col_id.toLowerCase().replace(/\s/g, "").includes("sno") ||
                            c.label.toLowerCase().replace(/\s/g, "").includes("sno")
                    ) === idx
                );
            });

        if (
            !columns.length ||
            !(
                columns[0].col_id.toLowerCase().replace(/\s/g, "").includes("sno") ||
                columns[0].label.toLowerCase().replace(/\s/g, "").includes("sno")
            )
        ) {
            columns = [{ col_id: "s_no", label: "S No.", type: "number" }, ...columns];
        }
        let turnoverCol = columns.find((col) =>
            col.col_id.toLowerCase().includes("turnover")
        );
        if (!turnoverCol) {
            columns.push({
                col_id: "percent_turnover_of_the_entity",
                label: "% turnover of the entity",
                type: "number",
            });
        }

        const currentTable =
            currentValue?.table || createEmptyTableResponse({ ...meta, columns });

        // Dynamically update meta.rows to include all rows (predefined + added)
        const updatedMetaRows = currentTable.rows.map((row, idx) => {
            const existingRow = meta.rows.find(r => r.row_id === row.row_id);
            if (existingRow) {
                return existingRow;
            }
            // For dynamically added rows, determine the label based on previous rows
            const newLabel = getNewRowLabel(currentTable.rows.slice(0, idx), meta.rows);
            return {
                row_id: row.row_id,
                label: newLabel,
                calc: false,
            };
        });

        // Update meta.rows to ensure it includes all rows
        meta.rows = updatedMetaRows;

        const tableWithSNo = {
            columns,
            rows: currentTable.rows.map((row, idx) => ({
                ...row,
                cells: columns.map((col) => {
                    if (
                        col.col_id === "s_no" ||
                        col.label?.toLowerCase().includes("s no")
                    ) {
                        return {
                            ...col,
                            col_id: col.col_id,
                            value: (idx + 1).toString(),
                            readOnly: true,
                        };
                    }
                    const found = row.cells?.find((cell) => cell.col_id === col.col_id);
                    return found
                        ? { ...found, col_id: col.col_id }
                        : { col_id: col.col_id, value: "" };
                }),
            })),
        };

        return (
            <div className="mb-4">
                <TableQuestionRenderer
                    meta={{ ...meta, columns, rows: updatedMetaRows }}
                    response={tableWithSNo}
                    editable={true}
                    onCellChange={(rowId, colId, value) => {
                        if (colId === "s_no") return;
                        handleTableCellChange(rowId, colId, value);
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddRow}
                    sx={{ mt: 2 }}
                >
                    Add New Row
                </Button>
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
                    <style jsx="true">{`
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