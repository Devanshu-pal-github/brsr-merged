import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { selectAllModules } from '../features/modules/moduleSlice';
import Layout from './Layout';
import Breadcrumb from './Breadcrumb';
import SubHeader from './SubHeader';
import ProgressCard from './ProgressCard';
import AIAssistant from './WorkforceAi';
import QuestionnaireItem from './QuestionItem';
import QuestionCategory from './QuestionCategory';

const DynamicModulePage = () => {
    const location = useLocation();
    const modules = useSelector(selectAllModules);
     const [activeTab, setActiveTab] = useState(tabs[0] || '');
    // Find current module based on route
    const currentModule = modules.find(module => 
        module.route === location.pathname
    );

    // If no module is found, show error
    if (!currentModule) {
        return <div>Module not found</div>;
    }

    // Get submodule names for tabs
    const tabs = currentModule.submodules?.map(submodule => submodule.submodule_name) || [];
    
    // Set active tab state
   

    // Find current submodule
    const currentSubmodule = currentModule.submodules?.find(
        submodule => submodule.submodule_name === activeTab
    );

    // Log for debugging
    console.log('Current Module:', currentModule);
    console.log('Submodules:', currentModule.submodules);
    console.log('Tabs:', tabs);
    console.log('Active Tab:', activeTab);
    console.log('Current Submodule:', currentSubmodule);

    // Handle question updates
    const handleUpdate = (questionId, updatedData) => {
        console.log('Updating question:', questionId, 'with data:', updatedData);
        // Here you would typically dispatch an action to update the data in Redux
    };

    // Render question based on its type
    const renderQuestion = (question) => {
        return (
            <QuestionnaireItem
                key={question.question_id}
                question={question}
                onUpdate={(questionId, data) => handleUpdate(questionId, data)}
            />
        );
    };

    // Render current submodule content
    const renderSubmoduleContent = (submodule) => {
        return (
            <div className="flex flex-col space-y-[10px]">
                {submodule.question_categories?.map((category) => (
                    <QuestionCategory
                        key={category.id}
                        category={category}
                        renderQuestion={renderQuestion}
                    />
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="dynamic-module-page min-h-screen p-2 md:p-3">
                <div className="h-25 w-full">
                    <div className="fixed top-[30px] ml-0.5 z-10 w-full">
                        <Breadcrumb section={currentModule.name} activeTab={activeTab} />
                    </div>
                </div>

                <div className="mt-[10px] pt-[10px] mx-2 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-7/10 flex flex-col space-y-[10px]">
                        <div className="h-10 w-full">
                            <div className="fixed top-[140px] ml-0.5 z-10 custom-width w-[56vw]">
                                <SubHeader 
                                    tabs={tabs} 
                                    activeTab={activeTab} 
                                    onTabChange={setActiveTab} 
                                />
                            </div>
                        </div>
                        
                        {/* Main content area with proper scrolling */}
                        <div 
                            className="fixed top-[150px] left-0 z-10 overflow-y-auto hide-scrollbar ml-[273px] mr-[100px] mt-[40px]"
                            style={{ height: "calc(100vh - 150px)", width: "calc(100% - 42vw)" }}
                        >
                            {currentSubmodule && renderSubmoduleContent(currentSubmodule)}
                        </div>
                    </div>

                    {/* Right side: progress + assistant */}
                    <div className="md:block fixed top-[140px] right-2 md:right-2 lg:right-10 w-[20%] min-w-[20vw] flex flex-col space-y-2 gap-6">
                        <ProgressCard covered={14} total={20} />
                        <AIAssistant />
                    </div>
                </div>

                {/* Styles for hiding scrollbar */}
                <style>
                    {`
                        .hide-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .hide-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}
                </style>
            </div>
        </Layout>
    );
};

export default DynamicModulePage;