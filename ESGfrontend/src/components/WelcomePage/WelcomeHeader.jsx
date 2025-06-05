import { useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';

const WelcomeHeader = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userName = localStorage.getItem('user_name') || 'User';

    const getUserInitials = (name) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    return (
        <div className="w-full flex items-center justify-between px-3 md:px-5 h-[48px] bg-[#000D30] shadow-md border-b z-40">
            {/* Left side - welcome message */}
            <div className="flex items-center">
                <span className="text-white text-sm">Welcome to BRSR</span>
            </div>

            {/* Right side - user profile and notifications */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-1 text-white hover:bg-[#20305D] rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                </button>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={toggleUserDropdown}
                        className="flex items-center gap-2 focus:outline-none group"
                    >
                        <div className="w-8 h-8 bg-[#20305D] rounded-full flex items-center justify-center text-white text-[12px] font-semibold group-hover:bg-[#345678] transition-colors">
                            {getUserInitials(userName)}
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                            <span className="text-[#FFFFFF] text-[12px] font-medium">{userName}</span>
                            <ChevronDown className={`w-5 h-5 text-[#FFFFFF] transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                        <ul className="absolute right-0 mt-2 w-36 sm:w-44 bg-[#000D30] rounded-md shadow-md z-50 overflow-hidden">
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                            >
                                My Profile
                            </li>
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                            >
                                Settings
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WelcomeHeader;
