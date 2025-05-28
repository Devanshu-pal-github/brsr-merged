import React, { useState } from "react";

export default function QuestionnaireItem({
  question = "",
  answer = "",
  details = "",
  policyLink = "",
  isDropdownOpen = false,
  onUpdate = () => {},
}) {
  const [editing, setEditing] = useState(false);
  const [editAnswer, setEditAnswer] = useState(answer || "");
  const [rating, setRating] = useState(0);

  const handleEditClick = () => {
    if (editing) {
      // Save changes and return to non-editable state
      onUpdate({ answer: editAnswer, rating });
      console.log("Saved:", { answer: editAnswer, rating }); // Debugging
    }
    setEditing(!editing);
    console.log("Edit clicked, editing:", !editing); // Debugging
  };

  const handleAnswerChange = (e) => {
    setEditAnswer(e.target.value);
    console.log("Answer changed:", e.target.value); // Debugging
  };

  const handleStarClick = (starValue) => {
    setRating(starValue);
    console.log("Star clicked, rating:", starValue); // Debugging
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
                <div className="flex gap-1">
                  {[1, 2, 3].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      className={`text-[16px] cursor-pointer ${
                        rating >= star ? "text-[#20305d]" : "text-gray-300"
                      }`}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
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
          {!editing && (
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-[16px] ${
                    rating >= star ? "text-[#20305d]" : "text-gray-300"
                  }`}
                  aria-label={`Rated ${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}