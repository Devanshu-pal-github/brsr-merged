import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
import { useGetModuleAccessQuery, useGetModuleDetailsMutation, useGetSubmodulesByModuleIdQuery, useGetQuestionResponsesMutation } from '../api/apiSlice';

const Sidebar = ({ isOpen, onClose }) => {
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [getQuestionResponses] = useGetQuestionResponsesMutation();

    // Get module access first
    const { data: moduleAccess, isSuccess: moduleAccessSuccess, isError: moduleAccessError, error: moduleAccessErrorDetails } = useGetModuleAccessQuery();
    const [getModuleDetails, { isError: moduleDetailsError, error: moduleDetailsErrorDetails }] = useGetModuleDetailsMutation();
    
    // Query for submodules when a module is selected
    const { data: submodules, isLoading: isLoadingSubmodules } = useGetSubmodulesByModuleIdQuery(selectedModuleId, {
        skip: !selectedModuleId // Skip the query if no module is selected
    });

    // Fetch module details when we have module access
    useEffect(() => {
        const fetchModuleNames = async () => {
            console.log('🔄 Sidebar: Checking for stored module IDs...');
            const storedModuleIds = localStorage.getItem("module_ids");
            
            if (storedModuleIds) {
                try {
                    // Only fetch module names instead of full details
                    const moduleIds = JSON.parse(storedModuleIds);
                    console.log('🔄 Sidebar: Fetching module names for IDs:', moduleIds);
                    const response = await fetch('http://localhost:8000/modules/names', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                        body: JSON.stringify(moduleIds)
                    });
                    const result = await response.json();
                    console.log('📥 Sidebar: Raw module names response:', result);
                    if (result?.modules && Array.isArray(result.modules)) {
                        // Log each module for debugging
                        result.modules.forEach((mod, idx) => {
                            // Log the module object for debugging
                            console.log(`📦 Sidebar: Module[${idx}] raw:`, mod);
                            // Use 'name' instead of 'module_name' for the new endpoint
                            console.log(`📦 Sidebar: Module[${idx}] - id: ${mod.id || mod._id}, name: ${mod.name}`);
                        });
                        setModules(result.modules);
                    } else {
                        console.warn('⚠️ Sidebar: No modules found in response or response format invalid', result);
                    }
                } catch (error) {
                    console.error('❌ Sidebar: Error fetching module names:', error);
                }
            } else {
                console.warn('⚠️ Sidebar: No module IDs found in localStorage');
            }
        };

        if (moduleAccessSuccess) {
            setTimeout(fetchModuleNames, 100);
        }

        if (moduleAccessError) {
            console.error('❌ Sidebar: Module access error:', moduleAccessErrorDetails);
        }
    }, [moduleAccessSuccess, moduleAccessError, getModuleDetails]);

    // Log module rendering
    useEffect(() => {
        if (modules.length > 0) {
            console.log('📱 Sidebar: Rendering modules:', modules.map(m => m.module_name).join(', '));
        }
    }, [modules]);

    // Log submodules when they are fetched
    useEffect(() => {
        if (submodules) {
            console.log('📦 Submodules fetched for module:', selectedModuleId);
            console.log('Submodules data:', submodules);
        }
    }, [submodules, selectedModuleId]);

    // Always open the first submodule when module changes
    useEffect(() => {
        if (submodules && Array.isArray(submodules) && submodules.length > 0 && selectedModuleId) {
            const firstValidSubmodule = submodules.find(
                (sub) => Array.isArray(sub.question_categories) && sub.question_categories.length > 0
            ) || submodules[0];

            if (firstValidSubmodule && firstValidSubmodule.submodule_id) {
                const expectedPath = `/module/${selectedModuleId}/submodule/${firstValidSubmodule.submodule_id}`;
                if (window.location.pathname !== expectedPath) {
                    navigate(expectedPath, { replace: true });
                }
            }
            if (firstValidSubmodule.question_categories) {
                const questionIds = firstValidSubmodule.question_categories
                    .flatMap(cat => Array.isArray(cat.questions) ? cat.questions.map(q => q.question_id) : []);
                if (questionIds.length > 0) {
                    getQuestionResponses(questionIds);
                }
            }
        }
    }, [submodules, getQuestionResponses, selectedModuleId, navigate]);

    // Handle module click without closing sidebar
    const handleModuleClick = (moduleAccessId) => {
        setSelectedModuleId(moduleAccessId);
    };

    // Map icon names to Lucide React components
    const iconMap = {
        LayoutDashboard,
        Building,
        Users,
        ClipboardCheck,
        Leaf,
        FileText,
        BarChart3,
        Menu,
        X
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
    };

    return (
        <div className={`h-screen min-h-full w-full bg-[#000D30] text-[#E5E7EB] transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="pt-3 pb-3 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
                {/* Header */}
                <div className="flex items-center gap-3 pl-5 mb-5">
                    <Building className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <h2 className="text-[1rem] font-bold text-[#E5E7EB]">BRSR</h2>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-1 flex flex-col items-start pl-0">
                        {/* Dashboard */}
                        <li className="w-full">
                            <NavLink
                                to="/dashboard"
                                className={(navData) =>
                                    `flex items-center gap-3 w-full h-[32px] text-[0.92rem] font-medium pl-10 rounded-none transition-colors justify-start ${
                                        navData.isActive
                                            ? 'bg-[#20305D] text-white'
                                            : 'text-[#E5E7EB] hover:bg-[#20305D] hover:text-white'
                                    }`
                                }
                            >
                                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                                <span className="text-left">Dashboard</span>
                            </NavLink>
                        </li>

                        {/* Dynamic Modules */}
                        {modules.map((module) => {
                            const moduleAccessId = module.id || module._id;
                            const IconComponent = iconMap[module.icon] || FileText;
                            return (
                                <li key={moduleAccessId} className="w-full">
                                    <NavLink
                                        to={`/module/${moduleAccessId}`}
                                        className={(navData) =>
                                            `flex items-center gap-3 w-full h-[32px] text-[0.92rem] font-medium pl-10 rounded-none transition-colors justify-start ${
                                                navData.isActive
                                                    ? 'bg-[#20305D] text-white'
                                                    : 'text-[#E5E7EB] hover:bg-[#20305D] hover:text-white'
                                            }`
                                        }
                                        onClick={() => handleModuleClick(moduleAccessId)}
                                    >
                                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-left">{module.name}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="mt-auto px-5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-[0.92rem] font-medium text-[#E5E7EB] hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;