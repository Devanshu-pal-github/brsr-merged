import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSubmodulesByModuleIdQuery } from '../api/apiSlice';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import SubHeader from '../components/SubHeader';
import WorkforceQuestion from '../components/WorkforceQuestion';
import QuestionnaireItem from '../components/QuestionItem';

const DynamicEntityDetails = () => {
    const { moduleId } = useParams();

    // Fetch submodules for this moduleId
    const { data: submodules = [], isLoading, isError, error } = useGetSubmodulesByModuleIdQuery(moduleId);

    // Get submodule names for tabs
    const tabs = submodules.map(submodule => submodule.submodule_name) || [];
    
    // Set active tab state
    const [activeTab, setActiveTab] = useState(tabs[0] || '');

    // Find current submodule
    const currentSubmodule = submodules.find(submodule => submodule.submodule_name === activeTab);

    // Debug logs
    console.log('URL moduleId:', moduleId);
    console.log('Submodules:', submodules);
    console.log('Available Tabs:', tabs);
    console.log('Active Tab:', activeTab);
    console.log('Current Submodule:', currentSubmodule);

    // Render submodule content
    const renderSubmodule = (submodule) => {
        if (!submodule) {
            return (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="text-gray-500">No content available for this submodule</div>
                </div>
            );
        }

        return (
            <div className="flex flex-col space-y-[10px]">
                {submodule.question_categories?.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-[#000D30]">
                            {category.category_name || 'Unnamed Category'}
                        </h3>
                        <div className="space-y-4">
                            {category.questions?.length > 0 ? (
                                category.questions.map((question) => (
                                    <WorkforceQuestion 
                                        key={question.question_id} 
                                        question={question.question}
                                    >
                                        <QuestionnaireItem
                                            question={question}
                                            answer=""
                                            isDropdownOpen={false}
                                            onUpdate={(updatedData) => {
                                                console.log('Updated:', updatedData);
                                                // TODO: Implement update logic
                                            }}
                                            onAIAssistantClick={() => {
                                                console.log('AI Assistant clicked for:', question.question_id);
                                                // TODO: Implement AI assistant logic
                                            }}
                                        />
                                    </WorkforceQuestion>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">No questions available in this category</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Breadcrumb */}
                <div className="h-25 w-full">
                    <div className="fixed top-[30px] ml-0.5 z-10 w-full">
                        <Breadcrumb 
                            section="Entity Details" 
                            activeTab={activeTab} 
                        />
                    </div>
                </div>

                {/* Submodule Tabs and Content */}
                <div className="mt-[10px] pt-[10px] mx-2">
                    <div className="w-full flex flex-col space-y-[10px]">
                        {/* Tabs */}
                        <div className="h-10 w-full">
                            <div className="fixed top-[140px] ml-0.5 z-10 w-[calc(100%-230px)]">
                                <SubHeader 
                                    tabs={tabs} 
                                    activeTab={activeTab} 
                                    onTabChange={setActiveTab} 
                                />
                            </div>
                        </div>
                        
                        {/* Content Area */}
                        <div className="mt-[180px] px-4">
                            {isLoading && (
                                <div className="flex items-center justify-center min-h-[40vh] text-gray-500">
                                    Loading submodules...
                                </div>
                            )}
                            {isError && (
                                <div className="flex items-center justify-center min-h-[40vh] text-red-500">
                                    Error loading submodules: {error?.error || 'Unknown error'}
                                </div>
                            )}
                            {!isLoading && !isError && (
                                currentSubmodule ? (
                                    renderSubmodule(currentSubmodule)
                                ) : (
                                    <div className="flex items-center justify-center min-h-[40vh]">
                                        <div className="text-gray-500">Select a submodule to view content</div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DynamicEntityDetails;