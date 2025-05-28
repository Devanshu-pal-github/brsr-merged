import { useState } from "react";
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

// Placeholder components for other tabs
const SustainableProducts = () => (
    <WorkforceQuestion question="Employees and Workers Details">
   
    </WorkforceQuestion>
);

const EnergyAndEmissions = ({ rows, fields, EmployeeField, WorkerField, field1, row1 ,row2,field2}) => (
  <div className=" flex flex-col space-y-[10px]">
    <WorkforceQuestion question="Employees and workers who have been provided training on human rights issues and policy(ies) of the entity ?">
      <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
        <div className="flex-[2] min-w-[360px] shrink-0">
          <BigTable
            title="Employees"
            fields={EmployeeField}
            rows={rows}
            onEditClick={() => console.log("Edit clicked")}
          />
        </div>
        <div className="flex-[2] min-w-[360px] shrink-0">
          <BigTable
            title="Workers"
            fields={WorkerField}
            rows={rows}
            onEditClick={() => console.log("Edit clicked")}
          />
        </div>
      </div>

      {/* Paragraph below both tables */}
      <p className=" text-[12px] text-gray-600">
        * The discharged water undergoes secondary level of treatment. Additionally, waste water which goes through Tertiary treatment is completely reused.
      </p>
    </WorkforceQuestion>

    <WorkforceQuestion question="Details of minimum wages paid to employee and workers" >
      <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
        <div className="flex-[2] min-w-[360px] shrink-0">
          <BigTable
            title="Employees"
            fields={field1}
            rows={row1}
            onEditClick={() => console.log("Edit clicked")}
          />
          <p className=" text-[12px] text-gray-600">* The discharged water undergoes secondary level of treatment. Additionally, waste water which goes through Tertiary treatment is completely reused.</p>
        </div>
        <div className="flex-[2] min-w-[360px] shrink-0">
          <BigTable
            title="Workers"
            fields={field1}
            rows={row1}
            onEditClick={() => console.log("Edit clicked")}
          />
        </div>
      </div>


    </WorkforceQuestion>
    <WorkforceQuestion question="Details of remuneration/salary/wages" >
    <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:overflow-x-auto">
        <div className="flex-[2] min-w-[360px] shrink-0">
          <BigTable
            title="Male"
            fields={field2}
            rows={row2}
            onEditClick={() => console.log("Edit clicked")}
          />
        </div>
        <div className="flex-[2] min-w-[360px] shrink-0">
          <BigTable
            title="Female"
            fields={field2}
            rows={row2}
            onEditClick={() => console.log("Edit clicked")}
          />
        </div> </div>
        <p className=" text-[12px] text-gray-600">* The discharged water undergoes secondary level of treatment. Additionally, waste water which goes through Tertiary treatment is completely reused.</p>
     
</WorkforceQuestion>
    <WorkforceQuestion question="Complaint Management" />
    <WorkforceQuestion question="Human Rights Policy">
      <QuestionnaireItem
        question="Do you have a focal point (Individual/ Committee) responsible for addressing human rights impacts or issues caused or contributed to by the business? (Yes/No)"
        answer="Yes,"
        details="Regular safety training conducted, PPE provided to all workers, Emergency response team established, Regular safety audits performed, First aid facilities available 24/7 Regular safety training conducted, PPE provided to all workers, Emergency response team established, Regular safety audits performed, First aid facilities available 24/7..."
        policyLink="/policy"
        onEditClick={() => console.log("Edit clicked")}
      />
    </WorkforceQuestion>
    <WorkforceQuestion question="Assessment and Actions" />
  </div>
);

const WaterAndWaste = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold">Others Content</h2>
    <p>This section contains other relevant information.</p>
    {/* Add your other content here */}
  </div>
);

const EnvironmentalCompliance= ({ rows, fields, row }) => (
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
      </WorkforceQuestion>
    </div>
  </>
);

const Workforce = () => {
  const [activeTab, setActiveTab] = useState("Sustainable Products");

  const row = [
    { category: "Permanent", male1: 0, female1: 0, male2: 0, female2: 0, male3: 0, female3: 0, },
    { category: "Other than Permanent", male1: 0, female1: 0, male2: 0, female2: 0, male3: 0, female3: 0, },
    { category: "Total Employees", male1: 0, female1: 0, male2: 0, female2: 0, male3: 0, female3: 0, },
  ];

  const fields = [
    { label: "Category", key: "category", align: "left" },
    { label: "Male No.", key: "male", align: "center" },
    { label: "Female No.", key: "female", align: "center" },
  ];
  const EmployeeField = [
    { label: "Category", key: "category", align: "left" },
    { label: "Employees Trained (FY23-24)", key: "male", align: "center" },
    { label: "Employees Trained (FY24-25)", key: "female", align: "center" },
  ];
  const WorkerField = [
    { label: "Category", key: "category", align: "left" },
    { label: "Workers Trained (FY23-24)", key: "male", align: "center" },
    { label: "Workers Trained (FY24-25)", key: "female", align: "center" },
  ];
  const rows = [
    { category: "Permanent", male: 0, female: 0 },
    { category: "Other than Permanent", male: 0, female: 0 },
    { category: "Total Employees", male: 0, female: 0 },
  ];

  const field1 = [

    { label: "Category", key: "category", align: "left" },
    { label: "Equal to Minimum Wage (FY23-24)", key: "FY23", align: "center" },
    { label: "Equal to Minimum Wage (FY24-25)", key: "FY24", align: "center" },

  ]
  const row1 = [
    { category: "Permanent", FY23: 0, FY24: 0, },
    { category: "Male", FY23: 0, FY24: 0, },
    { category: "Female", FY23: 0, FY24: 0, },
    { category: "Other than Permanent", FY23: 0, FY24: 0, },
    { category: "Female", FY23: 0, FY24: 0, },
    { category: "Female", FY23: 0, FY24: 0, },
  ]

    const field2 = [

    { label: "Category", key: "category", align: "left" },
    { label: "Number", key: "number", align: "center" },
    { label: "Median remuneration/ salary/ wages of respective category", key: "median", align: "center" },

  ]
  const row2= [
    { category: "Board of Directors (BoD) ", number: 0,median: 0, },
    { category: "Key Managerial Personnel ", number: 0, median: 0, },
    { category: "Employees other than BoD and KMP", number: 0, median: 0, },
    { category: "Workers", number: 0, median: 0, },
 
  ]

  const tabContent = {
  
    "Sustainable Products": <SustainableProducts />,
    "Energy and Emissions": <EnergyAndEmissions/>,
    "Water and Waste": <WaterAndWaste />,
      "Environmental Compilance": <EnvironmentalCompliance />,
  };
const tabs = Object.keys(tabContent);
  return (
    <Layout>
      <div className="min-h-screen">
        <div className="h-25 w-full">
          <div className="fixed top-[30px] ml-0.5 z-10 w-full ">
           <Breadcrumb section="Environment" activeTab={activeTab} />
          </div>
        </div>

        <div className="mt-[10px] pt-[10px] mx-2 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-7/10 flex flex-col space-y-[10px]">
            <div className="h-10 w-full">
              <div className="fixed top-[140px] ml-0.5 z-10 custom-width w-[56vw]">
                <SubHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
            <div>
            
              {tabContent[activeTab]}
            </div>

            {/* Right side: progress + assistant, fixed position */}
            <div className="md:block fixed top-[140px] right-2 md:right-2 lg:right-10 w-[20%] min-w-[20vw] flex flex-col space-y-2 gap-6">
              <ProgressCard covered={14} total={20} />
              <AIAssistant />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Workforce;