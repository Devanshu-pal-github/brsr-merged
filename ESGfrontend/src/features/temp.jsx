import React from "react";

const mockQuestions = [
    {
        question_id: "Q14_Business_Activities",
        question: "Details of business activities (accounting for 90% of the turnover)",
        type: "subjective",
        has_string_value: true,
        has_decimal_value: true,
        has_boolean_value: false,
        has_link: false,
        has_note: true,
        string_value_required: true,
        decimal_value_required: true,
        note_required: false
    }
];

const TestHarness = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">BRSR Questions Test Harness</h1>
            <div className="space-y-2">
                {mockQuestions.map((question) => (
                    <div
                        key={question.question_id}
                        className="w-full p-4 bg-gray-100 rounded text-sm font-medium text-[#1A2341]"
                    >
                        {question.question_id}: {question.question}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestHarness;