import React, { useState } from "react";
import TableQuestionFormPopup from "../components/TableQuestionFormPopup";

const mockQuestions = [
    {
        question_id: "Q14_Business_Activities",
        question: "Details of business activities (accounting for 90% of the turnover)",
        type: "table",
        has_string_value: false,
        has_decimal_value: false,
        has_boolean_value: false,
        has_link: false,
        has_note: false,
        table_metadata: {
            headers: [
                {
                    label: "S. No.",
                    cell_type: "integer",
                    required: true,
                    read_only: true,
                    help_text: "Serial number (auto-incremented)",
                },
                {
                    label: "Description of Main Activity",
                    cell_type: "string",
                    required: true,
                    help_text: "Main activity description",
                },
                {
                    label: "Description of Business Activity",
                    cell_type: "string",
                    required: true,
                    help_text: "Detailed business activity description",
                },
                {
                    label: "% of Turnover of the entity",
                    cell_type: "decimal",
                    required: true,
                    min_value: 0,
                    max_value: 100,
                    help_text: "Percentage of turnover (0-100)",
                },
            ],
            rows: [],
            cell_type: "string",
            allow_dynamic_rows: true,
            min_col_width: 100,
            max_col_width: 200,
            horizontal_scroll_threshold: 3,
        },
    },
    {
        question_id: "Q15_Products_Services",
        question: "Products/Services sold by the entity (accounting for 90% of the entity's Turnover)",
        type: "table",
        has_string_value: false,
        has_decimal_value: false,
        has_boolean_value: false,
        has_link: false,
        has_note: false,
        table_metadata: {
            headers: [
                {
                    label: "S. No.",
                    cell_type: "integer",
                    required: true,
                    read_only: true,
                    help_text: "Serial number (auto-incremented)",
                },
                {
                    label: "Product/Service",
                    cell_type: "string",
                    required: true,
                    help_text: "Name of the product or service",
                },
                {
                    label: "NIC Code",
                    cell_type: "string",
                    required: true,
                    help_text: "National Industrial Classification Code",
                },
                {
                    label: "%of total Turnover contributed",
                    cell_type: "decimal",
                    required: true,
                    min_value: 0,
                    max_value: 100,
                    help_text: "Percentage of turnover contributed (0-100)",
                },
            ],
            rows: [],
            cell_type: "string",
            allow_dynamic_rows: true,
            min_col_width: 100,
            max_col_width: 200,
            horizontal_scroll_threshold: 3,
        },
    },
    {
        question_id: "Q16_Locations",
        question: "Number of locations where plants and/or operations/offices of the entity are situated",
        type: "table",
        has_string_value: false,
        has_decimal_value: false,
        has_boolean_value: false,
        has_link: false,
        has_note: false,
        table_metadata: {
            headers: [
                {
                    label: "Location",
                    cell_type: "string",
                    required: true,
                    read_only: true,
                    help_text: "Location type (National/International)",
                },
                {
                    label: "Number of plants",
                    cell_type: "integer",
                    required: true,
                    min_value: 0,
                    help_text: "Number of plants in the location",
                },
                {
                    label: "Number of offices",
                    cell_type: "integer",
                    required: true,
                    min_value: 0,
                    help_text: "Number of offices in the location",
                },
                {
                    label: "Total",
                    cell_type: "integer",
                    required: true,
                    read_only: true,
                    calculated: "Number of plants + Number of offices",
                    help_text: "Total number of plants and offices (auto-calculated)",
                },
            ],
            rows: [
                { name: "National", required: true, help_text: "Locations within the country" },
                { name: "International", required: true, help_text: "Locations outside the country" },
            ],
            cell_type: "integer",
            allow_dynamic_rows: false,
            min_col_width: 100,
            max_col_width: 200,
            horizontal_scroll_threshold: 3,
        },
    },
    {
        question_id: "Q20_Turnover_Rate",
        question: "Turnover rate for permanent employees and workers (For Current FY and Previous FY)",
        type: "table",
        has_string_value: false,
        has_decimal_value: false,
        has_boolean_value: false,
        has_link: false,
        has_note: false,
        table_metadata: {
            headers: [
                {
                    label: "Category",
                    cell_type: "string",
                    required: true,
                    read_only: true,
                    help_text: "Type of employees/workers",
                },
                {
                    label: "Turnover Rate (Current FY)",
                    cell_type: "decimal",
                    required: true,
                    min_value: 0,
                    max_value: 100,
                    help_text: "Percentage of turnover (0-100)",
                },
                {
                    label: "Turnover Rate (Previous FY)",
                    cell_type: "decimal",
                    required: true,
                    min_value: 0,
                    max_value: 100,
                    help_text: "Percentage of turnover (0-100)",
                },
                {
                    label: "Change %",
                    cell_type: "decimal",
                    required: true,
                    read_only: true,
                    calculated: "(Turnover Rate (Current FY) - Turnover Rate (Previous FY)) / Turnover Rate (Previous FY) * 100",
                    help_text: "Percentage change (auto-calculated)",
                },
            ],
            rows: [
                { name: "Employees", required: true, help_text: "Permanent employees" },
                { name: "Workers", required: true, help_text: "Permanent workers" },
            ],
            cell_type: "decimal",
            allow_dynamic_rows: false,
            min_col_width: 100,
            max_col_width: 200,
            horizontal_scroll_threshold: 3,
        },
    },
];

const mockInitialValues = {
    // Q14_Business_Activities
    "row_0__Description of Main Activity": "Manufacturing",
    "row_0__Description of Business Activity": "Production of electronics",
    "row_0__% of Turnover of the entity": "70",
    "row_1__Description of Main Activity": "Trading",
    "row_1__Description of Business Activity": "Distribution of consumer goods",
    "row_1__% of Turnover of the entity": "20",
    // Q15_Products_Services
    "row_0__Product/Service": "Smartphones",
    "row_0__NIC Code": "26101",
    "row_0__% of total Turnover contributed": "85",
    // Q16_Locations
    "National__Number of plants": "5",
    "National__Number of offices": "10",
    "International__Number of plants": "2",
    "International__Number of offices": "3",
    // Q20_Turnover_Rate
    "Employees__Turnover Rate (Current FY)": "15",
    "Employees__Turnover Rate (Previous FY)": "10",
    "Workers__Turnover Rate (Current FY)": "20",
    "Workers__Turnover Rate (Previous FY)": "25",
};

const TestHarness = () => {
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const handleSubmit = (response) => {
        console.log("Submitted:", JSON.stringify(response, null, 2));
        setSelectedQuestion(null);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">BRSR Table Questions Test Harness</h1>
            <div className="space-y-2">
                {mockQuestions.map((question) => (
                    <button
                        key={question.question_id}
                        onClick={() => setSelectedQuestion(question)}
                        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-[#1A2341] transition-all duration-200"
                    >
                        Edit {question.question_id}: {question.question}
                    </button>
                ))}
            </div>
            {selectedQuestion && (
                <TableQuestionFormPopup
                    questionData={selectedQuestion}
                    onSubmit={handleSubmit}
                    onClose={() => setSelectedQuestion(null)}
                    initialValues={mockInitialValues}
                />
            )}
        </div>
    );
};

export default TestHarness;