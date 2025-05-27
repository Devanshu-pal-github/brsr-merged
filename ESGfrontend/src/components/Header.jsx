import { useState } from 'react';
import { Menu, ChevronDown, Bell } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const [selectedFY, setSelectedFY] = useState('2025-26');
    const [isFYDropdownOpen, setIsFYDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const fiscalYears = [
        '2020-21',
        '2021-22',
        '2022-23',
        '2023-24',
        '2024-25',
        '2025-26'
    ];

    const toggleFYDropdown = () => {
        setIsFYDropdownOpen(!isFYDropdownOpen);
    };

    const selectFY = (year) => {
        setSelectedFY(year);
        setIsFYDropdownOpen(false);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    return (
    <div
  className="fixed top-0 right-0 left-[230px] bg-white flex items-center justify-between px-4 shadow-md z-40"
  style={{ height: '55px' }}
>

            <div className="flex items-center gap-4">
                {/* Hamburger Menu (Mobile only) */}
                <button
                    className="lg:hidden text-[#000D30] focus:outline-none"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Fiscal Year Dropdown */}
                <div className="relative">
                    <button
                        onClick={toggleFYDropdown}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-[#000D30] font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-100"
                    >
                        <span>FY {selectedFY}</span>
                        <ChevronDown className="w-5 h-5" />
                    </button>
                    {isFYDropdownOpen && (
                        <ul className="absolute top-12 left-0 w-32 sm:w-40 bg-white rounded-[8px] shadow-lg z-[60]">
                            {fiscalYears.map((year) => (
                                <li
                                    key={year}
                                    onClick={() => selectFY(year)}
                                    className={`px-4 py-2 text-[#000D30] text-[12px] cursor-pointer hover:bg-[#20305D] hover:text-white font-medium ${
                                        selectedFY === year ? 'bg-[#FFFFFF]' : ''
                                    }`}
                                >
                                    FY {year}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Right: Notifications & User Profile */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative text-[#20305D] focus:outline-none">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                </button>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        onClick={toggleUserDropdown}
                        className="flex items-center gap-2 focus:outline-none"
                    >
                        <div className="w-8 h-8 bg-[#20305D] rounded-full flex items-center justify-center text-white text-[12px] font-semibold">
                            JS
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                            <span className="text-[#20305D] text-[12px] font-medium">John Smith</span>
                            <ChevronDown className="w-5 h-5 text-[#000D30]" />
                        </div>
                    </button>

                    {isUserDropdownOpen && (
                        <ul className="absolute right-0 mt-2 w-36 sm:w-44 bg-[#000D30] rounded-md shadow-md z-20">
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D]"
                                onClick={() => setIsUserDropdownOpen(false)}
                            >
                                Profile
                            </li>
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D]"
                                onClick={() => setIsUserDropdownOpen(false)}
                            >
                                Settings
                            </li>
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D]"
                                onClick={() => setIsUserDropdownOpen(false)}
                            >
                                Logout
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
