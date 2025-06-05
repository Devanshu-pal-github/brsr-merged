import { useState } from 'react';
import TableQuestionRenderer from '../components/TableQuestionRenderer';
import { policyDisclosures } from '../data/tableMetadata';

const GeneralDetails = () => {
    const [formData, setFormData] = useState({
        cin: '',
        companyName: '',
        incorporationYear: '',
        regOfficeAddress: '',
        corporateAddress: '',
        email: '',
        telephone: '',
        website: '',
        financialYear: '',
        stockExchanges: '',
        paidUpCapital: '',
        reportingBoundary: 'standalone',
    });

    const [tableResponses, setTableResponses] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTableChange = (sectionId, value) => {
        setTableResponses(prev => ({
            ...prev,
            [sectionId]: value
        }));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Company Details Form */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-[#1A2341] mb-6">
                    Company General Details
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Corporate Identity Number (CIN)
                            </label>
                            <input
                                type="text"
                                value={formData.cin}
                                onChange={(e) => handleInputChange('cin', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Year of Incorporation
                            </label>
                            <input
                                type="number"
                                value={formData.incorporationYear}
                                onChange={(e) => handleInputChange('incorporationYear', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Registered Office Address
                            </label>
                            <textarea
                                value={formData.regOfficeAddress}
                                onChange={(e) => handleInputChange('regOfficeAddress', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Corporate Address
                            </label>
                            <textarea
                                value={formData.corporateAddress}
                                onChange={(e) => handleInputChange('corporateAddress', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Financial Year
                            </label>
                            <input
                                type="text"
                                value={formData.financialYear}
                                onChange={(e) => handleInputChange('financialYear', e.target.value)}
                                placeholder="e.g., 2023-24"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Telephone
                            </label>
                            <input
                                type="tel"
                                value={formData.telephone}
                                onChange={(e) => handleInputChange('telephone', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Website
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Stock Exchange Listings
                            </label>
                            <input
                                type="text"
                                value={formData.stockExchanges}
                                onChange={(e) => handleInputChange('stockExchanges', e.target.value)}
                                placeholder="e.g., NSE, BSE"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Paid-up Capital
                            </label>
                            <input
                                type="text"
                                value={formData.paidUpCapital}
                                onChange={(e) => handleInputChange('paidUpCapital', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Reporting Boundary
                            </label>
                            <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="standalone"
                                        checked={formData.reportingBoundary === 'standalone'}
                                        onChange={(e) => handleInputChange('reportingBoundary', e.target.value)}
                                        className="form-radio text-[#14B8A6] focus:ring-[#14B8A6]"
                                    />
                                    <span className="ml-2 text-sm text-[#1A2341]">Standalone</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        value="consolidated"
                                        checked={formData.reportingBoundary === 'consolidated'}
                                        onChange={(e) => handleInputChange('reportingBoundary', e.target.value)}
                                        className="form-radio text-[#14B8A6] focus:ring-[#14B8A6]"
                                    />
                                    <span className="ml-2 text-sm text-[#1A2341]">Consolidated</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

export default GeneralDetails;
