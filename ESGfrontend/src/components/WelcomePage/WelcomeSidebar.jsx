import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Building, Settings, HelpCircle } from 'lucide-react';

const WelcomeSidebar = () => {
    const navigate = useNavigate();
    
    const menuItems = [
        { icon: FileText, label: 'General Details', path: '/general' },
        { icon: Settings, label: 'Policies and Governance', path: '/policies' },
        { icon: HelpCircle, label: 'Help & Support', path: '#' }
    ];

    return (
        <div className="h-screen min-h-full w-full bg-[#000D30] text-[#E5E7EB] transition-all duration-300 ease-in-out">
            <div className="pt-3 pb-3 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
                {/* Header */}
                <div className="flex items-center gap-3 pl-5 mb-5">
                    <h2 className="text-[1rem] font-bold text-[#E5E7EB]">Quick Navigation</h2>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-1 flex flex-col items-start pl-0">
                        {menuItems.map((item, index) => (
                            <li key={index} className="w-full">
                                <NavLink
                                    to={item.path}
                                    className={(navData) =>
                                        `flex items-center gap-3 w-full h-[32px] text-[0.92rem] font-medium pl-10 rounded-none transition-colors justify-start ${
                                            navData.isActive
                                                ? 'bg-[#20305D] text-white'
                                                : 'text-[#E5E7EB] hover:bg-[#20305D] hover:text-white'
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-left">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default WelcomeSidebar;
