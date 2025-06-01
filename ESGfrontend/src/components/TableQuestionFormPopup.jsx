import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

// Helper to get column type (per-column or global)
const getColumnType = (header, globalType) => header.cell_type || globalType || "string";

// Helper to get initial cell value
const getInitialCellValue = (row, header, initialValues) => {
    const key = `${row.name}__${header.label}`;
    return initialValues?.[key] ?? header.default_value ?? row.default_value ?? "";
};

const TableQuestionFormPopup = ({ questionData, onSubmit, onClose, initialValues = {} }) => {
    const { table_metadata: metadata } = questionData;
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        // Initialize form data from initialValues or defaults
        if (metadata) {
            const newFormData = {};
            metadata.rows.forEach(row => {
                metadata.headers.forEach(header => {
                    const key = `${row.name}__${header.label}`;
                    newFormData[key] = getInitialCellValue(row, header, initialValues);
                });
            });
            setFormData(newFormData);
        }
    }, [metadata, initialValues]);

    // Validation per cell
    const validateCell = (value, header, row) => {
        const type = getColumnType(header, metadata.cell_type);
        let isValid = true, errorMessage = "";
        if (header.required || row.required) {
            if (value === "" || value === null || value === undefined) {
                isValid = false;
                errorMessage = "Required";
            }
        }
        if (type === "decimal" && value !== "" && isNaN(value)) {
            isValid = false;
            errorMessage = "Must be a number";
        }
        if (header.allowed_values && value && !header.allowed_values.includes(value)) {
            isValid = false;
            errorMessage = "Invalid value";
        }
        if (header.min_value !== undefined && value !== "" && Number(value) < header.min_value) {
            isValid = false;
            errorMessage = `Min: ${header.min_value}`;
        }
        if (header.max_value !== undefined && value !== "" && Number(value) > header.max_value) {
            isValid = false;
            errorMessage = `Max: ${header.max_value}`;
        }
        return { isValid, errorMessage };
    };

    const handleInputChange = (e, row, header) => {
        const { value } = e.target;
        const key = `${row.name}__${header.label}`;
        const { isValid, errorMessage } = validateCell(value, header, row);
        setFormData(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: isValid ? "" : errorMessage }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate all cells
        let hasErrors = false;
        const newErrors = {};
        metadata.rows.forEach(row => {
            metadata.headers.forEach(header => {
                const key = `${row.name}__${header.label}`;
                const { isValid, errorMessage } = validateCell(formData[key], header, row);
                if (!isValid) hasErrors = true;
                newErrors[key] = isValid ? "" : errorMessage;
            });
        });
        setErrors(newErrors);
        if (hasErrors) return;

        // Build response object: { question_id, response: { table: [{ row, col, value }] } }
        const tableResponse = [];
        metadata.rows.forEach(row => {
            metadata.headers.forEach(header => {
                const key = `${row.name}__${header.label}`;
                tableResponse.push({
                    row: row.name,
                    col: header.label,
                    value: formData[key]
                });
            });
        });
        const response = {
            question_id: questionData.question_id,
            response: { table: tableResponse }
        };
        onSubmit(response);
        onClose();
    };

    // Render table headers (single-level for simplicity; extend for multi-level if needed)
    const renderTableHeaders = () => (
        <tr>
            <th className="bg-gray-50 text-left px-3 py-2 text-xs font-semibold text-[#1A2341]">Row</th>
            {metadata.headers.map(header => (
                <th key={header.label} className="bg-gray-50 text-left px-3 py-2 text-xs font-semibold text-[#1A2341]">
                    {header.label}
                    {(header.required || header.help_text) && (
                        <span className="ml-1 text-red-500 text-xs">{header.required ? "*" : ""}</span>
                    )}
                    {header.help_text && (
                        <span className="ml-1 text-gray-400 text-xs" title={header.help_text}>?</span>
                    )}
                </th>
            ))}
        </tr>
    );

    // Render table rows
    const renderTableRows = () => (
        metadata.rows.map(row => (
            <tr key={row.name}>
                <td className="px-3 py-2 text-sm font-medium text-[#1A2341] bg-gray-50">{row.name}</td>
                {metadata.headers.map(header => {
                    const key = `${row.name}__${header.label}`;
                    const type = getColumnType(header, metadata.cell_type);
                    const value = formData[key] || "";
                    const error = errors[key];
                    // Render input based on type and allowed_values
                    let inputEl = null;
                    if (header.allowed_values) {
                        inputEl = (
                            <select
                                className="w-full p-2 border border-gray-200 rounded focus:border-[#002A85] text-sm"
                                value={value}
                                onChange={e => handleInputChange(e, row, header)}
                                required={header.required || row.required}
                            >
                                <option value="">Select</option>
                                {header.allowed_values.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        );
                    } else if (type === "decimal") {
                        inputEl = (
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-200 rounded focus:border-[#002A85] text-sm"
                                value={value}
                                onChange={e => handleInputChange(e, row, header)}
                                min={header.min_value}
                                max={header.max_value}
                                required={header.required || row.required}
                            />
                        );
                    } else if (type === "boolean") {
                        inputEl = (
                            <select
                                className="w-full p-2 border border-gray-200 rounded focus:border-[#002A85] text-sm"
                                value={value}
                                onChange={e => handleInputChange(e, row, header)}
                                required={header.required || row.required}
                            >
                                <option value="">Select</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        );
                    } else {
                        inputEl = (
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded focus:border-[#002A85] text-sm"
                                value={value}
                                onChange={e => handleInputChange(e, row, header)}
                                required={header.required || row.required}
                                maxLength={header.max_width || 255}
                            />
                        );
                    }
                    return (
                        <td key={header.label} className="px-3 py-2 align-top">
                            {inputEl}
                            {error && (
                                <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </td>
                    );
                })}
            </tr>
        ))
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[140] p-4">
            <div className={`bg-white rounded-[6px] shadow-lg border border-gray-100 w-full max-w-5xl max-h-[90vh] overflow-auto transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"}`}>
                <div className="bg-[#F9FAFB] p-4 border-b border-gray-200 relative">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#1A2341] uppercase bg-gray-200 px-2 py-1 rounded">{questionData.question_id}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-[#1A2341] leading-tight">{questionData.question}</h2>
                        </div>
                        <button onClick={onClose} className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-[#1A2341] transition-all duration-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-x-auto">
                    <form onSubmit={handleSubmit}>
                        <table className="min-w-full border border-gray-200 rounded-[6px]">
                            <thead>
                                {renderTableHeaders()}
                            </thead>
                            <tbody>
                                {renderTableRows()}
                            </tbody>
                        </table>
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-4 py-2 text-[#1A2341] border border-gray-200 rounded-[6px] hover:bg-gray-50 text-sm font-medium transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none px-4 py-2 bg-[#002A85] text-white rounded-[6px] hover:bg-[#0A2E87] text-sm font-medium transition-all duration-200"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TableQuestionFormPopup;
