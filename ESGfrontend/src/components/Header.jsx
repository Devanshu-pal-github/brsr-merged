import { useState, useEffect } from 'react';
import { Menu, ChevronDown, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeListPopup from '../pages/PlantPages/employeeListPopup';
import NotifyPopup from '../components/common/NotifyPopup';
import NotificationPanel from '../components/common/notificationPanel';

const Header = ({ toggleSidebar, showHamburger, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [selectedFY, setSelectedFY] = useState(() => {
        return localStorage.getItem('financial_year') || '2025-26';
    });
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || 'User';
    });
    const [isFYDropdownOpen, setIsFYDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [fiscalYears, setFiscalYears] = useState([]);
    const [showNotifyPopup, setShowNotifyPopup] = useState(false);

    // Fetch financial years from API
    useEffect(() => {
        const fetchFiscalYears = async () => {
            try {
                const response = await fetch('/api/fiscal-years'); // Replace with your actual API endpoint
                const data = await response.json();
                setFiscalYears(data.fiscalYears || []); // Adjust based on your API response structure
                const financialYearFromToken = localStorage.getItem('financial_year');
                if (financialYearFromToken && !data.fiscalYears.includes(financialYearFromToken)) {
                    setFiscalYears([...data.fiscalYears, financialYearFromToken].sort());
                }
            } catch (error) {
                console.error('Error fetching fiscal years:', error);
            }
        };
        fetchFiscalYears();
    }, []);

    // Update localStorage when financial year changes
    const selectFY = (year) => {
        setSelectedFY(year);
        localStorage.setItem('financial_year', year);
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
            navigate('/login');
        }
    }, [navigate]);

    // Extract user initials for the avatar
    const getUserInitials = (name) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const [showEmployeeList, setShowEmployeeList] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="w-full flex items-center justify-between px-3 md:px-5 h-[48px] bg-[#000D30] shadow-md border-b z-40">
            <div className="flex items-center gap-4">
                {showHamburger && (
                    <button
                        className="text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors lg:hidden"
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <Menu className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
                    </button>
                )}
                <div className="relative">
                    <button
                        onClick={toggleFYDropdown}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-[#FFFFFF] font-medium bg-[#20305D] border border-gray-200 shadow-sm hover:bg-[#345678] transition-colors"
                    >
                        <span>FY {selectedFY}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isFYDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isFYDropdownOpen && fiscalYears.length > 0 && (
                        <ul className="absolute top-12 left-0 w-32 sm:w-40 bg-white rounded-[8px] shadow-lg z-50 overflow-hidden">
                            {fiscalYears.map((year) => (
                                <li
                                    key={year}
                                    onClick={() => selectFY(year)}
                                    className={`px-4 py-2 text-[#000D30] text-[12px] cursor-pointer hover:bg-[#20305D] hover:text-white font-medium transition-colors ${selectedFY === year ? 'bg-[#FFFFFF]' : ''}`}
                                >
                                    FY {year}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <button
                onClick={() => setShowEmployeeList(true)}
                className="lg:flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-[#FFFFFF] font-medium bg-[#20305D] border border-gray-200 shadow-sm hover:bg-[#345678] transition-colors cursor-pointer ml-auto mr-3"
            >
                Manage Access
            </button>
            <div className="flex items-center gap-4">
            <div className="relative">
                    <button
                        onClick={() => setShowNotifications((prev) => !prev)}
                        className="relative text-[#FFFFFF] focus:outline-none hover:text-gray-300 transition-colors cursor-pointer"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    {/* Notification Panel */}
                    <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                </div>
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
                    {isUserDropdownOpen && (
                        <ul className="absolute right-0 mt-2 w-36 sm:w-44 bg-[#000D30] rounded-md shadow-md z-50 overflow-hidden">
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => {
                                    navigate('/landing');
                                    setIsUserDropdownOpen(false);
                                }}
                            >
                                Go to Landing Page
                            </li>
                          
                     
                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => {
                                    navigate('/audit');
                                    setIsUserDropdownOpen(false);
                                }}
                            >
                                Audit Logs
                            </li>

                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => {
                                    setShowNotifyPopup(true);
                                    setIsUserDropdownOpen(false);
                                }}
                            >
                                Notify
                            </li>



                            <li
                                className="px-4 py-2 text-[12px] text-white cursor-pointer hover:bg-[#20305D] transition-colors"
                                onClick={() => {
                                    localStorage.clear();
                                    navigate('/login');
                                    setIsUserDropdownOpen(false);
                                }}
                            >
                                Logout
                            </li>
                        </ul>
                    )}
                </div>
            </div>
            {showEmployeeList && (
                <EmployeeListPopup onClose={() => setShowEmployeeList(false)} />
            )}
            {showNotifyPopup && (
                <NotifyPopup onClose={() => setShowNotifyPopup(false)} />
            )}
        </div>
    );
};

export default Header;