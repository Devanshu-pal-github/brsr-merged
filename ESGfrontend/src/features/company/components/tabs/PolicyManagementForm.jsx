import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../common/CardComponents';
import TableActionButtons from '../common/TableActionButtons';

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

const PolicyManagementForm = () => {  // State for storing responses that match the questions.json format
  const [responses, setResponses] = useState({
    Q1_B: { table: { rows: [], meta_version: "1.0" } },
    Q2_B: { table: { rows: [], meta_version: "1.0" } },
    Q3_B: { table: { rows: [], meta_version: "1.0" } },
    Q4_B: { table: { rows: [], meta_version: "1.0" } },
    Q5_B: { table: { rows: [], meta_version: "1.0" } },  // For policy links
    Q6_B: { table: { rows: [], meta_version: "1.0" } }   // For additional text responses
  });

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/src/data/landingFlow/answers.json');
        if (!response.ok) {
          throw new Error('Failed to load answers');
        }
        
        const data = await response.json();
        
        // Initialize responses from answers.json data
        const initialResponses = {};
        Object.keys(questions).forEach(questionId => {
          // Get existing response or create empty structure
          initialResponses[questionId] = data.policy_management?.[questionId] || {
            table: {
              rows: [],
              meta_version: "1.0",
              columns: []
            }
          };
        });

        setResponses(prev => ({
          ...prev,
          ...initialResponses
        }));
      } catch (error) {
        console.error('Error loading answers:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, []);const handleResponseChange = (questionId, principle, value, type = 'string') => {
    setResponses(prev => {
      let updatedResponse = { ...prev[questionId] };
      
      // Ensure proper table structure
      updatedResponse = {
        table: {
          rows: [...(updatedResponse.table?.rows || [])],
          meta_version: "1.0",
          columns: [
            {
              id: principle,
              label: principle,
              type: type
            }
          ]
        }
      };

      // Find or create row for this principle
      const rowIndex = updatedResponse.table.rows.findIndex(r => r.row_id === principle);
      const cell = {
        row_id: principle,
        col_id: principle,
        value: value,
        type: type,
        calc: false
      };

      if (rowIndex === -1) {
        // Add new row
        updatedResponse.table.rows.push({
          row_id: principle,
          cells: [cell],
          calc: false
        });
      } else {
        // Update existing cell
        const cellIndex = updatedResponse.table.rows[rowIndex].cells.findIndex(c => c.col_id === principle);
        if (cellIndex === -1) {
          updatedResponse.table.rows[rowIndex].cells.push(cell);
        } else {
          updatedResponse.table.rows[rowIndex].cells[cellIndex] = cell;
        }
      }

      return {
        ...prev,
        [questionId]: updatedResponse
      };
    });
  };

  const handleYesNoClick = (questionId, principle) => {
    const currentValue = responses[questionId]?.table?.rows?.find(r => r.row_id === principle)?.cells[0]?.value;
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
      [questionId]: { table: { rows: [] } }
    }));
  };
  const handleSave = async (questionId) => {
    try {
      const response = responses[questionId];
      
      // Validate response structure before saving
      if (!response?.table?.rows) {
        console.error('Invalid response structure');
        return;
      }

      // Filter out empty values
      const cleanedRows = response.table.rows.filter(row => {
        return row.cells.some(cell => cell.value !== undefined && cell.value !== '');
      });

      const cleanedResponse = {
        ...response,
        table: {
          ...response.table,
          rows: cleanedRows,
          meta_version: "1.0"
        }
      };

      const success = await updatePolicyAnswers(questionId, cleanedResponse);
      if (success) {
        // Update local state to match what was saved
        setResponses(prev => ({
          ...prev,
          [questionId]: cleanedResponse
        }));
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
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
              <tbody className="bg-white divide-y divide-gray-200">                {Object.entries(questions).map(([questionId, { text }], idx) => (
                  <tr key={questionId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">
                      {text}
                    </td>
                    {principles.map(principle => {
                      const value = responses[questionId]?.table?.rows?.find(r => r.row_id === principle)?.cells[0]?.value;
                      return (
                        <td 
                          key={principle}
                          onClick={() => handleYesNoClick(questionId, principle)}
                          className="px-4 py-4 text-center cursor-pointer hover:bg-gray-100"
                        >
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            value === 'Yes' 
                              ? 'bg-green-100 text-green-800' 
                              : value === 'No'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {value || 'N/A'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}              </tbody>
            </table>            <TableActionButtons 
              onReset={() => Object.keys(questions).forEach(handleReset)}
              onSave={() => Object.keys(questions).forEach(handleSave)}
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
              <tbody className="bg-white divide-y divide-gray-200">                {linkQuestions.map((question, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">
                      {question}
                    </td>
                    {principles.map(principle => {
                      const value = responses.Q5_B?.table?.rows?.find(r => r.row_id === principle)?.cells[0]?.value;
                      return (
                        <td key={principle} className="px-4 py-4">
                          <input
                            type="url"
                            value={value || ''}
                            onChange={(e) => handleLinkChange('Q5_B', principle, e.target.value)}
                            placeholder="Enter URL"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}              </tbody>
            </table>            <TableActionButtons 
              onReset={() => handleReset('web_links')}
              onSave={() => handleSave('web_links')}
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
              <tbody className="bg-white divide-y divide-gray-200">                {textQuestions.map((question, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm text-gray-900 align-top">
                      {question}
                    </td>
                    {principles.map(principle => {
                      const value = responses.Q6_B?.table?.rows?.find(r => r.row_id === principle)?.cells[0]?.value;
                      return (
                        <td key={principle} className="px-4 py-4">
                          <textarea
                            value={value || ''}
                            onChange={(e) => handleTextChange('Q6_B', principle, e.target.value)}
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
            </table>            <TableActionButtons 
              onReset={() => handleReset('text_answers')}
              onSave={() => handleSave('text_answers')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyManagementForm;
