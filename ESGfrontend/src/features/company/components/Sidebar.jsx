import React from 'react';
import PropTypes from 'prop-types';
import { Settings, FileText, AlertCircle, FileBarChart } from 'lucide-react';
import SidebarItem from './SidebarItem';

const sidebarItems = [
  { icon: Settings, label: 'General Details' },
  { icon: FileText, label: 'Policy and Management' },
  { icon: AlertCircle, label: 'Governance Leadership and Oversight' },
  { icon: FileBarChart, label: 'Policy Review' },
];

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-[190px] shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.label}
            onClick={() => onTabChange(item.label)}
          />
        ))}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Sidebar;
