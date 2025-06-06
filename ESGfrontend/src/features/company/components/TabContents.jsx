import React from 'react';
import GeneralDetailsForm from './tabs/GeneralDetailsForm';
import PolicyManagementForm from './tabs/PolicyManagementForm';
import GovernanceLeadershipForm from './tabs/GovernanceLeadershipForm';
import PolicyReviewForm from './tabs/PolicyReviewForm';

// Each component is now a simple wrapper around its respective form component
const GeneralDetails = () => <GeneralDetailsForm />;
const Policy = () => <PolicyManagementForm />;
const Grievance = () => <GovernanceLeadershipForm />;
const Disclosures = () => <PolicyReviewForm />;

export { GeneralDetails, Policy, Grievance, Disclosures };
