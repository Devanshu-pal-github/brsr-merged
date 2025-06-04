import { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import SubHeader from "../../components/SubHeader";
import WorkforceQuestion from "../../components/WorkforceQuestion";
import GenderRatioChart from "../../components/RatioChart";
import InclusionRate from "../../components/InclusionRate";
import ProgressCard from "../../components/ProgressCard";
import AIAssistant from "../../components/WorkforceAi";
import Layout from "../../components/Layout";
import QuestionnaireItem from "../../components/QuestionItem";

// Placeholder components for other tabs
const SustainableProducts = () => (
    <WorkforceQuestion question="Employees and Workers Details">
   
    </WorkforceQuestion>
);

const EnergyAndEmissions = () => (
  <div className="flex flex-col space-y-[10px]">
    <WorkforceQuestion question="Description of Target Reduction">
      <div className="flex flex-col gap-4">
        <QuestionnaireItem
          question="Details of GHG emissions"
          answer=""
        />
      </div>
    </WorkforceQuestion>
  </div>
);

const Workforce = () => {
  const [activeTab, setActiveTab] = useState("Sustainable Products");

  return (
    <>
      <Breadcrumb />
      <div className="py-1">
        <SubHeader
          title="ESG"
          subtitle="BCG - ESG Data Submission Platform"
          description=""
        />
      </div>
      <div className="px-2 py-4 flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("Sustainable Products")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "Sustainable Products"
              ? "bg-[#002A85] text-white"
              : "hover:bg-[#F3F4F6]"
          }`}
        >
          Sustainable Products
        </button>
        <button
          onClick={() => setActiveTab("Energy & Emissions")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "Energy & Emissions"
              ? "bg-[#002A85] text-white"
              : "hover:bg-[#F3F4F6]"
          }`}
        >
          Energy & Emissions
        </button>
      </div>

      {activeTab === "Sustainable Products" && <SustainableProducts />}
      {activeTab === "Energy & Emissions" && <EnergyAndEmissions />}
    </>
  );
};

export default Workforce;