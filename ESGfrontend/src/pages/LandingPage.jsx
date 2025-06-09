import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings, FileText, AlertCircle, FileBarChart } from 'lucide-react';
import { GeneralDetails, Policy, Grievance, Disclosures } from '../features/company/components/TabContents';

// Create a sidebar item component
const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#F3F4F6] text-[#1A2341]'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

// Render function that returns the appropriate component based on active tab
const renderContent = (activeTab) => {
  switch (activeTab) {
    case 'General Details':
      return <GeneralDetails />;
    case 'Policy and Management':
      return <Policy />;
    case 'Governance Leadership and Oversight':
      return <Grievance />;
    case 'Policy Review':
      return <Disclosures />;
    default:
      return <GeneralDetails />;
  }
};

const NewLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('General Details');
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const sidebarItems = [
    { icon: Settings, label: 'General Details' },
    { icon: FileText, label: 'Policy and Management' },
    { icon: AlertCircle, label: 'Governance Leadership and Oversight' },
    { icon: FileBarChart, label: 'Policy Review' },
  ];

  const handleNavigateBack = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F4F5] font-sans text-[#1A1A1A]">
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="h-[48px] min-h-[40px] max-h-[60px] bg-[#000D30] shadow-md flex items-center z-40 px-4 justify-between">
          <div className="flex items-center gap-4">
            <button
              className="text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleNavigateBack}
              className="px-4 py-1.5 bg-[#20305D] text-white rounded-md text-sm hover:bg-[#345678] transition-colors"
            >
              Back to BRSR
            </button>

            <button className="relative text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#20305D] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {localStorage.getItem('user_name')?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex-1 overflow-auto">
          <div className="w-screen mx-auto px-8 py-6 flex gap-8">
            {/* Floating Sidebar */}
            <div className={`w-[190px] shrink-0 transition-all duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                {sidebarItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeTab === item.label}
                    onClick={() => setActiveTab(item.label)}
                  />
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[80vw]">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-xl font-semibold text-[#1A2341] mb-4">{activeTab}</h1>
                {renderContent(activeTab)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return <NewLayout />;
};

export default LandingPage;
