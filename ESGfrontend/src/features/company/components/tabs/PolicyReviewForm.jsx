import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/CardComponents';

const PolicyReviewForm = () => {
  const principles = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
  
  // State for review details
  const [reviewDetails, setReviewDetails] = useState({});
  // State for independent assessment
  const [assessmentDetails, setAssessmentDetails] = useState({});
  // State for non-coverage reasons
  const [nonCoverageReasons, setNonCoverageReasons] = useState({});

  const reviewOptions = [
    'Director',
    'Committee of the Board',
    'Any other Committee'
  ];

  const frequencyOptions = [
    'Annually',
    'Half yearly',
    'Quarterly',
    'Others'
  ];

  const handleReviewDetailsChange = (rowType, principle, field, value) => {
    setReviewDetails(prev => ({
      ...prev,
      [`${rowType}-${principle}-${field}`]: value
    }));
  };

  const handleAssessmentChange = (principle, value) => {
    setAssessmentDetails(prev => ({
      ...prev,
      [principle]: value
    }));
  };

  const handleNonCoverageClick = (principle, reason) => {
    const key = `${principle}-${reason}`;
    setNonCoverageReasons(prev => ({
      ...prev,
      [key]: prev[key] === 'Yes' ? 'No' : prev[key] === 'No' ? 'N/A' : 'Yes'
    }));
  };

  return (
    <div className="space-y-8">
      {/* Custom scrollbar styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #666;
          }
        `}
      </style>

      {/* Question 10 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">10. Details of Review of NGRBCs by the Company</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-max">
              <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">Subject for Review</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Review By</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Frequency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {['Performance', 'Compliance'].map(rowType => (
                    <tr key={rowType}>
                      <td className="px-4 py-4 text-sm text-gray-900 align-top">
                        {rowType === 'Performance' 
                          ? 'Performance against above policies and follow up action'
                          : 'Compliance with statutory requirements of relevance to the principles, and rectification of any non-compliances'}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          onChange={(e) => handleReviewDetailsChange(rowType, 'review', 'by', e.target.value)}
                          value={reviewDetails[`${rowType}-review-by`] || ''}
                        >
                          <option value="">Select...</option>
                          {reviewOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          onChange={(e) => handleReviewDetailsChange(rowType, 'review', 'frequency', e.target.value)}
                          value={reviewDetails[`${rowType}-review-frequency`] || ''}
                        >
                          <option value="">Select...</option>
                          {frequencyOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Question 11 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">11. Has the entity carried out independent assessment/evaluation of the working of its policies by an external agency?</h3>
          <p className="mt-1 text-sm text-gray-500">Please provide responses for each principle and include agency name where applicable</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-max">
              <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Independent Assessment Details</th>
                    {principles.map(p => (
                      <th key={p} className="w-32 px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{p}</th>
                    ))}
                  </tr>
                </thead>                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">Has the entity carried out independent assessment by external agency? (Yes/No)</td>
                    {principles.map(p => (
                      <td key={p} className="px-4 py-4 text-center">
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          onChange={(e) => handleAssessmentChange(p, e.target.value)}
                          value={assessmentDetails[p] || ''}
                        >
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">Name of the agency (if answer above is "Yes")</td>
                    {principles.map(p => (
                      <td key={p} className="px-4 py-4 text-center">
                        {assessmentDetails[p] === 'Yes' && (
                          <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Agency name"
                            value={assessmentDetails[`${p}-agency`] || ''}
                            onChange={(e) => handleAssessmentChange(`${p}-agency`, e.target.value)}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question 12 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">12. If answer to question (1) above is "No" i.e. not all Principles are covered by a policy, reasons to be stated:</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-max">
              <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th className="w-72 px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    {principles.map(p => (
                      <th key={p} className="w-24 px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{p}</th>
                    ))}
                  </tr>
                </thead>                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    'The entity does not consider the Principles material to its business',
                    'The entity is not at a stage where it is in a position to formulate and implement the policies on specified principles',
                    'The entity does not have the financial or/human and technical resources available for the task',
                    'It is planned to be done in the next financial year',
                    'Any other reason (please specify)'
                  ].map((reason, idx) => (
                    <tr key={reason} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm text-gray-900">{reason}</td>
                      {principles.map(p => (
                        <td 
                          key={p} 
                          onClick={() => handleNonCoverageClick(p, reason)}
                          className="px-4 py-4 text-center cursor-pointer hover:bg-gray-100"
                        >
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            nonCoverageReasons[`${p}-${reason}`] === 'Yes' 
                              ? 'bg-green-100 text-green-800' 
                              : nonCoverageReasons[`${p}-${reason}`] === 'No'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {nonCoverageReasons[`${p}-${reason}`] || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyReviewForm;
