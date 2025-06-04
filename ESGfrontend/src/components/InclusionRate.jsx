export default function InclusionRateGrid() {
  return (
    <div className="w-full max-w-full md:max-w-[300px] h-auto p-3 pt-0 rounded-[8px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] md:text-[14px] font-semibold text-[#000D30]">Inclusion Rate</h2>
        <button
          className="w-[48px] h-[24px] md:w-[56px] md:h-[26px] bg-[#002A85] text-white text-[11px] md:text-[12px] rounded-md flex items-center justify-center"
        >
          Edit
        </button>
      </div>

      <div className="bg-white rounded-[8px] shadow-sm">
        <div className="min-w-[240px]">
          {/* Header */}
          <div className="grid grid-cols-3 bg-[#F3F4F6]">
            <div className="text-left py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm">Category</div>
            <div className="text-center py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm">Male No.</div>
            <div className="text-center py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm">Female No.</div>
          </div>
          
          {/* Data Rows */}
          <div className="border-b border-gray-200 grid grid-cols-3">
            <div className="py-1 px-1 sm:px-2 text-[10px] md:text-[12px] text-black">Permanent</div>
            <div className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</div>
            <div className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</div>
          </div>
          <div className="border-b border-gray-200 grid grid-cols-3">
            <div className="py-1 px-1 sm:px-2 text-[10px] md:text-[12px] text-black">Other than Permanent</div>
            <div className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</div>
            <div className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</div>
          </div>
        </div>
      </div>
    </div>
  );
}