console.log('QuestionFormPopup.jsx file loaded');
import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, LinkIcon, FileText, Hash, Type } from "lucide-react";

// Professional, consistent, and compact modal form for editing question responses
const QuestionFormPopup = ({ questionData, onSubmit, onClose, initialValues = {} }) => {
    console.log('[QuestionFormPopup] initialValues:', initialValues);
    console.log('[QuestionFormPopup] questionData:', questionData);
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => { setIsVisible(true); }, []);

    const handleInputChange = (e, fieldType) => {
        const { name, value, type, checked } = e.target;
        let isValid = true;
        let errorMessage = "";
        if (fieldType === "string") {
            const stringRegex = /^[a-zA-Z\s.,-]*$/;
            if (!stringRegex.test(value)) {
                isValid = false;
                errorMessage = "Only text (letters, spaces, or basic punctuation) is allowed.";
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const requiredFields = [];
        if (questionData.string_value_required && !formData.string_value) requiredFields.push("String value is required.");
        if (questionData.decimal_value_required && !formData.decimal_value) requiredFields.push("Decimal value is required.");
        if (questionData.boolean_value_required && formData.boolean_value === undefined) requiredFields.push("Boolean value is required.");
        if (questionData.link_required && !formData.link) requiredFields.push("Link is required.");
        if (questionData.note_required && !formData.note) requiredFields.push("Note is required.");
        if (hasErrors || requiredFields.length > 0) {
            setErrors((prev) => ({ ...prev, form: requiredFields.join(" ") }));
            return;
        }
        const response = {
            question_id: questionData.question_id,
            response: {
                ...(questionData.has_string_value && formData.string_value && { string_value: formData.string_value }),
                ...(questionData.has_decimal_value && formData.decimal_value && { decimal_value: Number.parseFloat(formData.decimal_value) }),
                ...(questionData.has_boolean_value && formData.boolean_value !== undefined && { bool_value: formData.boolean_value }),
                ...(questionData.has_link && formData.link && { link: formData.link }),
                ...(questionData.has_note && formData.note && { note: formData.note }),
            },
        };
        console.log('[QuestionFormPopup] onSubmit response:', response);
        onSubmit(response);
        onClose();
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
                                <span className="text-xs font-semibold text-[#1A2341] uppercase bg-gray-200 px-2 py-1 rounded">{questionData.question_id}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-[#1A2341] leading-tight">{questionData.question}</h2>
                        </div>
                        <button onClick={onClose} className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-[#1A2341] transition-all duration-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {questionData.has_string_value && (
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("string")} Response {questionData.string_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <textarea
                                        name="string_value"
                                        value={formData.string_value || ""}
                                        onChange={(e) => handleInputChange(e, "string")}
                                        placeholder="Enter your response..."
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 resize-y"
                                        rows={4}
                                        required={questionData.string_value_required}
                                    />
                                    {errors.string_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.string_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {questionData.has_decimal_value && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("decimal")} Numeric Value {questionData.decimal_value_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        name="decimal_value"
                                        value={formData.decimal_value || ""}
                                        onChange={(e) => handleInputChange(e, "decimal")}
                                        placeholder="Enter a number"
                                        step="any"
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200"
                                        required={questionData.decimal_value_required}
                                    />
                                    {errors.decimal_value && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.decimal_value}
                                        </div>
                                    )}
                                </div>
                            )}
                            {questionData.has_boolean_value && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("boolean")} Yes/No Response {questionData.boolean_value_required && <span className="text-red-500 text-xs">*</span>}
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
                            {questionData.has_link && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("link")} Link/URL {questionData.link_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link || ""}
                                        onChange={(e) => handleInputChange(e, "link")}
                                        placeholder="Enter a URL"
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200"
                                        required={questionData.link_required}
                                    />
                                    {errors.link && (
                                        <div className="flex items-center gap-1 text-red-600 text-xs">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.link}
                                        </div>
                                    )}
                                </div>
                            )}
                            {questionData.has_note && (
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2341]">
                                        {getFieldIcon("note")} Additional Notes {questionData.note_required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note || ""}
                                        onChange={(e) => handleInputChange(e, "note")}
                                        placeholder="Enter additional notes..."
                                        className="w-full p-3 border border-gray-200 rounded-[6px] focus:border-[#002A85] focus:ring-2 focus:ring-[#002A85]/20 text-[#1A2341] text-sm transition-all duration-200 resize-y"
                                        rows={3}
                                        required={questionData.note_required}
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

export default QuestionFormPopup;
