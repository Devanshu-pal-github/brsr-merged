import React, { useState } from 'react';
import { FormSection, FormField, FormInput, FormTextArea, FormButton } from '../common/FormComponents';
import { Card, CardContent, CardFooter } from '../common/CardComponents';

const GeneralDetailsForm = () => {
  const [formData, setFormData] = useState({
    cin: '',
    companyName: '',
    incorporationYear: '',
    registeredAddress: '',
    corporateAddress: '',
    sameAsRegistered: false,
    email: '',
    telephone: '',
    website: '',
    financialYear: '',
    stockExchanges: '',
    paidUpCapital: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    reportingBoundary: 'standalone',
    csrApplicable: 'no',
    turnover: '',
    netWorth: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'sameAsRegistered' && checked 
        ? { corporateAddress: prev.registeredAddress }
        : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-8">
        <CardContent>
          {/* Company Identity Section */}
          <FormSection title="Company Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Corporate Identity Number (CIN)" required>
                <FormInput
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  placeholder="Enter CIN"
                  required
                />
              </FormField>
              <FormField label="Name of Listed Entity" required>
                <FormInput
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </FormField>
              <FormField label="Year of Incorporation" required>
                <FormInput
                  name="incorporationYear"
                  type="number"
                  value={formData.incorporationYear}
                  onChange={handleChange}
                  placeholder="YYYY"
                  required
                  min="1800"
                  max="2100"
                />
              </FormField>
              <FormField label="Financial Year for Reporting" required>
                <FormInput
                  name="financialYear"
                  value={formData.financialYear}
                  onChange={handleChange}
                  placeholder="e.g., 2024-25"
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
                  name="registeredAddress"
                  value={formData.registeredAddress}
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
                  name="sameAsRegistered"
                  checked={formData.sameAsRegistered}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="sameAsRegistered" className="text-sm text-gray-700">
                  Corporate address same as registered address
                </label>
              </div>
              <FormField label="Corporate Address" required>
                <FormTextArea
                  name="corporateAddress"
                  value={formData.corporateAddress}
                  onChange={handleChange}
                  placeholder="Enter corporate address"
                  required
                  rows={3}
                  disabled={formData.sameAsRegistered}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </FormField>
              <FormField label="Telephone" required>
                <FormInput
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Enter telephone number"
                  required
                />
              </FormField>
              <FormField label="Website">
                <FormInput
                  type="url"
                  name="website"
                  value={formData.website}
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
                    name="stockExchanges"
                    value={formData.stockExchanges}
                    onChange={handleChange}
                    placeholder="Enter stock exchanges"
                    required
                  />
                </FormField>
                <FormField label="Paid-up Capital" required>
                  <FormInput
                    name="paidUpCapital"
                    value={formData.paidUpCapital}
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
                    name="turnover"
                    value={formData.turnover}
                    onChange={handleChange}
                    placeholder="Enter turnover amount"
                    required
                  />
                </FormField>
                <FormField label="Net Worth (in Rs.)" required>
                  <FormInput
                    type="number"
                    name="netWorth"
                    value={formData.netWorth}
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
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              </FormField>
              <FormField label="Contact Person Email" required>
                <FormInput
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </FormField>
              <FormField label="Contact Person Phone" required>
                <FormInput
                  type="tel"
                  name="contactPersonPhone"
                  value={formData.contactPersonPhone}
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
                      name="reportingBoundary"
                      value="standalone"
                      checked={formData.reportingBoundary === 'standalone'}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Standalone</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportingBoundary"
                      value="consolidated"
                      checked={formData.reportingBoundary === 'consolidated'}
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
                      name="csrApplicable"
                      value="yes"
                      checked={formData.csrApplicable === 'yes'}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="csrApplicable"
                      value="no"
                      checked={formData.csrApplicable === 'no'}
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
          <div className="flex gap-3 justify-end">
            <FormButton 
              variant="secondary" 
              onClick={() => setFormData({
                cin: '',
                companyName: '',
                incorporationYear: '',
                registeredAddress: '',
                corporateAddress: '',
                sameAsRegistered: false,
                email: '',
                telephone: '',
                website: '',
                financialYear: '',
                stockExchanges: '',
                paidUpCapital: '',
                contactPersonName: '',
                contactPersonEmail: '',
                contactPersonPhone: '',
                reportingBoundary: 'standalone',
                csrApplicable: 'no',
                turnover: '',
                netWorth: ''
              })}
            >
              Reset
            </FormButton>
            <FormButton type="submit" variant="primary">
              Save Changes
            </FormButton>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GeneralDetailsForm;
