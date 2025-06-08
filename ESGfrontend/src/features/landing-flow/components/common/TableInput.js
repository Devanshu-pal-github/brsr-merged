import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
    selectResponseByQuestionId,
    selectIsQuestionUnsaved,
    markUnsaved,
    saveResponse
} from '../../store/responses';

const TableInput = ({ question, companyId }) => {
    const dispatch = useDispatch();
    const response = useSelector(state => selectResponseByQuestionId(state, question.question_id));
    const isUnsaved = useSelector(state => selectIsQuestionUnsaved(state, question.question_id));

    // Initialize table data from response or empty structure
    const [tableData, setTableData] = useState(
        response?.table_value || {
            headers: question.table_headers || [],
            rows: []
        }
    );

    // Update table data when response changes
    useEffect(() => {
        if (response?.table_value) {
            setTableData(response.table_value);
        }
    }, [response]);

    // Debounced save function
    const debouncedSave = debounce((value) => {
        dispatch(saveResponse({
            companyId,
            questionId: question.question_id,
            responseData: {
                table_value: value
            }
        }));
    }, 1000);

    // Handle cell value change
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newData = {
            ...tableData,
            rows: tableData.rows.map((row, idx) => {
                if (idx === rowIndex) {
                    const newRow = [...row];
                    newRow[colIndex] = value;
                    return newRow;
                }
                return row;
            })
        };
        setTableData(newData);
        dispatch(markUnsaved(question.question_id));
        debouncedSave(newData);
    };

    // Add new row
    const addRow = () => {
        const newRow = Array(tableData.headers.length).fill('');
        const newData = {
            ...tableData,
            rows: [...tableData.rows, newRow]
        };
        setTableData(newData);
        dispatch(markUnsaved(question.question_id));
        debouncedSave(newData);
    };

    // Remove row
    const removeRow = (rowIndex) => {
        const newData = {
            ...tableData,
            rows: tableData.rows.filter((_, idx) => idx !== rowIndex)
        };
        setTableData(newData);
        dispatch(markUnsaved(question.question_id));
        debouncedSave(newData);
    };

    return (
        <div className="mb-6">
            <label className="block mb-2 font-medium">
                {question.question}
                {isUnsaved && <span className="ml-2 text-yellow-500">(Unsaved changes)</span>}
            </label>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            {tableData.headers.map((header, index) => (
                                <th key={index} className="border border-gray-300 p-2 bg-gray-100">
                                    {header}
                                </th>
                            ))}
                            <th className="border border-gray-300 p-2 bg-gray-100">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="border border-gray-300 p-2">
                                        <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                ))}
                                <td className="border border-gray-300 p-2">
                                    <button
                                        onClick={() => removeRow(rowIndex)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={addRow}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Add Row
            </button>
        </div>
    );
};

export default TableInput; 