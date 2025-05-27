import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ activeTab }) => {
  return (
    <div className="pt-4 mt-[55px] ml-3 mb-4">
      <div className="flex items-center space-x-2 text-base font-medium text-black">
        <span>Workforce</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-black font-medium">{activeTab}</span>
      </div>
    </div>
  );
};

export default Breadcrumb;