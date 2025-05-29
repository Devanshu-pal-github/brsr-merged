import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Building,
    Users,
    ClipboardCheck,
    Leaf,
    FileText,
    BarChart3,
    Menu,
    X
} from 'lucide-react';
import { selectAllModules } from '../features/modules/moduleSlice';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const modules = useSelector(selectAllModules);

    // Map icon names to Lucide React components
    const iconMap = {
        LayoutDashboard: LayoutDashboard,
        Building: Building,
        Users: Users,
        ClipboardCheck: ClipboardCheck,
        Leaf: Leaf,
        FileText: FileText,
        BarChart3: BarChart3,
        Menu: Menu,
        X: X
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        sessionStorage.clear();
        navigate('/');
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full 
              w-[198px] lg:w-[214px] xl:w-[230px] 
              bg-[#000D30] text-[#E5E7EB] 
              transform transition-transform duration-300 ease-in-out 
              ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
              lg:translate-x-0 z-20`}
            >
                <div className="pt-6 pb-6 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
                    {/* Header */}
                    <div className="flex items-center gap-4 pl-8 mb-8">
                        <Building className="w-6 h-6 text-green-300 flex-shrink-0" />
                        <h2 className="text-[18px] font-bold text-[#E5E7EB]">
                            BRSR
                        </h2>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1">
                        <ul className="space-y-1">
                            {/* Dashboard is always present */}
                            <li>
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 w-full h-[42px] text-[12px] font-medium pl-8 rounded-none transition-colors ${
                                            isActive
                                                ? 'bg-[#20305D] text-white'
                                                : 'text-[#E5E7EB] hover:bg-[#20305D] hover:text-white'
                                        }`
                                    }
                                    onClick={closeSidebar}
                                >
                                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>

                            {/* Dynamic Modules */}
                            {modules.map((module) => {
                                const IconComponent = iconMap[module.icon] || FileText;
                                return (
                                    <li key={module.id}>
                                        <NavLink
                                            to={module.route}
                                            className={({ isActive }) =>
                                                `flex items-center gap-4 w-full h-[42px] text-[12px] font-medium pl-8 rounded-none transition-colors ${
                                                    isActive
                                                        ? 'bg-[#20305D] text-white'
                                                        : 'text-[#E5E7EB] hover:bg-[#20305D] hover:text-white'
                                                }`
                                            }
                                            onClick={closeSidebar}
                                        >
                                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                                            <span>{module.name}</span>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="mt-auto px-8">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 text-[12px] font-medium text-[#E5E7EB] hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={closeSidebar}
            />
        </>
    );
};

export default Sidebar;