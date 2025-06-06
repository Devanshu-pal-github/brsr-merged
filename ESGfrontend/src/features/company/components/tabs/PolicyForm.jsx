import React, { useState } from 'react';
import TableActionButtons from '../common/TableActionButtons';

const PolicyForm = () => {
  const [policies, setPolicies] = useState({
    hr: { filename: 'HR-Policy-2024.pdf' },
    environmental: { filename: 'Environmental-Policy-2024.pdf' },
    privacy: { filename: 'Privacy-Policy-2024.pdf' }
  });

  const handleReset = () => {
    setPolicies({
      hr: { filename: '' },
      environmental: { filename: '' },
      privacy: { filename: '' }
    });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving policies:', policies);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Company Policies</h2>
        
        {/* HR Policy */}
        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">HR Policy</h3>
            <button className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">
              Upload New
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-600">{policies.hr.filename}</span>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
          </div>
        </div>

        {/* Environmental Policy */}
        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">Environmental Policy</h3>
            <button className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">
              Upload New
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-600">{policies.environmental.filename}</span>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
          </div>
        </div>

        {/* Data Privacy Policy */}
        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">Data Privacy Policy</h3>
            <button className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">
              Upload New
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-600">{policies.privacy.filename}</span>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
          </div>
        </div>
      </section>

      <TableActionButtons 
        onReset={handleReset}
        onSave={handleSave}
      />
    </div>
  );
};

export default PolicyForm;
