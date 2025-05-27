const AIAssistant = () => {
  const messages = [
    { sender: "AI", text: "Hello! How can I assist you today?", time: "10:30 AM" },
    { sender: "User", text: "I need help with my project", time: "10:31 AM" },
    { sender: "AI", text: "I'd be happy to help! Could you please provide more details about your project?", time: "10:31 AM" },
  ];

  return (
    <div className="flex flex-col bg-white w-full h-auto sm:h-[290px] lg:h-[320px] xl:h-[350px] py-1 sm:py-2 px-1 sm:px-2 md:px-4 rounded-[12px] shadow-md transition-all duration-300 ease-in-out">
      <div className="flex sm:flex-row flex-col items-center gap-1 sm:gap-2 mb-1 sm:mb-2 md:mb-4">
        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#20305D] rounded-[8px] flex items-center justify-center">
          <span className="text-white text-[10px] sm:text-xs md:text-sm">🤖</span>
        </div>
        <h3 className="text-[10px] sm:text-xs md:text-base font-medium text-black">AI Assistant</h3>
        <span className="text-[8px] sm:text-[10px] md:text-sm text-black">Online</span>
      </div>

      <div className="flex-1 space-y-1 sm:space-y-2 md:space-y-3 overflow-y-auto max-h-[150px] sm:max-h-[200px] lg:max-h-[220px] xl:max-h-[250px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === "User" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-1 sm:p-2 md:p-3 rounded-[8px] ${
                message.sender === "User" ? "bg-[#002A85] text-white" : "bg-[#20305D] text-white"
              }`}
            >
              <p className="text-[10px] sm:text-xs md:text-sm font-medium">{message.text}</p>
              <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-300 block mt-0.5 sm:mt-1">{message.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 sm:mt-2 md:mt-4 flex items-center gap-0.5 sm:gap-1 md:gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-0.5 sm:p-1 md:p-2 border border-gray-300 rounded-[8px] text-[10px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[60px] sm:min-w-[80px]"
        />
        <button className="p-0.5 sm:p-1 md:p-2 bg-[#20305D] rounded-[8px]">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;