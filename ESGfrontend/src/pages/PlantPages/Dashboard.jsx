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
      <div className="min-h-screen flex flex-col gap-[1.5vw] px-[2vw] py-[1vw]" style={{overflow: 'hidden'}}> {/* Responsive padding, no scrollbars */}
        <h1 className="text-[1.1vw] font-semibold text-[#1A2341] mb-[1vw] pl-[0.2vw]">BRSR Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-[1vw]"> {/* Responsive grid gap */}
          {/* Left Section: Main Content */}
          <div className="lg:col-span-3 flex flex-col gap-[1vw]">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {metrics.map((metric, index) => (
                <KPI
                  key={index}
                  label={metric.label}
                  value={metric.value}
                  color={metric.color}
                  className="p-[0.7vw] bg-white rounded-[0.4vw] shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 h-[4vw] min-h-[48px] flex flex-col justify-center min-w-0"
                  labelClassName="text-[0.8vw] text-gray-500 font-medium mb-[0.3vw] leading-tight"
                  valueClassName="text-[1.3vw] font-bold leading-none"
                />
              ))}
            </div>
            {/* Custom Buttons + Department Progress */}
            <div className="flex flex-col xl:flex-row gap-[1vw]">
              <div className="flex-1 flex flex-col gap-[1vw]">
                <div className="rounded-[0.4vw] bg-white p-[0.7vw] shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-wrap items-center gap-[0.7vw]">
                    {['Generate Report', 'View Analytics', 'Generate Report', 'Generate Report'].map((name, index) => (
                      <CustomButton
                        key={index}
                        name={name}
                        className="h-[2vw] min-h-[28px] bg-[#002A85] text-white text-[0.85vw] font-medium rounded-[0.4vw] shadow-sm flex items-center justify-between px-[0.7vw] hover:bg-[#0A2E87] transition-colors duration-200"
                        icon={<ChevronDown className="w-[1vw] h-[1vw] min-w-[14px] min-h-[14px] text-white ml-[0.3vw]" />}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-[0.9vw] font-medium text-[#1A2341] pl-[0.2vw]">Department Progress</h2>
                <div className="space-y-[0.7vw]">
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
              <div className="w-full xl:w-[16vw] min-w-[180px]">
                <div className="h-full rounded-[0.4vw] bg-white p-[0.7vw] shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <h2 className="text-[0.9vw] font-medium text-[#1A2341] mb-[0.7vw]">Recent Updates</h2>
                  <div className="space-y-[0.5vw]">
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
          {/* Right Section: Sidebar */}
          <div className="flex flex-col gap-[1vw]">
            <BRSRCompletionStatusCard data={progressData} />
            <div className="bg-white rounded-[0.4vw] p-[0.7vw] shadow-sm hover:shadow-md transition-shadow duration-200">
              <AIAssistant />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;