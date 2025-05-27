const BRSRCompletionStatusCard = ({ data }) => {
  return (
    <div className="w-[439px] h-[224px] bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h2 className="text-[14px] font-medium text-gray-900 mb-4">
        BRSR Completion Status
      </h2>
      <div className="space-y-4">
        {data.map(({ section, percentage }, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[14px] font-medium text-gray-700">{section}</span>
              <span className="text-[12px] font-medium text-gray-700">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: "#002A85"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BRSRCompletionStatusCard;
