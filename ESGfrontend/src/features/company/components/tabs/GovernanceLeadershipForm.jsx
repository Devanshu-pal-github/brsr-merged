import React, { useState } from 'react';

const GovernanceLeadershipForm = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Governance Leadership and Oversight</h2>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px gap-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 border-b-2 text-sm font-medium ${
              activeTab === 'pending'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Grievances
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-2 border-b-2 text-sm font-medium ${
              activeTab === 'resolved'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resolved Grievances
          </button>
        </nav>
      </div>

      {/* Grievance List */}
      <div className="space-y-4">
        {activeTab === 'pending' ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Environmental Concern #123</h3>
                  <p className="text-sm text-gray-500 mt-1">Reported on: June 1, 2025</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Concerns regarding waste management practices in the manufacturing unit...
              </p>
              <div className="flex justify-end space-x-3">
                <button className="text-sm text-gray-600 hover:text-gray-900">View Details</button>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">Resolve</button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Employee Grievance #124</h3>
                  <p className="text-sm text-gray-500 mt-1">Reported on: June 3, 2025</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Workplace safety concerns in the production area...
              </p>
              <div className="flex justify-end space-x-3">
                <button className="text-sm text-gray-600 hover:text-gray-900">View Details</button>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">Resolve</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Safety Concern #121</h3>
                  <p className="text-sm text-gray-500 mt-1">Resolved on: May 28, 2025</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Resolved
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Equipment maintenance schedule concerns...
              </p>
              <div className="flex justify-end">
                <button className="text-sm text-gray-600 hover:text-gray-900">View Resolution</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add New Grievance Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Grievance
        </button>
      </div>
    </div>
  );
};

export default GovernanceLeadershipForm;
