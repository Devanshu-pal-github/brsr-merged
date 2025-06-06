import React, { useState } from 'react';
import { FormSection, FormField, FormInput, FormTextArea, FormButton } from '../common/FormComponents';
import { Card, CardContent, CardFooter } from '../common/CardComponents';

const GeneralDetailsForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FormSection title="General Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Company Name" required>
                <FormInput
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </FormField>
              <FormField label="Registration Number" required>
                <FormInput
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="Enter registration number"
                  required
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Contact Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email" required>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </FormField>
              <FormField label="Phone">
                <FormInput
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Address">
            <div className="space-y-4">
              <FormField label="Street Address" required>
                <FormTextArea
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  required
                  rows={2}
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="City" required>
                  <FormInput
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </FormField>
                <FormField label="State" required>
                  <FormInput
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </FormField>
                <FormField label="PIN Code" required>
                  <FormInput
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="Enter PIN code"
                    required
                  />
                </FormField>
              </div>
            </div>
          </FormSection>
        </CardContent>

        <CardFooter>
          <div className="flex gap-3">
            <FormButton variant="secondary" onClick={() => setFormData({
              companyName: '',
              registrationNumber: '',
              email: '',
              phone: '',
              streetAddress: '',
              city: '',
              state: '',
              pinCode: '',
            })}>
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
