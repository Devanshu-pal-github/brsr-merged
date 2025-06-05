import { useState } from 'react';
import TableQuestionRenderer from '../components/TableQuestionRenderer';
import { policyDisclosures } from '../data/tableMetadata';

const PoliciesPage = () => {
    const [tableResponses, setTableResponses] = useState({});

    const handleTableChange = (sectionId, value) => {
        setTableResponses(prev => ({
            ...prev,
            [sectionId]: value
        }));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Policy & Governance Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#1A2341] mb-6">
                    Policy & Governance Disclosures
                </h2>

                {policyDisclosures.sections.map((section, idx) => (
                    <div key={section.title} className="mb-8">
                        <h3 className="text-lg font-semibold text-[#1A2341] mb-4">
                            {section.title}
                        </h3>


                        <TableQuestionRenderer
                            meta={section.table_metadata}
                            response={tableResponses[section.title] || { rows: [] }}
                            onChange={(value) => handleTableChange(section.title, value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PoliciesPage;
