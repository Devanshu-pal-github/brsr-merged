export default function TableCard({ title, fields, rows, onEditClick }) {
  return (
    <div className="w-full max-w-full md:max-w-[300px] h-auto p-3 pt-0 rounded-[8px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] md:text-[14px] font-semibold text-[#000D30]">{title}</h2>
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="w-[38px] h-[24px] md:w-[56px] md:h-[26px] bg-[#002A85] text-white text-[11px] md:text-[12px] rounded-md flex items-center justify-center"
          >
            Edit
          </button>
        )}
      </div>

      <div className="bg-white rounded-[8px] shadow-sm">
        <table className="w-full min-w-[240px] table-fixed">
          <thead>
            <tr className="bg-[#F3F4F6]">
              {fields.map((field, idx) => (
                <th
                  key={idx}
                  className={`py-2 px-1 sm:px-2 font-medium text-gray-700 text-xs sm:text-sm ${field.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${rowIndex === rows.length - 1 ? 'bg-gray-50 font-medium' : 'border-b border-gray-200'}`}
              >
                {fields.map((field, colIndex) => (
                  <td
                    key={colIndex}
                    className={`py-1 px-1 sm:px-2 text-[10px] md:text-[12px] text-black ${field.align === 'center' ? 'text-center' : ''}`}
                  >
                    {row[field.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}