import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const CompanyLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('General Details');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F4F5] font-sans text-[#1A1A1A]">
      {/* Main Content Area with Header */}
      <div className="flex flex-col flex-1">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content with Sidebar */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-6 flex gap-8">
            {/* Floating Sidebar */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            <div className="flex-1 max-w-4xl">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-xl font-semibold text-[#1A2341] mb-4">{activeTab}</h1>
                {children && children(activeTab)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CompanyLayout.propTypes = {
  children: PropTypes.func.isRequired,
};

export default CompanyLayout;
