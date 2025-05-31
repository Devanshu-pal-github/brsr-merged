import { useState } from "react";

const SubHeader = ({ tabs, onTabChange, activeTab }) => {
  return (
    <div className="bg-white text-[12px] sm:text-[13px] font-medium flex items-center h-[48px] rounded-[8px] shadow-sm w-full min-w-0 overflow-x-auto pt-2 pl-1">
      <div className="flex items-center justify-start px-2 sm:px-3 h-full overflow-x-auto">
        <div className="flex space-x-4 sm:space-x-6 h-full">
          {tabs?.map((tab) => (
            <button
              key={`tab-${tab}`}
              onClick={() => onTabChange(tab)}
              className={`uppercase h-full px-1 sm:px-2 whitespace-nowrap text-[11px] sm:text-[12px] ${
                activeTab === tab
                  ? "text-[#20305D] border-b-2 border-[#000D30]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubHeader;