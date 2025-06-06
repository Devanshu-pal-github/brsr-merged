import React from 'react';
import CompanyLayout from '../layouts/CompanyLayout';
import { GeneralDetails, Policy, Grievance, Disclosures } from '../components/TabContents';

const CompanyPage = () => {
  // Render function that returns the appropriate component based on active tab
  const renderContent = (activeTab) => {    switch (activeTab) {
      case 'General Details':
        return <GeneralDetails />;
      case 'Policy and Management':
        return <Policy />;
      case 'Governance Leadership and Oversight':
        return <Grievance />;
      case 'Policy Review':
        return <Disclosures />;
      default:
        return <GeneralDetails />;
    }
  };

  return <CompanyLayout>{renderContent}</CompanyLayout>;
};

export default CompanyPage;
