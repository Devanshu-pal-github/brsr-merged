import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { FormSection, FormField, FormInput, FormTextArea } from '../common/FormComponents';
import { Card, CardContent, CardFooter } from '../common/CardComponents';
import TableActionButtons from '../common/TableActionButtons';
import { useGetModuleResponsesQuery, useBulkUpdateResponsesMutation } from '../../../../api/apiSlice';

import { useSelector } from 'react-redux';
import { selectQuestionsByModule } from '../../../landing-flow/store/questions';

const GeneralDetailsForm = () => {
  const dispatch = useDispatch();
  
  // Create memoized selector instance
  const selectGeneralDetailsQuestions = useMemo(
    () => selectQuestionsByModule('general_details'),
    []
  );
  
  // Use memoized selector
  const questions = useSelector(selectGeneralDetailsQuestions);
  
  // Get existing responses using RTK Query
  const { data: existingResponses, isLoading: isLoadingResponsesApi } = useGetModuleResponsesQuery({
    moduleId: 'section_a'
  });

  // Initialize form data state
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mutation for saving responses
  const [bulkUpdateResponses] = useBulkUpdateResponsesMutation();

  // Update form data when responses are loaded
  useEffect(() => {
    if (existingResponses && Array.isArray(existingResponses)) {
      const responseMap = existingResponses.reduce((acc, response) => {
        acc[response.question_id] = {
          string_value: response.string_value || '',
          bool_value: response.bool_value,
          decimal_value: response.decimal_value,
          link: response.link,
          note: response.note,
          table: response.table
        };
        return acc;
      }, {});
      setFormData(responseMap);
    }
  }, [existingResponses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Start with existing values
    let updatedValue = {
      ...formData[name],
      // Initialize with null values if not exist
      string_value: formData[name]?.string_value ?? null,
      bool_value: formData[name]?.bool_value ?? null,
      decimal_value: formData[name]?.decimal_value ?? null
    };

    // Handle all text-based inputs
    if (['text', 'textarea'].includes(type)) {
      updatedValue.string_value = value;
    }
    // Handle email input with validation
    else if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value === '' || emailRegex.test(value)) {
        updatedValue.string_value = value;
      } else {
        return; // Invalid email, don't update
      }
    }
    // Handle URL input with validation
    else if (type === 'url') {
      try {
        if (value === '' || new URL(value.startsWith('http') ? value : `https://${value}`)) {
          updatedValue.string_value = value;
        }
      } catch {
        return; // Invalid URL, don't update
      }
    }
    // Handle number inputs
    else if (type === 'number') {
      updatedValue.decimal_value = value ? parseFloat(value) : null;
      updatedValue.string_value = null;
    }
    // Handle telephone input
    else if (type === 'tel') {
      const phoneRegex = /^[0-9\s\-+()]*$/;
      if (value === '' || phoneRegex.test(value)) {
        updatedValue.string_value = value;
      } else {
        return; // Invalid phone number, don't update
      }
    }
    // Handle checkbox
    else if (type === 'checkbox') {
      updatedValue.bool_value = checked;
      updatedValue.string_value = null;
    }
    // Handle radio inputs
    else if (type === 'radio') {
      if (name === 'Q13_A') { // Reporting Boundary
        updatedValue = {
          ...updatedValue,
          string_value: value,
          bool_value: null,
          decimal_value: null
        };
      } else if (name === 'Q22i_A') { // CSR Applicable
        updatedValue = {
          ...updatedValue,
          bool_value: value === 'yes',
          string_value: null
        };
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));

    // Handle corporate address copying if same as registered
    if (name === 'Q6_A' && checked) {
      setFormData(prev => ({
        ...prev,
        Q7_A: {
          ...prev.Q7_A,
          string_value: prev.Q5_A.string_value
        }
      }));
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get required context from localStorage
      const company_id = localStorage.getItem('company_id');
      const plant_id = localStorage.getItem('plant_id');
      const financial_year = localStorage.getItem('financial_year');

      if (!company_id || !plant_id || !financial_year) {
        throw new Error('Missing required context: company_id, plant_id, or financial_year');
      }

      // Prepare responses for bulk update
      const responses = Object.entries(formData)
        .filter(([_, value]) => {
          // Only include entries that have non-empty values
          return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
        })
        .map(([questionId, value]) => {
          // Clean up response data
          const responseData = {};
          Object.entries(value).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
              responseData[key] = val;
            }
          });

          return {
            question_id: questionId,
            response: responseData
          };
        });

      if (responses.length === 0) {
        throw new Error('No valid responses to save');
      }

      // Send bulk update request through RTK Query mutation
      const result = await bulkUpdateResponses({
        companyId: company_id,
        plantId: plant_id,
        financialYear: financial_year,
        responses
      }).unwrap();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save responses');
      }

      console.log('Successfully saved all responses');
      
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
      console.error('Error saving responses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const handleReset = () => {
    setFormData({
      Q1_A: { string_value: '', bool_value: null, decimal_value: null },
      Q2_A: { string_value: '', bool_value: null, decimal_value: null },
      Q3_A: { string_value: null, bool_value: null, decimal_value: null },
      Q4_A: { string_value: '', bool_value: null, decimal_value: null },
      Q5_A: { string_value: '', bool_value: null, decimal_value: null },
      Q6_A: { string_value: '', bool_value: null, decimal_value: null },
      Q7_A: { string_value: '', bool_value: null, decimal_value: null },
      Q8_A: { string_value: '', bool_value: null, decimal_value: null },
      Q9_A: { string_value: '', bool_value: null, decimal_value: null },
      Q10_A: { string_value: '', bool_value: null, decimal_value: null },
      Q11_A: { string_value: '', bool_value: null, decimal_value: null },
      Q12_A: { decimal_value: null },
      Q13_A: { string_value: 'standalone', decimal_value: null },
      Q22i_A: { bool_value: null, decimal_value: null },
      Q22ii_A: { string_value: '', bool_value: null, decimal_value: null },
      Q22iii_A: { string_value: '', bool_value: null, decimal_value: null },
      Q22_A: { string_value: '', bool_value: null, decimal_value: null }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <CardContent>
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {isLoadingResponsesApi ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Company Identity Section */}
              <FormSection title="Company Identity">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="CIN" required>
                    <FormInput
                      name="Q1_A"
                      value={formData.Q1_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter CIN"
                      required
                    />
                  </FormField>
                  <FormField label="Company Name" required>
                    <FormInput
                      name="Q2_A"
                      value={formData.Q2_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      required
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Address Section */}
              <FormSection title="Address Information">
                <div className="space-y-6">
                  <FormField label="Registered Office Address" required>
                    <FormTextArea
                      name="Q5_A"
                      value={formData.Q5_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter complete registered office address"
                      required
                      rows={3}
                    />
                  </FormField>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="sameAsRegistered"
                      name="Q6_A"
                      checked={formData.Q6_A?.bool_value || false}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="sameAsRegistered" className="text-sm text-gray-700">
                      Corporate address same as registered address
                    </label>
                  </div>
                  <FormField label="Corporate Address" required>
                    <FormTextArea
                      name="Q7_A"
                      value={formData.Q7_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter corporate address"
                      required
                      rows={3}
                      disabled={formData.Q6_A?.bool_value}
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Contact Information */}
              <FormSection title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="E-mail" required>
                    <FormInput
                      type="email"
                      name="Q8_A"
                      value={formData.Q8_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </FormField>
                  <FormField label="Telephone" required>
                    <FormInput
                      type="tel"
                      name="Q9_A"
                      value={formData.Q9_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter telephone number"
                      required
                    />
                  </FormField>
                  <FormField label="Website">
                    <FormInput
                      type="url"
                      name="Q10_A"
                      value={formData.Q10_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter website URL"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Stock Exchange & Financial Information */}
              <FormSection title="Stock Exchange & Financial Information">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Stock Exchange(s) Listed" required>
                      <FormInput
                        name="Q11_A"
                        value={formData.Q11_A?.string_value || ''}
                        onChange={handleChange}
                        placeholder="Enter stock exchanges"
                        required
                      />
                    </FormField>
                    <FormField label="Paid-up Capital" required>
                      <FormInput
                        type="number"
                        name="Q12_A"
                        value={formData.Q12_A?.decimal_value || ''}
                        onChange={handleChange}
                        placeholder="Enter paid-up capital"
                        required
                      />
                    </FormField>
                  </div>
                </div>
              </FormSection>

              {/* Additional Information */}
              <FormSection title="Additional Information">
                <div className="space-y-6">
                  <FormField label="Reporting Boundary" required>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="Q13_A"
                          value="standalone"
                          checked={formData.Q13_A?.string_value === 'standalone'}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Standalone</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="Q13_A"
                          value="consolidated"
                          checked={formData.Q13_A?.string_value === 'consolidated'}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Consolidated</span>
                      </label>
                    </div>
                  </FormField>

                  <FormField label="CSR Applicable as per section 135" required>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="Q22i_A"
                          value="yes"
                          checked={formData.Q22i_A?.bool_value === true}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="Q22i_A"
                          value="no"
                          checked={formData.Q22i_A?.bool_value === false}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </FormField>
                </div>
              </FormSection>

              {/* Contact Person Information */}
              <FormSection title="Contact Person for BRSR Report">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Contact Person Name" required>
                    <FormInput
                      name="Q22ii_A"
                      value={formData.Q22ii_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter name"
                      required
                    />
                  </FormField>
                  <FormField label="Contact Person Email" required>
                    <FormInput
                      type="email"
                      name="Q22iii_A"
                      value={formData.Q22iii_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </FormField>
                  <FormField label="Contact Person Phone" required>
                    <FormInput
                      type="tel"
                      name="Q22_A"
                      value={formData.Q22_A?.string_value || ''}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </FormField>
                </div>
              </FormSection>
            </>
          )}
        </CardContent>
        <CardFooter>
          <TableActionButtons 
            onReset={handleReset}
            onSave={handleSubmit}
            loading={loading}
            disabled={isLoadingResponsesApi}
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default GeneralDetailsForm;
