import { ChevronDown } from "lucide-react";
import Layout from "../../components/Layout";
import KPI from "../../components/KPI";
import CustomButton from '../../components/CustomButton'
import BRSRCompletionStatusCard from "../../components/BRSRCompletionStatus"
import AIAssistant from "../../components/AIAssisstantChat"
import DepartmentProgressItem from "../../components/DepartmentProgress"
import RecentUpdateItem from "../../components/RecentUpdates"
const Dashboard = () => {
  const metrics = [
    { label: "Total Fields", value: 103, color: "text-gray-900" },
    { label: "Completed", value: 76, color: "text-green-500" },
    { label: "Pending", value: 27, color: "text-orange-500" },
    { label: "Completion Rate", value: "74%", color: "text-purple-500" },
    { label: "Due This Week", value: 12, color: "text-red-500" },
  ];

  const progressData = [
    { section: "Section A", percentage: 90 },
    { section: "Section B", percentage: 85 },
    { section: "Section C", percentage: 95 },
  ];

  const departments = [
    { name: "Admin", totalFields: 25, completed: 18 },
    { name: "Environment", totalFields: 25, completed: 18 },
    { name: "Legal", totalFields: 25, completed: 18 },
    { name: "Workforce", totalFields: 25, completed: 18 },
    { name: "Finance", totalFields: 25, completed: 18 },
  ];

  const recentUpdates = [
    { description: "Workforce Details Updated", timestamp: "2 hours ago" },
    { description: "Environmental Metrics Added", timestamp: "4 hours ago" },
    { description: "Compliance Documents Updated", timestamp: "6 hours ago" },
  ];

  return (
    <Layout>
      <div className="min-h-screen ">
        <div className="mx-10">
        <div className="min-h-screen  flex">
        <div className="mx-auto py-4 sm:py-6 pr-40">
          <h1 className="text-[18px] p-[20px] pr-40 font-bold text-gray-900 mb-4 sm:mb-6">
            BRSR Dashboard
          </h1>

          {/* Main Container: Side by Side Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Section: Main Content */}
            <div className="flex-1 flex flex-col gap-4">
              {/* KPIs */}
              <div className="w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {metrics.map((metric, index) => (
                    <KPI
                      key={index}
                      label={metric.label}
                      value={metric.value}
                      color={metric.color}
                      className="p-[11px_24px] bg-white rounded-lg shadow-sm border border-gray-100"
                    />
                  ))}
                </div>
              </div>

              {/* Custom Buttons + Department Progress and Recent Updates */}
              <div className="flex flex-col xl:flex-row gap-4">
                {/* Custom Buttons + Department Progress */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Custom Buttons */}
                  <div className="rounded-[8px] bg-white p-4">
                    <div className="flex flex-wrap items-center gap-[12px]">
                      <CustomButton
                        name="Generate Report"
                        className="w-[142px] h-[39px] bg-blue-600 text-white text-base font-semibold rounded-[8px] shadow-sm flex items-center justify-between px-4 py-2"
                        icon={<ChevronDown className="w-5 h-5 text-white" />}
                      />
                      <CustomButton
                        name="View Analytics"
                        className="w-[142px] h-[39px] bg-blue-600 text-white text-base font-semibold rounded-[8px] shadow-sm flex items-center justify-between px-4 py-2"
                        icon={<ChevronDown className="w-5 h-5 text-white" />}
                      />
                      <CustomButton
                        name="Generate Report"
                        className="w-[142px] h-[39px] bg-blue-600 text-white text-base font-semibold rounded-[8px] shadow-sm flex items-center justify-between px-4 py-2"
                        icon={<ChevronDown className="w-5 h-5 text-white" />}
                      />
                      <CustomButton
                        name="Generate Report"
                        className="w-[142px] h-[39px] bg-blue-600 text-white text-base font-semibold rounded-[8px] shadow-sm flex items-center justify-between px-4 py-2"
                        icon={<ChevronDown className="w-5 h-5 text-white" />}
                      />
                    </div>
                  </div>
 <h2 className="text-base sm:text-[16px] font-medium text-gray-900 ">
                      Department Progress
                    </h2>
                  {/* Department Progress */}
                  
                   
                    <div className="space-y-4">
                      {departments.map((dept, index) => (
                        <DepartmentProgressItem
                          key={index}
                          name={dept.name}
                          totalFields={dept.totalFields}
                          completed={dept.completed}
                        />
                      ))}
                    
                  </div>
                </div>

                {/* Recent Updates */}
                <div className="w-full xl:w-[440px]">
                  <div className="h-full rounded-[8px] bg-white p-4 sm:p-6">
                    <h2 className="text-base sm:text-[16px] font-medium text-gray-900 mb-5">
                      Recent Updates
                    </h2>
                    <div className="space-y-2">
                      {recentUpdates.map((update, index) => (
                        <RecentUpdateItem
                          key={index}
                          description={update.description}
                          timestamp={update.timestamp}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
             <div className="w-full lg:w-[360px] flex flex-col gap-4">
              <BRSRCompletionStatusCard data={progressData} />
             
               <div className="bg-white w-full lg:w-[360px] rounded-[8px] p-4 flex-1">
                <AIAssistant />
              </div>
               
            
            </div>
              
          </div>
        </div>
      </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;