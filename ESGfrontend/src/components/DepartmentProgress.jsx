import { Bell } from "lucide-react";

const DepartmentProgressItem = ({ name, totalFields, completed }) => {
  return (
    <div className="w-[669px] h-[60px]  rounded-[8px] p-4 bg-white flex items-center justify-between">
      {/* Department Name */}
      <div className="font-medium text-gray-900 text-[12px]">
        {name}
      </div>

      {/* Total Fields and Completed */}
      <div className="flex space-x-8">
        <div className="text-[12px] text-gray-600">
          <div className="text-gray-500 font-medium">Total Fields</div>
          <div className="font-medium text-gray-900">{totalFields}</div>
        </div>
        <div className="text-[12px] text-gray-600">
          <div className="text-gray-500 font-medium">Completed</div>
          <div className="font-medium text-gray-900">{completed}</div>
        </div>
      </div>

      {/* Access Department and Bell Icon */}
      <div className="flex items-center space-x-12">
        <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
          Access Department
        </button>
        <Bell className="w-5 h-5 text-black" />
      </div>
    </div>
  );
};

export default DepartmentProgressItem;