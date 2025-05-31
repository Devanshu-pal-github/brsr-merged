const ProgressCard = ({ title = "Progress", covered = 14, total = 20 }) => {
  return (
    <div
      className="bg-white rounded-[8px] shadow-sm border border-gray-200 w-full h-auto flex flex-col sm:flex-row items-center justify-between px-4 py-2 min-w-0"
    >
      <span className="text-[10px] sm:text-[12px] md:text-[14px] font-medium text-black text-left sm:flex-1">
        {title}
      </span>
      <span className="text-[10px] sm:text-[12px] md:text-[14px] font-medium text-black text-left ml-0 sm:ml-4 md:ml-6">
        <span className="text-gray-400 mr-1">Q.s covered</span>
        <span>{covered}/{total}</span>
      </span>
    </div>
  );
};

export default ProgressCard;