import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const TableInput = ({ question, value, onChange }) => {
    // Initialize table data from response or empty structure
    const [tableData, setTableData] = useState(
        value?.table_data || initializeTableData(question.table_metadata)
    );

    // Update table data when response changes
    useEffect(() => {
        if (value?.table_data) {
            setTableData(value.table_data);
        }
    }, [value]);

    // Initialize empty table data based on metadata
    function initializeTableData(metadata) {
        if (!metadata) return [];
        
        // Create empty rows based on min_rows requirement
        const minRows = metadata.restrictions?.min_rows || 1;
        const emptyRows = Array(minRows).fill().map(() => {
            return metadata.columns.reduce((acc, col) => {
                acc[col.id] = '';
                return acc;
            }, {});
        });

        return emptyRows;
    }

    // Handle cell value change
    const handleCellChange = (rowIndex, columnId, value) => {
        const newData = tableData.map((row, idx) => {
            if (idx === rowIndex) {
                return {
                    ...row,
                    [columnId]: value
                };
            }
            return row;
        });

        setTableData(newData);
        onChange({ table_data: newData });
    };

    // Add new row
    const handleAddRow = () => {
        // Check max rows restriction
        if (question.table_metadata.restrictions?.max_rows && 
            tableData.length >= question.table_metadata.restrictions.max_rows) {
            return;
        }

        // Create empty row
        const emptyRow = question.table_metadata.columns.reduce((acc, col) => {
            acc[col.id] = '';
            return acc;
        }, {});

        const newData = [...tableData, emptyRow];
        setTableData(newData);
        onChange({ table_data: newData });
    };

    // Remove row
    const handleRemoveRow = (rowIndex) => {
        // Check min rows restriction
        if (question.table_metadata.restrictions?.min_rows && 
            tableData.length <= question.table_metadata.restrictions.min_rows) {
            return;
        }

        const newData = tableData.filter((_, idx) => idx !== rowIndex);
        setTableData(newData);
        onChange({ table_data: newData });
    };

    // Validate cell value against allowed values
    const validateCellValue = (columnId, value) => {
        const allowedValues = question.table_metadata.restrictions?.allowed_values?.[columnId];
        if (!allowedValues) return true;
        return allowedValues.includes(value);
    };

    // Render cell input based on column type and restrictions
    const renderCellInput = (row, rowIndex, column) => {
        const value = row[column.id] || '';
        const allowedValues = question.table_metadata.restrictions?.allowed_values?.[column.id];

        if (allowedValues) {
            return (
                <select
                    value={value}
                    onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={column.required}
                >
                    <option value="">Select...</option>
                    {allowedValues.map(val => (
                        <option key={val} value={val}>{val}</option>
                    ))}
                </select>
            );
        }

        if (column.type === 'decimal') {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={column.required}
                />
            );
        }

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={column.required}
            />
        );
    };

    if (!question.table_metadata) return null;

    return (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <label className="block mb-4 text-sm font-medium text-gray-900">
                {question.question}
            </label>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-50">
                            {question.table_metadata.columns.map(column => (
                                <th 
                                    key={column.id} 
                                    className="border border-gray-300 p-2 text-left text-sm font-medium text-gray-700"
                                >
                                    {column.label}
                                    {column.required && <span className="text-red-500 ml-1">*</span>}
                                </th>
                            ))}
                            <th className="border border-gray-300 p-2 text-left text-sm font-medium text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {question.table_metadata.columns.map(column => (
                                    <td key={column.id} className="border border-gray-300 p-2">
                                        {renderCellInput(row, rowIndex, column)}
                                    </td>
                                ))}
                                <td className="border border-gray-300 p-2">
                                    <button
                                        onClick={() => handleRemoveRow(rowIndex)}
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                        disabled={question.table_metadata.restrictions?.min_rows && 
                                                tableData.length <= question.table_metadata.restrictions.min_rows}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleAddRow}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={question.table_metadata.restrictions?.max_rows && 
                            tableData.length >= question.table_metadata.restrictions.max_rows}
                >
                    Add Row
                </button>
            </div>

            {question.guidance && (
                <div className="mt-2 text-sm text-gray-500">
                    <i>{question.guidance}</i>
                </div>
            )}
        </div>
    );
};

TableInput.propTypes = {
    question: PropTypes.shape({
        question_id: PropTypes.string.isRequired,
        question: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        table_metadata: PropTypes.shape({
            columns: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
                type: PropTypes.string.isRequired,
                calc: PropTypes.bool,
                required: PropTypes.bool
            })).isRequired,
            rows: PropTypes.arrayOf(PropTypes.shape({
                row_id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired
            })).isRequired,
            restrictions: PropTypes.shape({
                min_rows: PropTypes.number,
                max_rows: PropTypes.number,
                allowed_values: PropTypes.object
            })
        }).isRequired,
        guidance: PropTypes.string
    }).isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired
};

export default TableInput; 