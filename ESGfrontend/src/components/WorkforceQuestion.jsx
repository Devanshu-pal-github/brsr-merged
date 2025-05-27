import { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";

const WorkforceQuestion = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`w-full max-w-full box-border bg-white rounded-[8px] shadow-md border border-gray-200 transition-all duration-300 overflow-hidden ${
        isOpen ? "max-h-[500px]" : "h-[58px]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between h-[58px] px-3 sm:px-4 md:px-6 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-black" />
          <span className="text-[13px] font-medium text-black">{question}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-black" />
        ) : (
          <ChevronDown className="w-4 h-4 text-black" />
        )}
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="px-3 sm:px-4 md:px-6 pb-2 w-full box-border">
          {children}
        </div>
      )}
    </div>
  );
};

export default WorkforceQuestion;