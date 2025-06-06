import React from 'react';

const DisclosuresForm = () => {
  return (
    <div className="space-y-6">
      {/* Financial Disclosures Section */}      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Policy Review</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Annual Report */}
          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Annual Report 2024-25</h3>
                <p className="text-sm text-gray-500 mt-1">Due by: July 31, 2025</p>
              </div>
              <button className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">
                Upload Report
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Pending submission</span>
            </div>
          </div>

          {/* Tax Compliance */}
          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Tax Compliance Report</h3>
                <p className="text-sm text-gray-500 mt-1">Last updated: May 15, 2025</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Up to date
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-600">Tax-Compliance-Q1-2025.pdf</span>
            </div>
          </div>
        </div>
      </section>

      {/* ESG Disclosures Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">ESG Disclosures</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Sustainability Report */}
          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Sustainability Report 2025</h3>
                <p className="text-sm text-gray-500 mt-1">Due by: August 15, 2025</p>
              </div>
              <button className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">
                Start Report
              </button>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    30%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
                <div
                  style={{ width: "30%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                ></div>
              </div>
            </div>
          </div>

          {/* Carbon Footprint Report */}
          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Carbon Footprint Report</h3>
                <p className="text-sm text-gray-500 mt-1">Last updated: June 1, 2025</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-600">Carbon-Footprint-2025.pdf</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DisclosuresForm;
