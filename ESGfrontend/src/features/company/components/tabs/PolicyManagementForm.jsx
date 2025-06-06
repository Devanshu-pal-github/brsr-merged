import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/CardComponents';

const PolicyManagementForm = () => {
  // State for Yes/No answers
  const [yesNoAnswers, setYesNoAnswers] = useState({});
  // State for web links
  const [webLinks, setWebLinks] = useState({});
  // State for text answers
  const [textAnswers, setTextAnswers] = useState({});

  const principles = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
  
  const yesNoQuestions = [
    "Whether your entity's policy/policies cover each principle and its core elements of the NGRBCs.",
    "Has the policy been approved by the Board?",
    "Whether the entity has translated the policy into procedures.",
    "Do the enlisted policies extend to your value chain partners?"
  ];

  const linkQuestions = [
    "Web Link of the Policies, if available"
  ];

  const textQuestions = [
    "Name of the national and international codes/certifications/labels/standards adopted by your entity and mapped to each principle.",
    "Specific commitments, goals and targets set by the entity with defined timelines, if any.",
    "Performance of the entity against the specific commitments, goals and targets along-with reasons in case the same are not met."
  ];
  const handleYesNoClick = (principle, question) => {
    const key = `${principle}-${question}`;
    setYesNoAnswers(prev => ({
      ...prev,
      [key]: prev[key] === 'Yes' ? 'No' : prev[key] === 'No' ? 'N/A' : 'Yes'
    }));
  };

  const handleLinkChange = (principle, question, value) => {
    const key = `${principle}-${question}`;
    setWebLinks(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTextChange = (principle, question, value) => {
    const key = `${principle}-${question}`;
    setTextAnswers(prev => ({
      ...prev,
      [key]: value
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

      {/* Yes/No Questions Table */}
      <Card>
        <CardHeader 
          title="Policy Questions - Yes/No Responses" 
          subtitle="Click on cells to cycle between Yes, No, and N/A"
        />
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar" style={{ maxWidth: '100%' }}>
            <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Questions
                  </th>
                  {principles.map(principle => (
                    <th key={principle} className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {principle}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {yesNoQuestions.map((question, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">
                      {question}
                    </td>
                    {principles.map(principle => {
                      const key = `${principle}-${question}`;
                      return (
                        <td 
                          key={principle}
                          onClick={() => handleYesNoClick(principle, question)}
                          className="px-4 py-4 text-center cursor-pointer hover:bg-gray-100"
                        >
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            yesNoAnswers[key] === 'Yes' 
                              ? 'bg-green-100 text-green-800' 
                              : yesNoAnswers[key] === 'No'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {yesNoAnswers[key] || 'N/A'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Web Links Table */}
      <Card>
        <CardHeader 
          title="Policy Links" 
          subtitle="Enter web links for available policies"
        />
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar" style={{ maxWidth: '100%' }}>
            <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Links
                  </th>
                  {principles.map(principle => (
                    <th key={principle} className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {principle}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {linkQuestions.map((question, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">
                      {question}
                    </td>
                    {principles.map(principle => {
                      const key = `${principle}-${question}`;
                      return (
                        <td key={principle} className="px-4 py-4">
                          <input
                            type="url"
                            value={webLinks[key] || ''}
                            onChange={(e) => handleLinkChange(principle, question, e.target.value)}
                            placeholder="Enter URL"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Text Questions Table */}
      <Card>
        <CardHeader 
          title="Additional Information" 
          subtitle="Provide detailed responses for each principle"
        />
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar" style={{ maxWidth: '100%' }}>
            <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Details Required
                  </th>
                  {principles.map(principle => (
                    <th key={principle} className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {principle}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {textQuestions.map((question, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">
                      {question}
                    </td>
                    {principles.map(principle => {
                      const key = `${principle}-${question}`;
                      return (
                        <td key={principle} className="px-4 py-4">
                          <textarea
                            value={textAnswers[key] || ''}
                            onChange={(e) => handleTextChange(principle, question, e.target.value)}
                            placeholder="Enter details"
                            rows={3}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyManagementForm;
