import { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to get the current route
import Breadcrumb from "../../components/Breadcrumb";
import SubHeader from "../../components/SubHeader";
import WorkforceQuestion from "../../components/WorkforceQuestion";
import TableCard from "../../components/TableComponent";
import GenderRatioChart from "../../components/RatioChart";
import InclusionRate from "../../components/InclusionRate";
import DuoTableComponent from "../../components/DuoTableComponent";
import ProgressCard from "../../components/ProgressCard";
import AIAssistant from "../../components/WorkforceAi";
import Layout from "../../components/Layout";
import QuestionnaireItem from "../../components/QuestionItem";
import BigTable from "../../components/BigTable";
import workforceModules from "../../data.json"; // Import the JSON file

// Submodule components
const WorkforceDetails = ({ submodule, onUpdate = () => {} }) => (
  <div className="flex flex-col space-y-[10px]">
     {submodule.questions.map((question, index) => (
      <WorkforceQuestion key={index} question={question.name}>
        {question.type === "table" && (
          <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
            <div className="flex-[2] min-w-[260px] shrink-0">
              <BigTable
                title={question.content.title}
                fields={question.content.fields}
                rows={question.content.rows}
                onEditClick={
                  question.content.onEditClick ? () => console.log("Edit clicked") : undefined
                }
                onUpdate={(updatedRows) => onUpdate(question.name, updatedRows)}
              />
            </div>
            {question.name === "Employees and Workers Details" ||
            question.name === "Differently Abled Employees and Workers" ? (
              <div className="flex-[1] min-w-[160px] mt-6 xl:mt-10 shrink-0">
                <GenderRatioChart />
              </div>
            ) : null}
          </div>
        )}
        {question.name === "Participation/Inclusion of Women" && (
          <div className="flex items-start gap-6 flex-wrap xl:flex-nowrap">
            <div className="w-full xl:w-auto">
              <InclusionRate />
            </div>
          </div>
        )}
        {question.name === "Turnover Rate" && (
          <div className="flex items-start gap-6 flex-wrap xl:flex-nowrap">
            <div className="w-full xl:w-auto">
              <DuoTableComponent
                title={question.content.title}
                fields={question.content.fields}
                rows={question.content.rows}
                onEditClick={question.content.onEditClick ? () => console.log("Edit clicked") : undefined}
                onUpdate={(updatedRows) => onUpdate(question.name, updatedRows)}
              />
            </div>
          </div>
        )}
      </WorkforceQuestion>
    ))}
  </div>
);

const EmployeeWellbeing = ({ submodule }) => (
  <div className="flex flex-col space-y-[10px]">
    {submodule.questions.map((question, index) => (
      <WorkforceQuestion key={index} question={question.name}>
        {question.type === "subjective" && (
          <>
            <div className="text-[12px] text-gray-700">{question.content.question}</div>
            {question.content.policyLink && (
              <div className="mt-2">
                <a
                  href={question.content.policyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-blue-600 hover:underline"
                >
                  View Policy
                </a>
              </div>
            )}
            <textarea
              className="w-full mt-2 p-2 border rounded text-[12px]"
              rows="4"
              placeholder="Enter your response here..."
              defaultValue={question.content.answer || ""}
            />
          </>
        )}
      </WorkforceQuestion>
    ))}
  </div>
);

const HumanRights = ({ submodule, onUpdate = () => {} }) => (
  <div className="flex flex-col space-y-[10px]">
    {submodule.questions.map((question, index) => (
      <WorkforceQuestion key={index} question={question.name}>
        {question.type === "subjective" && (
          <>
            {question.name === "Human Rights Policy" ? (
              <QuestionnaireItem
                question={question.content.question}
                answer={question.content.answer || "Yes,"}
                details="Regular safety training conducted, PPE provided to all workers, Emergency response team established, Regular safety audits performed, First aid facilities available 24/7..."
                policyLink={question.content.policyLink}
                onEditClick={() => console.log("Edit clicked")}
              />
            ) : (
              <>
                <div className="text-[12px] text-gray-700">{question.content.question}</div>
                {question.content.policyLink && (
                  <div className="mt-2">
                    <a
                      href={question.content.policyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-blue-600 hover:underline"
                    >
                      View Policy
                    </a>
                  </div>
                )}
                <textarea
                  className="w-full mt-2 p-2 border rounded text-[12px]"
                  rows="4"
                  placeholder="Enter your response here..."
                  defaultValue={question.content.answer || ""}
                />
              </>
            )}
          </>
        )}
      </WorkforceQuestion>
    ))}
  </div>
);

const Others = ({ submodule }) => (
  <div className="flex flex-col space-y-[10px]">
{submodule.questions.map((question, index) => (
      <WorkforceQuestion key={index} question={question.name}>
        {question.type === "subjective" && (
          <QuestionnaireItem
            question={question.content.question || ""}
            answer={question.content.answer || ""}
            details={question.content.details || ""}
            policyLink={question.content.policyLink || ""}
            isDropdownOpen={false}
            onUpdate={(updatedData) =>
              onUpdate(question.name, updatedData)
            }
            onAIAssistantClick={() => console.log("AI Assistant clicked for:", question.name)}
          />
        )}
      </WorkforceQuestion>
    ))}
  </div>
);

const Workforce = () => {
  const location = useLocation(); // Get the current route
  const { modules } = workforceModules;

  // Find the module matching the current route
  const currentPath = location.pathname; // e.g., "/workforce"
  const currentModule = modules.find((module) => module.route === currentPath);

  // Defensive check for currentModule and submodules
  if (!currentModule || !Array.isArray(currentModule.submodules)) {
    console.error("Workforce: Invalid module or submodules", currentModule);
    return <p>Error: Module or submodules not found.</p>;
  }

  // Get submodule names as tabs
  const tabs = currentModule.submodules.map((submodule) => submodule.name);

  // Set the active tab to the first submodule by default
  const [activeTab, setActiveTab] = useState(tabs[0] || "");

  // State to manage table data updates
  const [moduleData, setModuleData] = useState(currentModule);

  const handleUpdate = (questionName, updatedRows) => {
    const updatedModule = { ...moduleData };
    updatedModule.submodules = updatedModule.submodules.map((submodule) => {
      if (submodule.name === activeTab) {
        submodule.questions = submodule.questions.map((question) =>
          question.name === questionName
            ? { ...question, content: { ...question.content, rows: updatedRows } }
            : question
        );
      }
      return submodule;
    });
    setModuleData(updatedModule);
  };

  // Map submodule names to their components
  const tabContent = currentModule.submodules.reduce((acc, submodule) => {
    switch (submodule.name) {
      case "Workforce Details":
        acc[submodule.name] = <WorkforceDetails submodule={submodule} onUpdate={handleUpdate} />;
        break;
      case "Employee Well-being":
        acc[submodule.name] = <EmployeeWellbeing submodule={submodule} />;
        break;
      case "Human Rights":
        acc[submodule.name] = <HumanRights submodule={submodule} onUpdate={handleUpdate} />;
        break;
      case "Others":
        acc[submodule.name] = <Others submodule={submodule} />;
        break;
      default:
        acc[submodule.name] = <div>Content for {submodule.name} not implemented.</div>;
    }
    return acc;
  }, {});

  return (
    <Layout>
      <div className="relative min-h-screen w-full bg-[#F2F4F5]">
        {/* Fixed Breadcrumb */}
        <div className="fixed top-[60px] left-0 right-0 z-30 bg-[#F2F4F5] border-b border-gray-100 px-4 md:px-8" style={{height:'56px'}}>
          <div className="max-w-7xl mx-auto">
            <Breadcrumb section={currentModule.name} activeTab={activeTab} />
          </div>
        </div>

        {/* Fixed SubHeader (Tabs) */}
        <div className="fixed top-[116px] left-0 right-0 z-30 bg-[#F2F4F5] border-b border-gray-100 px-4 md:px-8" style={{height:'48px'}}>
          <div className="max-w-7xl mx-auto">
            <SubHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex w-full max-w-7xl mx-auto pt-[172px] pb-8 px-4 md:px-8 gap-6">
          {/* Main Scrollable Content */}
          <div className="flex-1 min-w-0">
            <div className="overflow-y-auto rounded-lg bg-transparent" style={{maxHeight:'calc(100vh - 180px)'}}>
              {tabContent[activeTab]}
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