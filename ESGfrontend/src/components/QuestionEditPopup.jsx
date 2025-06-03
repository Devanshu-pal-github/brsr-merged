import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, LinkIcon, FileText, Hash, Type } from "lucide-react";
import { useSubmitQuestionAnswerMutation, useStoreQuestionDataMutation } from "../api/apiSlice";

const QuestionEditPopup = ({ question, initialAnswer, onClose, onSuccess, moduleId }) => {
    const [formData, setFormData] = useState(initialAnswer || {});
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [submitAnswer] = useSubmitQuestionAnswerMutation();
    const [storeQuestionData] = useStoreQuestionDataMutation();

    useEffect(() => { 
        setIsVisible(true);
        if (initialAnswer) {
            setFormData(initialAnswer);
        }
    }, [initialAnswer]);

    const handleInputChange = (e, fieldType) => {
        const { name, value, type, checked } = e.target;
        let isValid = true;
        let errorMessage = "";
          if (fieldType === "string") {
            // Allow all text input, just ensure it's not empty if required
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
        
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: isValid ? "" : errorMessage }));
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const requiredFields = [];
        
        if (question.string_value_required && !formData.string_value) requiredFields.push("String value is required.");
        if (question.decimal_value_required && !formData.decimal_value) requiredFields.push("Decimal value is required.");
        if (question.boolean_value_required && formData.boolean_value === undefined) requiredFields.push("Boolean value is required.");
        if (question.link_required && !formData.link) requiredFields.push("Link is required.");
        if (question.note_required && !formData.note) requiredFields.push("Note is required.");
        
        if (hasErrors || requiredFields.length > 0) {
            setErrors((prev) => ({ ...prev, form: requiredFields.join(" ") }));
            return;
        }

        try {
            // Prepare the response according to the API model
            const response = {
                question_id: question.question_id,
                response: {
                    string_value: question.has_string_value ? formData.string_value || null : undefined,
                    decimal_value: question.has_decimal_value ? (formData.decimal_value ? Number(formData.decimal_value) : null) : undefined,
                    bool_value: question.has_boolean_value ? formData.boolean_value || null : undefined,
                    link: question.has_link ? formData.link || null : undefined,
                    note: question.has_note ? formData.note || null : undefined
                }
            };

            // Clean up undefined values
            Object.keys(response.response).forEach(key => 
                response.response[key] === undefined && delete response.response[key]
            );

            console.log('📥 Submitting answer:', response);
            const result = await submitAnswer({
                questionId: question.question_id,
                answerData: response.response
            }).unwrap();
            console.log('✅ Answer submitted successfully:', result);

            // Store question data including metadata and answer
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
                    note_required: question.note_required
                },
                answer: response.response
            });
            
            // Pass back the updated data
            onSuccess?.(question.question_id, response.response);
            onClose();
        } catch (error) {
            console.error('Error submitting answer:', error);
            setErrors((prev) => ({ ...prev, form: "Failed to submit answer. Please try again." }));
        }
    };

    const getFieldIcon = (fieldType) => {
        switch (fieldType) {
            case "string": return <Type className="w-4 h-4 text-gray-500" />;
            case "decimal": return <Hash className="w-4 h-4 text-gray-500" />;
            case "link": return <LinkIcon className="w-4 h-4 text-gray-500" />;
            case "note": return <FileText className="w-4 h-4 text-gray-500" />;
            case "boolean": return <CheckCircle className="w-5 h-5 text-gray-600" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[140] p-4">
            <div className={`bg-white rounded-[6px] shadow-lg border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"}`}>
                <div className="bg-[#F9FAFB] p-4 border-b border-gray-200 relative">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#1A2341] uppercase bg-gray-200 px-2 py-1 rounded">{question.question_id}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-[#1A2341] leading-tight">{question.question}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-[#1A2341] transition-all duration-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {question.has_string_value && (
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("string")} Response {question.string_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <textarea
                                        name="string_value"
                                        value={formData.string_value || ""}
                                        onChange={(e) => handleInputChange(e, "string")}
                                        placeholder="Enter your response..."
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 resize-y"
                                        rows={4}
                                        required={question.string_value_required}
                                    />
                                    {errors.string_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.string_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_decimal_value && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("decimal")} Numeric Value {question.decimal_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        name="decimal_value"
                                        value={formData.decimal_value || ""}
                                        onChange={(e) => handleInputChange(e, "decimal")}
                                        placeholder="Enter a number"
                                        step="any"
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200"
                                        required={question.decimal_value_required}
                                    />
                                    {errors.decimal_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.decimal_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_boolean_value && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("boolean")} Yes/No Response {question.boolean_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="boolean_value"
                                            checked={formData.boolean_value || false}
                                            onChange={(e) => handleInputChange(e, "boolean")}
                                            className="w-4 h-4 accent-[#002A85] rounded focus:ring-2 focus:ring-[#002A85]/50"
                                        />
                                        <span className="text-sm text-[#1A2341]">{formData.boolean_value ? "Yes" : "No"}</span>
                                    </div>
                                    {errors.boolean_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.boolean_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_link && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("link")} Link/URL {question.link_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link || ""}
                                        onChange={(e) => handleInputChange(e, "link")}
                                        placeholder="Enter a URL"
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200"
                                        required={question.link_required}
                                    />
                                    {errors.link && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.link}
                                        </div>
                                    )}
                                </div>
                            )}
                            {question.has_note && (
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("note")} Additional Notes {question.note_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note || ""}
                                        onChange={(e) => handleInputChange(e, "note")}
                                        placeholder="Enter additional notes..."
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 resize-y"
                                        rows={3}
                                        required={question.note_required}
                                    />
                                    {errors.note && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.note}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.form && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-[6px]">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">Please fix the following errors:</span>
                                </div>
                                <p className="text-red-600 text-xs mt-1">{errors.form}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
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

export default QuestionEditPopup;
