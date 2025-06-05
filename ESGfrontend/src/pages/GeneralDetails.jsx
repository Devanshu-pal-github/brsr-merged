import { useState } from 'react';

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
        csrApplicable: false,
        turnover: '',
        netWorth: '',
        sameAsRegisteredAddress: false
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            // If sameAsRegisteredAddress is checked and we're updating regOfficeAddress, update corporateAddress too
            if (field === 'regOfficeAddress' && prev.sameAsRegisteredAddress) {
                return {
                    ...prev,
                    [field]: value,
                    corporateAddress: value
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleSameAddressChange = (e) => {
        const isChecked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            sameAsRegisteredAddress: isChecked,
            corporateAddress: isChecked ? prev.regOfficeAddress : prev.corporateAddress
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

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#1A2341]">
                                Turnover (in Rs.)
                            </label>
                            <input
                                type="number"
                                value={formData.turnover}
                                onChange={(e) => handleInputChange('turnover', e.target.value)}
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
                            <label className="block text-sm font-medium text-[#1A2341] mb-1">
                                Corporate Address
                            </label>
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id="sameAsRegistered"
                                    checked={formData.sameAsRegisteredAddress}
                                    onChange={handleSameAddressChange}
                                    className="h-4 w-4 text-[#14B8A6] focus:ring-[#14B8A6] border-gray-300 rounded"
                                />
                                <label htmlFor="sameAsRegistered" className="ml-2 block text-sm text-gray-700">
                                    Same as Registered Office Address
                                </label>
                            </div>
                            <textarea
                                value={formData.corporateAddress}
                                onChange={(e) => handleInputChange('corporateAddress', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent disabled:bg-gray-50"
                                rows={4}
                                disabled={formData.sameAsRegisteredAddress}
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
                                Net Worth (in Rs.)
                            </label>
                            <input
                                type="number"
                                value={formData.netWorth}
                                onChange={(e) => handleInputChange('netWorth', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="csrApplicable"
                                    checked={formData.csrApplicable}
                                    onChange={(e) => handleInputChange('csrApplicable', e.target.checked)}
                                    className="h-4 w-4 text-[#14B8A6] focus:ring-[#14B8A6] border-gray-300 rounded"
                                />
                                <label htmlFor="csrApplicable" className="ml-2 block text-sm text-gray-700">
                                    Whether CSR is applicable as per section 135 of Companies Act, 2013
                                </label>
                            </div>
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

            {/* Removed Policy & Governance Section - Moved to Policies Page */}
        </div>
    );
};

export default GeneralDetails;
