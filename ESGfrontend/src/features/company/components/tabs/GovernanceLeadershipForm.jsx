import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../common/CardComponents';
import { FormInput, FormTextArea } from '../common/FormComponents';

const GovernanceLeadershipForm = () => {
  // State for director's statement
  const [directorStatement, setDirectorStatement] = useState('');
  
  // State for highest authority details
  const [highestAuthority, setHighestAuthority] = useState({
    name: '',
    designation: '',
    details: ''
  });
  
  // State for committee details
  const [committeeDetails, setCommitteeDetails] = useState({
    hasCommittee: 'No',
    name: '',
    description: ''
  });

  const handleHighestAuthorityChange = (field, value) => {
    setHighestAuthority(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommitteeChange = (field, value) => {
    setCommitteeDetails(prev => ({
      ...prev,
      [field]: value
    }));
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
            value={directorStatement}
            onChange={(e) => setDirectorStatement(e.target.value)}
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
                  value={highestAuthority.name}
                  onChange={(e) => handleHighestAuthorityChange('name', e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <FormInput
                  name="designation"
                  value={highestAuthority.designation}
                  onChange={(e) => handleHighestAuthorityChange('designation', e.target.value)}
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
                value={highestAuthority.details}
                onChange={(e) => handleHighestAuthorityChange('details', e.target.value)}
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
                    value="Yes"
                    checked={committeeDetails.hasCommittee === 'Yes'}
                    onChange={(e) => handleCommitteeChange('hasCommittee', e.target.value)}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600"
                    name="hasCommittee"
                    value="No"
                    checked={committeeDetails.hasCommittee === 'No'}
                    onChange={(e) => handleCommitteeChange('hasCommittee', e.target.value)}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {committeeDetails.hasCommittee === 'Yes' && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Committee Name
                  </label>
                  <FormInput
                    name="committeeName"
                    value={committeeDetails.name}
                    onChange={(e) => handleCommitteeChange('name', e.target.value)}
                    placeholder="Enter committee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Committee Details
                  </label>
                  <FormTextArea
                    name="committeeDescription"
                    value={committeeDetails.description}
                    onChange={(e) => handleCommitteeChange('description', e.target.value)}
                    placeholder="Enter detailed information about the committee's role, composition, and responsibilities"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceLeadershipForm;
