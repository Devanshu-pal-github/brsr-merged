import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <header className="h-[48px] min-h-[40px] max-h-[60px] bg-[#000D30] shadow-md flex items-center z-40 px-4 justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          className="text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors"
          onClick={onMenuClick}
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
  );
};

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default Header;
