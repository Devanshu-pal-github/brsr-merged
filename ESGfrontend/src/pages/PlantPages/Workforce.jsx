import { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import WorkforceHeader from "../../components/WorkforceHeader";
import WorkforceQuestion from "../../components/WorkforceQuestion";
import TableCard from "../../components/TableComponent";
import GenderRatioChart from "../../components/RatioChart";
import InclusionRate from "../../components/InclusionRate";
import DuoTableComponent from "../../components/DuoTableComponent";
import ProgressCard from "../../components/ProgressCard";
import AIAssistant from "../../components/WorkforceAi";
import Layout from "../../components/Layout";

// Placeholder components for other tabs
const EmployeeWellbeing = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold">Employee Well-being Content</h2>
    <p>This section contains information about employee well-being.</p>
    {/* Add your well-being content here */}
  </div>
);

const HumanRights = () => (
  <div className=" flex flex-col space-y-[10px]">
    <WorkforceQuestion question="Employees and workers who have been provided training on human rights issues and policy(ies) of the entity ?">
       <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
          <div className="flex-[2] min-w-[260px] shrink-0">
            <TableCard
              title="Employees"
              fields={fields}
              rows={rows}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div>
          <div className="flex-[2] min-w-[260px] shrink-0">
            <TableCard
              title="Workers"
              fields={fields}
              rows={rows}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div></div>
    </WorkforceQuestion>
    <WorkforceQuestion question="Details of minimum wages paid to employee and workers" />
    <WorkforceQuestion question="Details of remuneration/salary/wages" />
    <WorkforceQuestion question="Complaint Management" />
    <WorkforceQuestion question="Human Rights Policy" />
    <WorkforceQuestion question="Assessment and Actions" />
  </div>
);

const Others = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold">Others Content</h2>
    <p>This section contains other relevant information.</p>
    {/* Add your other content here */}
  </div>
);

const WorkforceDetails = ({ rows, fields, row }) => (
  <>
    <div className=" flex flex-col space-y-[10px]">
      <WorkforceQuestion question="Employees and Workers Details">
        <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
          <div className="flex-[2] min-w-[260px] shrink-0">
            <TableCard
              title="Employees"
              fields={fields}
              rows={rows}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div>
          <div className="flex-[2] min-w-[260px] shrink-0">
            <TableCard
              title="Workers"
              fields={fields}
              rows={rows}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div>
          <div className="flex-[1] min-w-[160px] mt-6 xl:mt-10 shrink-0">
            <GenderRatioChart />
          </div>
        </div>
      </WorkforceQuestion>

      <WorkforceQuestion question="Differently Abled Employees and Workers">
        <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
          <div className="flex-[2] min-w-[260px] shrink-0">
            <TableCard
              title="Employees"
              fields={fields}
              rows={rows}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div>
          <div className="flex-[2] min-w-[260px] shrink-0">
            <TableCard
              title="Workers"
              fields={fields}
              rows={rows}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div>
          <div className="flex-[1] min-w-[160px] mt-6 xl:mt-10 shrink-0">
            <GenderRatioChart />
          </div>
        </div>
      </WorkforceQuestion>

      <WorkforceQuestion question="Participation/Inclusion of Women">
        <div className="flex items-start gap-6 flex-wrap xl:flex-nowrap">
          <div className="w-full xl:w-auto">
            <InclusionRate />
          </div>
        </div>
      </WorkforceQuestion>

      <WorkforceQuestion question="Turnover rate">
        <div className="flex items-start gap-6 flex-wrap xl:flex-nowrap">
          <div className="w-full xl:w-auto">
            <DuoTableComponent
              title="Inclusion Table"
              rows={row}
              onEditClick={() => console.log("Edit clicked")}
            />
          </div>
        </div>
      </WorkforceQuestion></div>
  </>
);

const Workforce = () => {
  const [activeTab, setActiveTab] = useState("Workforce Details");

  const row = [
    {
      category: "Permanent",
      male1: 0,
      female1: 0,
      male2: 0,
      female2: 0,
      male3: 0,
      female3: 0,
    },
    {
      category: "Other than Permanent",
      male1: 0,
      female1: 0,
      male2: 0,
      female2: 0,
      male3: 0,
      female3: 0,
    },
    {
      category: "Total Employees",
      male1: 0,
      female1: 0,
      male2: 0,
      female2: 0,
      male3: 0,
      female3: 0,
    },
  ];

  const fields = [
    { label: "Category", key: "category", align: "left" },
    { label: "Male No.", key: "male", align: "center" },
    { label: "Female No.", key: "female", align: "center" },
  ];

  const rows = [
    { category: "Permanent", male: 0, female: 0 },
    { category: "Other than Permanent", male: 0, female: 0 },
    { category: "Total Employees", male: 0, female: 0 },
  ];

  // Map tabs to their respective components
  const tabContent = {
    "Workforce Details": <WorkforceDetails rows={rows} fields={fields} row={row} />,
    "Employee Well-being": <EmployeeWellbeing />,
    "Human Rights": <HumanRights />,
    Others: <Others />,
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="h-25 w-full">
          <div className="fixed top-[30px] ml-0.5 z-10 w-full ]">
            <Breadcrumb activeTab={activeTab} />
          </div></div>

        <div className="mt-[10px] pt-[10px] mx-2 flex flex-col md:flex-row gap-6">

          <div className="w-full md:w-7/10 flex flex-col space-y-[10px]">
            <div className="h-10 w-full">
              <div className="fixed top-[140px] ml-0.5 z-10 w-full md:w-[56.5%] lg-w[65.5%]">
                <WorkforceHeader activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
            <div>

              {/* Dynamic Content */}
              {tabContent[activeTab]}
            </div>

            {/* Right side: progress + assistant, fixed position */}
            <div className="md:block fixed top-[140px] right-2 md:right-2 lg:right-10 w-[20%] min-w-[200px] max-w-[300px] flex flex-col space-y-2 gap-6">
              <ProgressCard covered={14} total={20} />
              <AIAssistant />
            </div>
          </div>
        </div></div>
    </Layout>
  );
};

export default Workforce;