import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/CardComponents';
import { FormInput, FormTextArea } from '../common/FormComponents';
import TableActionButtons from '../common/TableActionButtons';

const GovernanceLeadershipForm = () => {
  const [formData, setFormData] = useState({
    Q7_B: { 
      string_value: '', 
      bool_value: null, 
      decimal_value: null,
      note: null
    },
    Q8_B: {
      table: [
        {
          row: 'authority_name',
          col: 'name',
          value: ''
        },
        {
          row: 'designation',
          col: 'designation',
          value: ''
        },
        {
          row: 'additional_details',
          col: 'details',
          value: ''
        }
      ]
    },
    Q9_B: {
      string_value: '',
      bool_value: false,
      decimal_value: null,
      followUp: {
        string_value: ''
      }
    }
  });

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
        table: prev[questionId].table.map(row => 
          row.row === rowId ? { ...row, value } : row
        )
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
      Q9_B: {
        string_value: '',
        bool_value: false,
        decimal_value: null,
        followUp: { string_value: '' }
      }
    });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving governance details:', formData);
  };

  return (
    <div className="space-y-8">
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
                    name="committeeDetails"
                    value={formData.Q9_B.followUp.string_value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      Q9_B: {
                        ...prev.Q9_B,
                        followUp: { string_value: e.target.value }
                      }
                    }))}
                    placeholder="Enter detailed information about the committee's role, composition, and responsibilities"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TableActionButtons 
        onReset={handleReset}
        onSave={handleSave}
      />
    </div>
  );
};

export default GovernanceLeadershipForm;
