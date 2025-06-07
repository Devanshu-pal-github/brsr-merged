import React, { useState, useEffect } from 'react';
import { FormSection, FormField, FormInput, FormTextArea, FormButton } from '../common/FormComponents';
import { Card, CardContent, CardFooter } from '../common/CardComponents';
import TableActionButtons from '../common/TableActionButtons';

const GeneralDetailsForm = () => {
  const [questions, setQuestions] = useState(null);
  const [formData, setFormData] = useState({
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
    Q11_A: { table: { rows: [] } },
    Q12_A: { table: [] },
    Q13_A: { string_value: '', bool_value: null, decimal_value: null },
    Q22i_A: { string_value: null, bool_value: null, decimal_value: null },
    Q22ii_A: { string_value: null, bool_value: null, decimal_value: null },
    Q22iii_A: { string_value: null, bool_value: null, decimal_value: null }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load questions
        const questionsResponse = await fetch('/src/data/landingFlow/questions.json');
        if (!questionsResponse.ok) throw new Error('Failed to load questions');
        const questionsData = await questionsResponse.json();
        
        // Extract general details questions
        const generalDetailsQuestions = questionsData.modules
          .find(m => m.id === 'landing_flow')
          ?.submodules
          .find(sm => sm.id === 'general_details')
          ?.question_categories[0]
          ?.questions;
          
        setQuestions(generalDetailsQuestions);

        // Load answers
        const answersResponse = await fetch('/src/data/landingFlow/answers.json');
        if (!answersResponse.ok) throw new Error('Failed to load answers');
        const answersData = await answersResponse.json();
        
        // Set form data from answers
        setFormData(prev => ({
          ...prev,
          ...answersData.responses.general_details
        }));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types according to questions.json structure
    let updatedValue = {
      ...formData[name],
      string_value: type === 'text' || type === 'email' || type === 'tel' || type === 'url' ? value : formData[name]?.string_value,
      decimal_value: type === 'number' ? parseFloat(value) || null : formData[name]?.decimal_value,
      bool_value: type === 'checkbox' ? checked : type === 'radio' ? value === 'yes' : formData[name]?.bool_value
    };

    // Special handling for radios
    if (name === 'Q13_A') { // Reporting Boundary
      updatedValue = {
        ...updatedValue,
        string_value: value,
        bool_value: null
      };
    } else if (name === 'Q22i_A') { // CSR Applicable
      updatedValue = {
        ...updatedValue,
        bool_value: value === 'yes',
        string_value: null
      };
    }

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));

    // Special handling for same as registered address
    if (name === 'Q6_A' && checked) {
      setFormData(prev => ({
        ...prev,
        Q7_A: {
          ...prev.Q7_A,
          string_value: prev.Q5_A.string_value
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  // Update the reset handler in TableActionButtons
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
      Q11_A: { table: { rows: [] } },
      Q12_A: { table: [] },
      Q13_A: { string_value: '', bool_value: null, decimal_value: null },
      Q22i_A: { string_value: null, bool_value: null, decimal_value: null },
      Q22ii_A: { string_value: null, bool_value: null, decimal_value: null },
      Q22iii_A: { string_value: null, bool_value: null, decimal_value: null }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <CardContent>
          {/* Company Identity Section */}
          <FormSection title="Company Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions?.filter(q => ['Q1_A', 'Q2_A', 'Q3_A', 'Q9_A'].includes(q.question_id))
                .map(question => (
                <FormField key={question.question_id} label={question.question} required={question.string_value_required || question.decimal_value_required}>
                  <FormInput
                    name={question.question_id}
                    value={formData[question.question_id]}
                    onChange={handleChange}
                    type={question.has_decimal_value ? 'number' : 'text'}
                    placeholder={`Enter ${question.question.toLowerCase()}`}
                    required={question.string_value_required || question.decimal_value_required}
                  />
                </FormField>
              ))}
            </div>
          </FormSection>

          {/* Address Section */}
          <FormSection title="Address Information">
            <div className="space-y-6">
              <FormField label="Registered Office Address" required>
                <FormTextArea
                  name="Q5_A"
                  value={formData.Q5_A}
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
                  checked={formData.Q6_A}
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
                  value={formData.Q7_A}
                  onChange={handleChange}
                  placeholder="Enter corporate address"
                  required
                  rows={3}
                  disabled={formData.Q6_A}
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
                  value={formData.Q8_A}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </FormField>
              <FormField label="Telephone" required>
                <FormInput
                  type="tel"
                  name="Q9_A"
                  value={formData.Q9_A}
                  onChange={handleChange}
                  placeholder="Enter telephone number"
                  required
                />
              </FormField>
              <FormField label="Website">
                <FormInput
                  type="url"
                  name="Q10_A"
                  value={formData.Q10_A}
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
                    value={formData.Q11_A}
                    onChange={handleChange}
                    placeholder="Enter stock exchanges"
                    required
                  />
                </FormField>
                <FormField label="Paid-up Capital" required>
                  <FormInput
                    name="Q12_A"
                    value={formData.Q12_A}
                    onChange={handleChange}
                    placeholder="Enter paid-up capital"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Turnover (in Rs.)" required>
                  <FormInput
                    type="number"
                    name="Q13_A"
                    value={formData.Q13_A}
                    onChange={handleChange}
                    placeholder="Enter turnover amount"
                    required
                  />
                </FormField>
                <FormField label="Net Worth (in Rs.)" required>
                  <FormInput
                    type="number"
                    name="Q22i_A"
                    value={formData.Q22i_A}
                    onChange={handleChange}
                    placeholder="Enter net worth"
                    required
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Contact Person & Additional Information */}
          <FormSection title="Contact Person for BRSR Report">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Contact Person Name" required>
                <FormInput
                  name="Q22ii_A"
                  value={formData.Q22ii_A}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              </FormField>
              <FormField label="Contact Person Email" required>
                <FormInput
                  type="email"
                  name="Q22iii_A"
                  value={formData.Q22iii_A}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </FormField>
              <FormField label="Contact Person Phone" required>
                <FormInput
                  type="tel"
                  name="Q22_A"
                  value={formData.Q22_A}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </FormField>
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
        </CardContent>
        <CardFooter>
          <TableActionButtons 
            onReset={handleReset}
            onSave={handleSubmit}
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default GeneralDetailsForm;
