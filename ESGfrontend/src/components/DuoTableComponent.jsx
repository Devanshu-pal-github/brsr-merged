export default function DuoTableComponent({ title, fields = [], rows = [], onEditClick }) {
  return (
    <div className="w-full max-w-full h-auto p-3 pt-0 rounded-[8px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] md:text-[14px] font-semibold text-[#000D30]">{title}</h2>
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="w-[48px] h-[24px] md:w-[56px] md:h-[26px] bg-[#002A85] text-white text-[11px] md:text-[12px] rounded-md flex items-center justify-center"
          >
            Edit
          </button>
        )}
      </div>

      <div className="bg-white rounded-[8px] overflow-x-auto shadow-sm">
        <table className="w-full min-w-[600px] table-fixed">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th rowSpan="2" className="py-1.5 px-4 text-left font-semibold text-gray-700 text-xs">
                Category
              </th>
              <th colSpan="2" className="text-center font-semibold text-[#000D30] text-xs">
                FY 2023-24
              </th>
              <th colSpan="2" className="text-center font-semibold text-[#000D30] text-xs">
                FY 2023-24
              </th>
             
            </tr>
            <tr className="bg-[#F3F4F6]">
              <th className="py-1 px-2 text-center text-gray-700 text-[10px] border-gray-300">Male No.</th>
              <th className="py-1 px-2 text-center text-gray-700 text-[10px] border-gray-300">Female No.</th>
              <th className="py-1 px-2 text-center text-gray-700 text-[10px] border-gray-300">Male No.</th>
              <th className="py-1 px-2 text-center text-gray-700 text-[10px] border-gray-300">Female No.</th>
              
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex === rows.length - 1 ? 'bg-gray-50 font-medium' : 'border-b border-gray-200'
                }`}
              >
                <td className="py-1.5 px-4 text-[10px] md:text-[12px] text-black text-left border-gray-300">{row.category}</td>
                <td className="py-1.5 px-2 text-center text-[10px] md:text-[12px] border-gray-300">{row.male1}</td>
                <td className="py-1.5 px-2 text-center text-[10px] md:text-[12px] border-gray-300">{row.female1}</td>
                <td className="py-1.5 px-2 text-center text-[10px] md:text-[12px] border-gray-300">{row.male2}</td>
                <td className="py-1.5 px-2 text-center text-[10px] md:text-[12px] border-gray-300">{row.female2}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}