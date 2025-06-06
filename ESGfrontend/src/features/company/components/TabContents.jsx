import React from 'react';
import GeneralDetailsForm from './tabs/GeneralDetailsForm';
import PolicyForm from './tabs/PolicyForm';
import GrievanceForm from './tabs/GrievanceForm';
import DisclosuresForm from './tabs/DisclosuresForm';

// Each component is now a simple wrapper around its respective form component
const GeneralDetails = () => <GeneralDetailsForm />;
const Policy = () => <PolicyForm />;
const Grievance = () => <GrievanceForm />;
const Disclosures = () => <DisclosuresForm />;

export { GeneralDetails, Policy, Grievance, Disclosures };
