import React from 'react';
import PropTypes from 'prop-types';

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#F3F4F6] text-[#1A2341] border-l-2 border-[#1A2341]'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

SidebarItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SidebarItem;
