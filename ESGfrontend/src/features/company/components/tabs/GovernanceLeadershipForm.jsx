import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '../common/CardComponents';
import { FormInput, FormTextArea } from '../common/FormComponents';
import TableActionButtons from '../common/TableActionButtons';

console.log('📍 Loading GovernanceLeadershipForm.jsx from company/components/tabs');

const GovernanceLeadershipForm = ({ companyId, plantId }) => {
  const [formData, setFormData] = useState({
    Q7_B: { string_value: '', bool_value: null, decimal_value: null, note: null },
    Q8_B: { table: [
      { row: 'authority_name', col: 'name', value: '' },
      { row: 'designation', col: 'designation', value: '' },
      { row: 'additional_details', col: 'details', value: '' }
    ]},
    Q9_B: { string_value: '', bool_value: false, decimal_value: null, followUp: { string_value: '' } }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate required props
    if (!companyId || !plantId) {
      console.error('[INIT] Missing required IDs:', { companyId, plantId });
      setError('Company and Plant information not found. Please ensure you are properly logged in.');
      return;
    }

    const fetchResponses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('[AUTH] No access token found');
          setError('Please log in to access this feature');
          window.location.href = '/login';
          return;
        }

        const financial_year = localStorage.getItem('financial_year') || '2023_2024';
        console.log('[FETCH] Requesting governance responses for', { companyId, plantId, financial_year });
        
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
        
        // Try to find array or object
        let responses = response.data?.responses || response.data?.data || response.data || [];
        if (Array.isArray(responses)) {
          // Transform array to object keyed by question_id
          responses = responses.reduce((acc, item) => {
            if (item.question_id && item.response) acc[item.question_id] = item.response;
            return acc;
          }, {});
        }
        console.log('[FETCH] Parsed responses:', responses);
        if (responses.Q7_B || responses.Q8_B || responses.Q9_B) {
          setFormData(prev => ({ ...prev, ...responses }));
        }
      } catch (err) {
        console.error('[FETCH] Error fetching responses:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          setError('Your session has expired. Please log in again.');
          window.location.href = '/login';
        } else {
          setError(err.message || 'Failed to fetch responses');
        }
      }
      setLoading(false);
    };
    fetchResponses();
  }, [companyId, plantId]);

  const handleChange = (questionId, value, field = 'string_value') => {
    setFormData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const handleTableChange = (questionId, rowId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        table: prev[questionId].table.map(row => row.row === rowId ? { ...row, value } : row)
      }
    }));
  };

  const handleReset = () => {
    setFormData({
      Q7_B: { string_value: '', bool_value: null, decimal_value: null, note: null },
      Q8_B: {
        table: [
          { row: 'authority_name', col: 'name', value: '' },
          { row: 'designation', col: 'designation', value: '' },
          { row: 'additional_details', col: 'details', value: '' }
        ]
      },
      Q9_B: { string_value: '', bool_value: false, decimal_value: null, followUp: { string_value: '' } }
    });
  };

  const handleSave = async () => {
    if (!companyId || !plantId) {
      console.error('[SAVE] Missing companyId or plantId:', { companyId, plantId });
      setError('Missing company or plant information');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('[AUTH] No access token found');
        setError('Please log in to save changes');
        window.location.href = '/login';
        return;
      }

      const financial_year = localStorage.getItem('financial_year') || '2023_2024';
      console.log('[SAVE] Starting save operation with:', {
        companyId,
        plantId,
        financial_year,
        formData
      });

      // Format the responses for the API with proper structure
      const updates = [
        { 
          question_id: 'Q7_B', 
          section_id: 'section_c', 
          response: {
            string_value: formData.Q7_B.string_value || '',
            bool_value: formData.Q7_B.bool_value,
            decimal_value: formData.Q7_B.decimal_value,
            note: formData.Q7_B.note,
            meta_version: "1.0"
          }
        },
        { 
          question_id: 'Q8_B', 
          section_id: 'section_c', 
          response: {
            table: formData.Q8_B.table.map(row => ({
              row: row.row,
              col: row.col,
              value: row.value || ''
            })),
            meta_version: "1.0"
          }
        },
        { 
          question_id: 'Q9_B', 
          section_id: 'section_c', 
          response: {
            string_value: formData.Q9_B.string_value || '',
            bool_value: formData.Q9_B.bool_value ?? false,
            decimal_value: formData.Q9_B.decimal_value,
            followUp: {
              string_value: formData.Q9_B.followUp?.string_value || ''
            },
            meta_version: "1.0"
          }
        }
      ];
      
      console.log('[SAVE] Sending PATCH request with data:', JSON.stringify(updates, null, 2));
      
      try {
        const saveResponse = await axios.patch(
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
        console.log('[SAVE] PATCH request successful:', saveResponse);
      } catch (patchError) {
        console.error('[SAVE] PATCH request failed:', {
          error: patchError,
          response: patchError.response?.data,
          status: patchError.response?.status
        });
        if (patchError.response?.status === 401) {
          localStorage.removeItem('access_token');
          setError('Your session has expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
        throw patchError;
      }

      // Re-fetch to confirm DB roundtrip
      console.log('[SAVE] Starting confirmation fetch...');
      try {
        const confirm = await axios.get(
          `/company/${companyId}/plants/${plantId}/reportsNew/${financial_year}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('[SAVE] GET confirmation response:', confirm);
        
        let confirmResponses = confirm.data?.responses || confirm.data?.data || confirm.data || [];
        if (Array.isArray(confirmResponses)) {
          confirmResponses = confirmResponses.reduce((acc, item) => {
            if (item.question_id && item.response) acc[item.question_id] = item.response;
            return acc;
          }, {});
        }
        
        console.log('[SAVE] Parsed confirmation responses:', JSON.stringify(confirmResponses, null, 2));
        
        if (confirmResponses.Q7_B || confirmResponses.Q8_B || confirmResponses.Q9_B) {
          console.log('[SAVE] Found governance responses in confirmation fetch');
          setFormData(prev => ({ ...prev, ...confirmResponses }));
          setError(null);
        } else {
          console.warn('[SAVE] No governance responses found in confirmation fetch');
          setError('Data may not have been saved properly. Please try again.');
        }
      } catch (confirmError) {
        console.error('[SAVE] Confirmation fetch failed:', {
          error: confirmError,
          response: confirmError.response?.data,
          status: confirmError.response?.status
        });
        if (confirmError.response?.status === 401) {
          localStorage.removeItem('access_token');
          setError('Your session has expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
        throw confirmError;
      }
    } catch (err) {
      console.error('[SAVE] Operation failed:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.detail || err.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Director's Statement Section */}
      <Card>
        <CardHeader 
          title="Director's Statement" 
          subtitle="Statement by director responsible for the business responsibility report, highlighting ESG related challenges, targets and achievements"
        />
        <CardContent>
          <FormTextArea
            value={formData.Q7_B.string_value}
            onChange={(e) => handleChange('Q7_B', e.target.value)}
            placeholder="Enter the director's statement here..."
            rows={6}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-vertical min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Highest Authority Details Section */}
      <Card>
        <CardHeader 
          title="Highest Authority Details" 
          subtitle="Details of the highest authority responsible for implementation and oversight of the Business Responsibility policy(ies)"
        />
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Authority
                </label>
                <FormInput
                  name="authorityName"
                  value={formData.Q8_B.table[0].value}
                  onChange={(e) => handleTableChange('Q8_B', 'authority_name', e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <FormInput
                  name="designation"
                  value={formData.Q8_B.table[1].value}
                  onChange={(e) => handleTableChange('Q8_B', 'designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details
              </label>
              <FormTextArea
                name="details"
                value={formData.Q8_B.table[2].value}
                onChange={(e) => handleTableChange('Q8_B', 'additional_details', e.target.value)}
                placeholder="Enter additional details about the authority's role and responsibilities"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Committee Details Section */}
      <Card>
        <CardHeader 
          title="Board Committee Details" 
          subtitle="Information about the Committee of the Board/Director responsible for decision making on sustainability related issues"
        />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Does the entity have a specified Committee of the Board/Director responsible for decision making on sustainability related issues?
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="hasCommittee"
                    value="true"
                    checked={formData.Q9_B.bool_value === true}
                    onChange={(e) => handleChange('Q9_B', e.target.value === 'true', 'bool_value')}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="hasCommittee"
                    value="false"
                    checked={formData.Q9_B.bool_value === false}
                    onChange={(e) => handleChange('Q9_B', e.target.value === 'true', 'bool_value')}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {formData.Q9_B.bool_value && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Committee Details
                  </label>
                  <FormTextArea
                    value={formData.Q9_B.followUp.string_value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      Q9_B: {
                        ...prev.Q9_B,
                        followUp: {
                          string_value: e.target.value
                        }
                      }
                    }))}
                    placeholder="Enter details about the committee..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={() => {
            console.log('🎯 Save Changes clicked in company/GovernanceLeadershipForm.jsx');
            console.log('Current form state:', formData);
            handleSave();
          }}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default GovernanceLeadershipForm;
