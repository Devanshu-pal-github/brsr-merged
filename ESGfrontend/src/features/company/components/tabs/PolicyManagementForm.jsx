import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../common/CardComponents';
import TableActionButtons from '../common/TableActionButtons';
// import { useBulkUpdatePolicyAnswersMutation } from '../../../../api/apiSlice';

// Questions structure matching questions.json format
const questions = {
  'Q1_B': {
    id: 'Q1_B',
    type: 'table',
    text: "Whether your entity's policy/policies cover each principle and its core elements of the NGRBCs",
    restriction: ["Yes", "No"]
  },
  'Q2_B': {
    id: 'Q2_B',
    type: 'table',
    text: "Has the policy been approved by the Board?",
    restriction: ["Yes", "No"]
  },
  'Q3_B': {
    id: 'Q3_B',
    type: 'table',
    text: "Whether the entity has translated the policy into procedures",
    restriction: ["Yes", "No"]
  },
  'Q4_B': {
    id: 'Q4_B',
    type: 'table',
    text: "Do the enlisted policies extend to your value chain partners?",
    restriction: ["Yes", "No"]
  }
};

const PolicyManagementForm = () => {
  // State for storing responses
  const [responses, setResponses] = useState({
    Q1_B: { table: [], meta_version: "1.0" },
    Q2_B: { table: [], meta_version: "1.0" },
    Q3_B: { table: [], meta_version: "1.0" },
    Q4_B: { table: [], meta_version: "1.0" },
    Q5_B: { table: [], meta_version: "1.0" },  // For policy links
    Q6_B: { table: [], meta_version: "1.0" }   // For additional text responses
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchPolicyManagement = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('[AUTH] No access token found');
          setError('Please log in to access this feature');
          window.location.href = '/login';
          return;
        }

        const companyId = localStorage.getItem('company_id');
        const plantId = localStorage.getItem('plant_id');
        const financial_year = localStorage.getItem('financial_year') || '2023_2024';

        if (!companyId || !plantId) {
          console.error('[INIT] Missing required IDs:', { companyId, plantId });
          setError('Company and Plant information not found. Please ensure you are properly logged in.');
          return;
        }

        console.log('[FETCH] Requesting policy management data for', { companyId, plantId, financial_year });
        const response = await axios.get(
          `/company/${companyId}/plants/${plantId}/reportsNew/${financial_year}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        // Parse the response data
        const responseData = response.data?.responses || {};
        
        // Update responses for each question
        const newResponses = {};
        ['Q1_B', 'Q2_B', 'Q3_B', 'Q4_B', 'Q5_B', 'Q6_B'].forEach(questionId => {
          if (responseData[questionId]?.table) {
            newResponses[questionId] = {
              table: responseData[questionId].table,
              meta_version: "1.0"
            };
          } else {
            newResponses[questionId] = {
              table: [],
              meta_version: "1.0"
            };
          }
        });
        
        setResponses(newResponses);
        setError(null);
      } catch (err) {
        console.error('[FETCH] Error fetching policy management data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          setError('Your session has expired. Please log in again.');
          window.location.href = '/login';
        } else {
          setError(err.message || 'Failed to fetch policy management data');
        }
      }
      setLoading(false);
    };

    fetchPolicyManagement();
  }, []);

  const handleResponseChange = (questionId, principle, value) => {
    setResponses(prev => {
      const updatedTable = [...(prev[questionId].table || [])];
      const existingIndex = updatedTable.findIndex(
        item => item.row === principle
      );

      if (existingIndex !== -1) {
        if (value) {
          updatedTable[existingIndex] = {
            row: principle,
            col: principle,
            value: value
          };
        } else {
          updatedTable.splice(existingIndex, 1);
        }
      } else if (value) {
        updatedTable.push({
          row: principle,
          col: principle,
          value: value
        });
      }

      return {
        ...prev,
        [questionId]: {
          table: updatedTable,
          meta_version: "1.0"
        }
      };
    });
  };

  const handleYesNoClick = (questionId, principle) => {
    const currentValue = responses[questionId]?.table?.find(
      item => item.row === principle
    )?.value;
    const newValue = currentValue === 'Yes' ? 'No' : currentValue === 'No' ? undefined : 'Yes';
    handleResponseChange(questionId, principle, newValue);
  };

  const handleLinkChange = (questionId, principle, value) => {
    handleResponseChange(questionId, principle, value);
  };

  const handleTextChange = (questionId, principle, value) => {
    handleResponseChange(questionId, principle, value);
  };

  const handleReset = (questionId) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { table: [], meta_version: "1.0" }
    }));
  };

  const handleSave = async (questionId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('[AUTH] No access token found');
        setError('Please log in to save changes');
        window.location.href = '/login';
        return;
      }

      const companyId = localStorage.getItem('company_id');
      const plantId = localStorage.getItem('plant_id');
      const financial_year = localStorage.getItem('financial_year') || '2023_2024';

      if (!companyId || !plantId) {
        throw new Error('Missing company or plant information');
      }

      // Clean up the table data to remove any duplicate entries
      const cleanedTable = responses[questionId].table.reduce((acc, curr) => {
        const existingIndex = acc.findIndex(item => item.row === curr.row);
        if (existingIndex !== -1) {
          acc[existingIndex] = curr;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      const updates = [{
        question_id: questionId,
        section_id: 'section_b',
        response: {
          table: cleanedTable,
          meta_version: "1.0"
        }
      }];

      console.log('[SAVE] Sending updates for', questionId, ':', updates);

      await axios.patch(
        `/company/${companyId}/plants/${plantId}/reportsNew/${financial_year}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Update local state with cleaned data
      setResponses(prev => ({
        ...prev,
        [questionId]: {
          table: cleanedTable,
          meta_version: "1.0"
        }
      }));

      setError(null);
    } catch (err) {
      console.error('[SAVE] Error saving data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        setError('Your session has expired. Please log in again.');
        window.location.href = '/login';
      } else {
        setError(err.message || 'Failed to save changes');
      }
    }
    setLoading(false);
  };

  const handleBulkSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('[AUTH] No access token found');
        setError('Please log in to save changes');
        window.location.href = '/login';
        return;
      }

      const companyId = localStorage.getItem('company_id');
      const plantId = localStorage.getItem('plant_id');
      const financial_year = localStorage.getItem('financial_year') || '2023_2024';

      if (!companyId || !plantId) {
        throw new Error('Missing company or plant information');
      }

      // Prepare all updates in one batch
      const updates = Object.entries(responses).map(([questionId, response]) => {
        // Clean up the table data
        const cleanedTable = response.table.reduce((acc, curr) => {
          const existingIndex = acc.findIndex(item => item.row === curr.row);
          if (existingIndex !== -1) {
            acc[existingIndex] = curr;
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);

        return {
          question_id: questionId,
          section_id: 'section_b',
          response: {
            table: cleanedTable,
            meta_version: "1.0"
          }
        };
      });

      console.log('[SAVE] Sending bulk updates:', updates);

      await axios.patch(
        `/company/${companyId}/plants/${plantId}/reportsNew/${financial_year}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Update local state with cleaned data
      const cleanedResponses = Object.entries(responses).reduce((acc, [questionId, response]) => {
        const cleanedTable = response.table.reduce((tableAcc, curr) => {
          const existingIndex = tableAcc.findIndex(item => item.row === curr.row);
          if (existingIndex !== -1) {
            tableAcc[existingIndex] = curr;
          } else {
            tableAcc.push(curr);
          }
          return tableAcc;
        }, []);

        acc[questionId] = {
          table: cleanedTable,
          meta_version: "1.0"
        };
        return acc;
      }, {});

      setResponses(cleanedResponses);
      setError(null);
    } catch (err) {
      console.error('[SAVE] Error saving data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        setError('Your session has expired. Please log in again.');
        window.location.href = '/login';
      } else {
        setError(err.message || 'Failed to save changes');
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
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
                {Object.entries(questions).map(([questionId, { text }], idx) => (
                  <tr key={questionId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">{text}</td>
                    {principles.map((principle) => {
                      const value = responses[questionId]?.table?.find(
                        item => item.row === principle && item.col === principle
                      )?.value;
                      return (
                        <td
                          key={principle}
                          onClick={() => handleYesNoClick(questionId, principle)}
                          className="px-4 py-4 text-center cursor-pointer hover:bg-gray-100"
                        >
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            value === "Yes" ? "bg-green-100 text-green-800"
                            : value === "No" ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }`}>{value || "N/A"}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <TableActionButtons 
              onReset={() => Object.keys(questions).forEach(handleReset)}
              onSave={handleBulkSave}
            />
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
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">{question}</td>
                    {principles.map((principle) => {
                      const value = responses.Q5_B?.table?.find(
                        item => item.row === principle && item.col === principle
                      )?.value;
                      return (
                        <td key={principle} className="px-4 py-4">
                          <input
                            type="url"
                            value={value || ""}
                            onChange={(e) => handleLinkChange("Q5_B", principle, e.target.value)}
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
            <TableActionButtons 
              onReset={() => handleReset('Q5_B')}
              onSave={() => handleSave('Q5_B')}
            />
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
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">{question}</td>
                    {principles.map((principle) => {
                      const value = responses.Q6_B?.table?.find(
                        item => item.row === principle && item.col === principle
                      )?.value;
                      return (
                        <td key={principle} className="px-4 py-4">
                          <textarea
                            value={value || ""}
                            onChange={(e) => handleTextChange("Q6_B", principle, e.target.value)}
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
            <TableActionButtons 
              onReset={() => handleReset('Q6_B')}
              onSave={() => handleSave('Q6_B')}
            />
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManagementForm;
