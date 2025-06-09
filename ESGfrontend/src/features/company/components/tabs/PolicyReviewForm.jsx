import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../common/CardComponents';
import TableActionButtons from '../common/TableActionButtons';

const PolicyReviewForm = () => {
  const principles = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
  
  // State for review details
  const [reviewDetails, setReviewDetails] = useState({});
  // State for independent assessment
  const [assessmentDetails, setAssessmentDetails] = useState({});
  // State for non-coverage reasons
  const [nonCoverageReasons, setNonCoverageReasons] = useState({});
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchPolicyReview = async () => {
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

        console.log('[FETCH] Requesting policy review data for', { companyId, plantId, financial_year });
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
        
        // Update review details
        if (responseData.Q10_B?.table) {
          const reviewData = {};
          responseData.Q10_B.table.forEach(item => {
            if (item.row && item.col && item.value) {
              try {
                const value = JSON.parse(item.value);
                if (value.review) {
                  reviewData[`${item.row}-${item.col}-by`] = value.review;
                }
                if (value.frequency) {
                  reviewData[`${item.row}-${item.col}-frequency`] = value.frequency;
                }
              } catch (e) {
                // If not JSON, treat as legacy data
                reviewData[`${item.row}-${item.col}-by`] = item.value;
              }
            }
          });
          setReviewDetails(reviewData);
        }

        // Update assessment details
        if (responseData.Q11_B?.table) {
          const assessmentData = {};
          // Group the data by principle
          responseData.Q11_B.table.forEach(item => {
            if (item.row && item.col && item.value) {
              if (item.row === 'assessment') {
                assessmentData[item.col] = item.value;
              } else if (item.row === 'agency') {
                assessmentData[`${item.col}-agency`] = item.value;
              }
            }
          });
          setAssessmentDetails(assessmentData);
        }

        // Update non-coverage reasons
        if (responseData.Q12_B?.table) {
          const reasonsData = {};
          responseData.Q12_B.table.forEach(item => {
            if (item.row && item.col && item.value) {
              reasonsData[`${item.col}-${item.row}`] = item.value;
            }
          });
          setNonCoverageReasons(reasonsData);
        }

      } catch (err) {
        console.error('[FETCH] Error fetching policy review data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          setError('Your session has expired. Please log in again.');
          window.location.href = '/login';
        } else {
          setError(err.message || 'Failed to fetch policy review data');
        }
      }
      setLoading(false);
    };

    fetchPolicyReview();
  }, []);

  const handleReviewDetailsChange = (rowType, principle, field, value) => {
    setReviewDetails(prev => ({
      ...prev,
      [`${rowType}-${principle}-${field}`]: value
    }));
  };

  const handleAssessmentChange = (principle, value) => {
    setAssessmentDetails(prev => {
      const newDetails = { ...prev };
      
      // If this is an agency name update
      if (principle.includes('-agency')) {
        newDetails[principle] = value;
      } else {
        // This is a Yes/No assessment update
        newDetails[principle] = value;
        // Clear agency name if assessment is not "Yes"
        if (value !== 'Yes') {
          delete newDetails[`${principle}-agency`];
        }
      }
      
      return newDetails;
    });
  };

  const handleNonCoverageClick = (principle, reason) => {
    const key = `${principle}-${reason}`;
    setNonCoverageReasons(prev => ({
      ...prev,
      [key]: prev[key] === 'Yes' ? 'No' : prev[key] === 'N/A' ? 'Yes' : 'N/A'
    }));
  };

  const handleReviewReset = () => {
    setReviewDetails({});
  };

  const handleReviewSave = async () => {
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

      // Format the review details for API
      const reviewTable = [];
      
      // Process each principle for both Performance and Compliance
      ['Performance', 'Compliance'].forEach(rowType => {
        principles.forEach(principle => {
          const reviewValue = reviewDetails[`${rowType}-${principle}-by`];
          const frequencyValue = reviewDetails[`${rowType}-${principle}-frequency`];
          
          // Only add if we have at least one value
          if (reviewValue || frequencyValue) {
            const value = {
              review: reviewValue || '',
              frequency: frequencyValue || ''
            };
            
            reviewTable.push({
              row: rowType,
              col: principle,
              value: JSON.stringify(value)
            });
          }
        });
      });

      const updates = [
        {
          question_id: 'Q10_B',
          section_id: 'section_b',
          response: {
            table: reviewTable,
            meta_version: "1.0"
          }
        }
      ];

      console.log('[SAVE] Sending review updates:', updates);

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

      setError(null);
    } catch (err) {
      console.error('[SAVE] Error saving review details:', err);
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

  const handleAssessmentReset = () => {
    setAssessmentDetails({});
  };

  const handleAssessmentSave = async () => {
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

      // Format the assessment details for API
      const assessmentTable = [];
      
      // Process all principles
      principles.forEach(principle => {
        const assessment = assessmentDetails[principle];
        const agencyName = assessmentDetails[`${principle}-agency`];
        
        // Add assessment response (Yes/No) if it exists
        if (assessment) {
          assessmentTable.push({
            row: 'assessment',
            col: principle,
            value: assessment
          });
          
          // Add agency name only if assessment is Yes and agency name exists
          if (assessment === 'Yes' && agencyName) {
            assessmentTable.push({
              row: 'agency',
              col: principle,
              value: agencyName
            });
          }
        }
      });

      const updates = [
        {
          question_id: 'Q11_B',
          section_id: 'section_b',
          response: {
            table: assessmentTable,
            meta_version: "1.0"
          }
        }
      ];

      console.log('[SAVE] Sending assessment updates:', updates);

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

      setError(null);
    } catch (err) {
      console.error('[SAVE] Error saving assessment details:', err);
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

  const handleNonCoverageReset = () => {
    setNonCoverageReasons({});
  };

  const handleNonCoverageSave = async () => {
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

      // Format the non-coverage reasons for API
      const reasonsTable = [];
      Object.entries(nonCoverageReasons).forEach(([key, value]) => {
        if (!value || value === 'N/A') return; // Skip empty or N/A values
        
        const [principle, reason] = key.split('-');
        if (principle && reason && value) {
          reasonsTable.push({
            row: reason,
            col: principle,
            value: value
          });
        }
      });

      const updates = [
        {
          question_id: 'Q12_B',
          section_id: 'section_b',
          response: {
            table: reasonsTable,
            meta_version: "1.0"
          }
        }
      ];

      console.log('[SAVE] Sending non-coverage updates:', updates);

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

      setError(null);
    } catch (err) {
      console.error('[SAVE] Error saving non-coverage details:', err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

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
              <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th rowSpan="2" className="w-72 px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Subject for Review</th>
                    <th colSpan="9" className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Indicate whether review was undertaken by Director / Committee of the Board / Any other Committee
                    </th>
                    <th colSpan="9" className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Frequency (Annually / Half yearly / Quarterly / Any other)
                    </th>
                  </tr>
                  <tr>
                    {principles.map(p => (
                      <th key={`review-${p}`} className="w-24 px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">{p}</th>
                    ))}
                    {principles.map(p => (
                      <th key={`frequency-${p}`} className="w-24 px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {['Performance', 'Compliance'].map((rowType, idx) => (
                    <tr key={rowType} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {rowType === 'Performance' 
                          ? 'Performance against above policies and follow up action'
                          : 'Compliance with statutory requirements of relevance to the principles, and rectification of any non-compliances'}
                      </td>
                      {principles.map(p => (
                        <td key={`review-${p}-${rowType}`} className="px-4 py-4">
                          <select
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:border-indigo-400"
                            onChange={(e) => handleReviewDetailsChange(rowType, p, 'by', e.target.value)}
                            value={reviewDetails[`${rowType}-${p}-by`] || ''}
                          >
                            <option value="">Select...</option>
                            {reviewOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                      {principles.map(p => (
                        <td key={`frequency-${p}-${rowType}`} className="px-4 py-4">
                          <select
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:border-indigo-400"
                            onChange={(e) => handleReviewDetailsChange(rowType, p, 'frequency', e.target.value)}
                            value={reviewDetails[`${rowType}-${p}-frequency`] || ''}
                          >
                            <option value="">Select...</option>
                            {frequencyOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TableActionButtons 
              onReset={handleReviewReset}
              onSave={handleReviewSave}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question 11 */}
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
                </thead>
                <tbody>
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
            <TableActionButtons 
              onReset={handleAssessmentReset}
              onSave={handleAssessmentSave}
            />
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
              <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{ minWidth: '1400px' }}>
                <thead>
                  <tr>
                    <th className="w-[500px] px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    {principles.map(p => (
                      <th key={p} className="w-[100px] px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    'The entity does not consider the Principles material to its business',
                    'The entity is not at a stage where it is in a position to formulate and implement the policies on specified principles',
                    'The entity does not have the financial or/human and technical resources available for the task',
                    'It is planned to be done in the next financial year',
                    'Any other reason (please specify)'
                  ].map((reason, idx) => (
                    <tr key={reason} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900">{reason}</td>
                      {principles.map(p => (
                        <td 
                          key={p} 
                          onClick={() => handleNonCoverageClick(p, reason)}
                          className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100"
                        >
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
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
            <TableActionButtons 
              onReset={handleNonCoverageReset}
              onSave={handleNonCoverageSave}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyReviewForm;
