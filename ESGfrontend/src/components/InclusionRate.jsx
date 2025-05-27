export default function WorkerTable() {
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
        <table className="w-full min-w-[240px] table-fixed">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="text-left py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm">Category</th>
              <th className="text-center py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm">Male No.</th>
              <th className="text-center py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm">Female No.</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1 px-1 sm:px-2 text-[10px] md:text-[12px] text-black">Permanent</td>
              <td className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</td>
              <td className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1 px-1 sm:px-2 text-[10px] md:text-[12px] text-black">Other than Permanent</td>
              <td className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</td>
              <td className="py-1 px-1 sm:px-2 text-center text-[10px] md:text-[12px] text-black">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}