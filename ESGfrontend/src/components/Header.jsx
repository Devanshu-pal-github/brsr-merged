import { useState, useEffect } from 'react';
import { Menu, ChevronDown, Bell } from 'lucide-react';

const Header = ({ toggleSidebar, showHamburger, isSidebarOpen }) => {
    // Initialize financial year and user name from localStorage
    const [selectedFY, setSelectedFY] = useState(() => {
        return localStorage.getItem('financial_year') || '2025-26'; // Fallback if not in localStorage
    });
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || 'User'; // Fallback if not in localStorage
    });

    
    const [isFYDropdownOpen, setIsFYDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    // List of fiscal years (can be extended dynamically if needed)
    const fiscalYears = [
        '2020-21',
        '2021-22',
        '2022-23',
        '2023-24',
        '2024-25',
        '2025-26',
    ];

    // Add the financial year from localStorage to fiscalYears if not already present
    const financialYearFromToken = localStorage.getItem('financial_year');
    if (financialYearFromToken && !fiscalYears.includes(financialYearFromToken)) {
        fiscalYears.push(financialYearFromToken);
        fiscalYears.sort(); // Sort to maintain chronological order
    }

    // Update localStorage when financial year changes
    const selectFY = (year) => {
        setSelectedFY(year);
        localStorage.setItem('financial_year', year); // Persist the selected financial year
        setIsFYDropdownOpen(false);
    };

    const toggleFYDropdown = () => {
        setIsFYDropdownOpen(!isFYDropdownOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    // Redirect to login if no token is present
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
        }
    }, []);

    // Extract user initials for the avatar
    const getUserInitials = (name) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="w-full flex items-center justify-between px-3 md:px-5 h-[48px] bg-[#000D30] shadow-md border-b z-40">
            <div className="flex items-center gap-4">
                {/* Hamburger Menu - Only show on mobile */}
                {showHamburger && (
                    <button
                        className="text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors lg:hidden"
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <Menu className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
                    </button>
                )}

                {/* Fiscal Year Dropdown */}
                <div className="relative">
                    <button
                        onClick={toggleFYDropdown}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-[#FFFFFF] font-medium bg-[#20305D] border border-gray-200 shadow-sm hover:bg-[#345678] transition-colors"
                    >
                        <span>FY {selectedFY}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isFYDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* FY Dropdown Menu */}
                    {isFYDropdownOpen && (
                        <ul className="absolute top-12 left-0 w-32 sm:w-40 bg-white rounded-[8px] shadow-lg z-50 overflow-hidden">
                            {fiscalYears.map((year) => (
                                <li
                                    key={year}
                                    onClick={() => selectFY(year)}
                                    className={`px-4 py-2 text-[#000D30] text-[12px] cursor-pointer hover:bg-[#20305D] hover:text-white font-medium transition-colors ${
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
                <button className="relative text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors">
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

                    {/* User Dropdown Menu */}
                    {isUserDropdownOpen && (
                        <ul className="absolute right-0 mt-2 w-36 sm:w-44 bg-[#000D30] rounded-md shadow-md z-50 overflow-hidden">                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => {
                                    window.location.href = '/landing';
                                    setIsUserDropdownOpen(false);
                                }}
                            >
                                Go to Landing Page
                            </li>
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                            >
                                Settings
                            </li>
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => {
                                    // Clear localStorage and redirect to login on logout
                                    localStorage.clear();
                                    window.location.href = '/login';
                                    setIsUserDropdownOpen(false);
                                }}
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