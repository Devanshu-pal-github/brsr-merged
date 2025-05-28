import React, { useState } from "react";
import { Bot } from "lucide-react";

export default function QuestionnaireItem({
  question = "",
  answer = "",
  details = "",
  policyLink = "",
  isDropdownOpen = false,
  onUpdate = () => {},
  onAIAssistantClick = () => console.log("AI Assistant clicked"),
}) {
  const [editing, setEditing] = useState(false);
  const [editAnswer, setEditAnswer] = useState(answer || "");

  const handleEditClick = () => {
    if (editing) {
      onUpdate({ answer: editAnswer });
      console.log("Saved:", { answer: editAnswer }); // Debugging
    }
    setEditing(!editing);
    console.log("Edit clicked, editing:", !editing); // Debugging
  };

  const handleAnswerChange = (e) => {
    setEditAnswer(e.target.value);
    console.log("Answer changed:", e.target.value); // Debugging
  };

  return (
    <div
      className={`w-full max-w-[900px] mx-auto ${
        isDropdownOpen ? "mt-1 mb-4" : "mt-1 mb-1"
      } bg-white shadow-[0_4px_10px_rgba(0,0,0,0.2)] rounded-lg p-3`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-1">
          <div className="text-[12px] sm:text-[12px] md:text-base font-medium text-black mb-1">
            {question || "No question provided"}
          </div>
          <div className="text-[10px] sm:text-[10px] text-black">
            <span className="font-medium">Ans:</span>{" "}
            {editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editAnswer}
                  onChange={handleAnswerChange}
                  placeholder="Enter your answer..."
                  className="w-full border rounded px-2 py-1 text-[10px] resize-y"
                  rows="3"
                />
              </div>
            ) : (
              <>
                <span>{editAnswer || "No answer provided"}</span>
                {details && <span className="text-black ml-1">{details}</span>}
              </>
            )}
          </div>
          {policyLink && (
            <a
              href={policyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-[12px] hover:text-blue-800 block mt-1"
            >
              View Policy
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEditClick}
            className="w-[28px] h-[18px] bg-[#002A85] text-white text-[9px] rounded-md flex items-center justify-center"
            aria-label={editing ? "Save answer" : "Edit answer"}
          >
            {editing ? "Save" : "Edit"}
          </button>
          <button
            type="button"
            onClick={onAIAssistantClick}
            className="w-[28px] h-[18px] bg-[#20305d] text-white rounded-md flex items-center justify-center"
            aria-label="AI Assistant"
          >
            <Bot size={12} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}