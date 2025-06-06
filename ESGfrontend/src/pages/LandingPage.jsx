import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, Bell } from 'lucide-react';

const NewLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F4F5] font-sans text-[#1A1A1A]">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="h-[48px] min-h-[40px] max-h-[60px] bg-[#000D30] shadow-md flex items-center z-40 px-4 justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              className="text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Back to BRSR Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-1.5 bg-[#20305D] text-white rounded-md text-sm hover:bg-[#345678] transition-colors"
            >
              Back to BRSR
            </button>

            {/* Notifications */}
            <button className="relative text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#20305D] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {localStorage.getItem('user_name')?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-[#1A2341] mb-6">Welcome to Landing Page</h1>
            {/* Add your content here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample content cards */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">Section 1</h2>
                <p className="text-gray-600">Content for section 1</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">Section 2</h2>
                <p className="text-gray-600">Content for section 2</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold mb-2">Section 3</h2>
                <p className="text-gray-600">Content for section 3</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <NewLayout>
      {/* Content will be added here */}
    </NewLayout>
  );
};

export default LandingPage;
