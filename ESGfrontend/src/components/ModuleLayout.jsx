import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectAllModules } from '../features/modules/moduleSlice';
import Breadcrumb from './Breadcrumb';
import SubHeader from './SubHeader';
import Layout from './Layout';
import ProgressCard from './ProgressCard';
import AIAssistant from './WorkforceAi';

const ModuleLayout = ({ children, renderSubmodule }) => {
    const location = useLocation();
    const modules = useSelector(selectAllModules);
    
    // Find current module based on route
    const currentModule = modules.find(module => 
        module.route === location.pathname
    );

    // If no module is found, show error
    if (!currentModule) {
        return <div>Module not found</div>;
    }

    // Get submodule names for tabs
    const tabs = currentModule.submodules.map(submodule => submodule.submodule_name);
    
    // Set active tab state
    const [activeTab, setActiveTab] = useState(tabs[0] || '');

    // Find current submodule
    const currentSubmodule = currentModule.submodules.find(
        submodule => submodule.submodule_name === activeTab
    );

    return (
        <Layout>
            <div className="module-layout min-h-screen p-2 md:p-3">
                <div className="h-25 w-full">
                    <div className="fixed top-[30px] ml-0.5 z-10 w-full">
                        <Breadcrumb section={currentModule.name} activeTab={activeTab} />
                    </div>
                </div>

                <div className="mt-[10px] pt-[10px] mx-2 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-7/10 flex flex-col space-y-[8px]">
                        <div className="h-10 w-full">
                            <div className="fixed top-[140px] ml-0.5 z-10 custom-width w-[56vw]">
                                <SubHeader 
                                    tabs={tabs} 
                                    activeTab={activeTab} 
                                    onTabChange={setActiveTab} 
                                />
                            </div>
                        </div>
                        <div className="mt-16">
                            {currentSubmodule && renderSubmodule(currentSubmodule)}
                        </div>
                    </div>

                    {/* Right side: progress + assistant */}
                    <div className="md:block fixed top-[140px] right-2 md:right-2 lg:right-10 w-[20%] min-w-[20vw] flex flex-col space-y-2 gap-4">
                        <ProgressCard covered={14} total={20} />
                        <AIAssistant />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ModuleLayout;