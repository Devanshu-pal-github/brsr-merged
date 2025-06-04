import { useState } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import SubHeader from "../../components/SubHeader";
import WorkforceQuestion from "../../components/WorkforceQuestion";
import GenderRatioChart from "../../components/RatioChart";
import InclusionRate from "../../components/InclusionRate";
import ProgressCard from "../../components/ProgressCard";
import AIAssistant from "../../components/WorkforceAi";
import Layout from "../../components/Layout";
import QuestionnaireItem from "../../components/QuestionItem";
import workforceModules from "../../data.json";

// Submodule components
const WorkforceDetails = ({ submodule, onUpdate = () => {} }) => (
  <div className="flex flex-col space-y-[10px]">
     {submodule.questions.map((question, index) => (
      <WorkforceQuestion key={index} question={question.name}>
        <div className="flex items-start gap-6 flex-wrap xl:flex-nowrap">
          <div className="w-full xl:w-auto">
            <QuestionnaireItem
              question={question.name}
              answer=""
            />
          </div>
        </div>
      </WorkforceQuestion>
    ))}
  </div>
);

const EquityDiversityInclusion = () => (
  <div className="flex flex-col space-y-[10px]">
    <WorkforceQuestion question="Diversity and Inclusion">
      <div className="flex flex-col gap-4">
        <QuestionnaireItem
          question="Details on diversity and inclusion initiatives"
          answer=""
        />
      </div>
    </WorkforceQuestion>
  </div>
);

const HealthSafety = () => (
  <div className="flex flex-col space-y-[10px]">
    <WorkforceQuestion question="Health & Safety">
      <div className="flex flex-col gap-4">
        <QuestionnaireItem
          question="Details on health and safety measures"
          answer=""
        />
      </div>
    </WorkforceQuestion>
  </div>
);

const HRDevelopment = () => (
  <div className="flex flex-col space-y-[10px]">
    <WorkforceQuestion question="HR Development">
      <div className="flex flex-col gap-4">
        <QuestionnaireItem
          question="Details on HR development programs"
          answer=""
        />
      </div>
    </WorkforceQuestion>
  </div>
);

const LaborPractices = () => (
  <div className="flex flex-col space-y-[10px]">
    <WorkforceQuestion question="Labor Practices">
      <div className="flex flex-col gap-4">
        <QuestionnaireItem
          question="Details on labor practices"
          answer=""
        />
      </div>
    </WorkforceQuestion>
  </div>
);

const Workforce = () => {
  const [activeTab, setActiveTab] = useState("Workforce Details");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const submoduleId = queryParams.get('submoduleId') || '1';
  
  const submodule = workforceModules.find(m => m.id === submoduleId);

  const handleUpdate = (questionName, updatedData) => {
    console.log('Updating:', questionName, updatedData);
  };

  return (
    <Layout>
      <div className="relative min-h-screen w-full bg-[#F2F4F5]">
        {/* Fixed Breadcrumb */}
        <div className="fixed top-[60px] left-0 right-0 z-30 bg-[#F2F4F5] border-b border-gray-100 px-4 md:px-8" style={{height:'56px'}}>
          <div className="max-w-7xl mx-auto">
            <Breadcrumb section={submodule.name} activeTab={activeTab} />
          </div>
        </div>

        {/* Fixed SubHeader (Tabs) */}
        <div className="fixed top-[116px] left-0 right-0 z-30 bg-[#F2F4F5] border-b border-gray-100 px-4 md:px-8" style={{height:'48px'}}>
          <div className="max-w-7xl mx-auto">
            <SubHeader tabs={["Workforce Details", "Equity, Diversity & Inclusion", "Health & Safety"]} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex w-full max-w-7xl mx-auto pt-[172px] pb-8 px-4 md:px-8 gap-6">
          {/* Main Scrollable Content */}
          <div className="flex-1 min-w-0">
            <div className="overflow-y-auto rounded-lg bg-transparent" style={{maxHeight:'calc(100vh - 180px)'}}>
              {activeTab === "Workforce Details" && submodule && (
                <WorkforceDetails submodule={submodule} onUpdate={handleUpdate} />
              )}
              {activeTab === "Equity, Diversity & Inclusion" && <EquityDiversityInclusion />}
              {activeTab === "Health & Safety" && <HealthSafety />}
            </div>
          </div>

          {/* Fixed Right Panel: Progress + AI Assistant */}
          <div className="hidden xl:flex flex-col gap-4 w-[320px] shrink-0 sticky top-[172px] h-fit">
            <ProgressCard covered={14} total={20} />
            <AIAssistant />
          </div>
        </div>

        {/* Responsive: Right Panel below on small screens */}
        <div className="xl:hidden max-w-7xl mx-auto px-4 md:px-8 pb-8 flex flex-col gap-4">
          <ProgressCard covered={14} total={20} />
          <AIAssistant />
        </div>

        <style>{`
          html, body, #root {
            font-family: 'Inter', 'sans-serif';
            background: #F2F4F5;
            color: #1A1A1A;
          }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </Layout>
  );
};

export default Workforce;