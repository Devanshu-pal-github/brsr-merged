import { Send } from "lucide-react";

const AIAssistant = () => {
  return (
    <div className="flex flex-col rounded-lg shadow-lg border border-gray-200 bg-white w-full max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-full">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-[#000D30] rounded-[8px] flex items-center justify-center">
          <span className="text-white text-[14px] font-medium">AI</span>
        </div>
        <div>
          <div className="font-medium text-black">AI Assistant</div>
          <div className="text-[12px] text-[#000D30]">Online</div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-[#20305D] text-white p-3 rounded-[12px] max-w-xs">
          <div className="text-[12px]">Hello! How can I assist you today?</div>
          <div className="text-[12px] opacity-75 mt-1">10:30 AM</div>
        </div>

        <div className="bg-[#20305D] text-white p-3 rounded-[8px] max-w-xs ml-auto">
          <div className="text-[12px]">I need help with my project</div>
          <div className="text-[12px] opacity-75 mt-1">10:31 AM</div>
        </div>

        <div className="bg-[#20305D] text-white p-3 rounded-[8px] max-w-xs">
          <div className="text-[12px]">
            I'd be happy to help! Could you please provide more details about your project?
          </div>
          <div className="text-[12px] opacity-75 mt-1">10:31 AM</div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 text-[12px] px-3 py-2 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#000D30] focus:border-transparent"
          />
          <button className="bg-[#000D30] hover:bg-[#20305D] text-white p-2 rounded-[8px]">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
