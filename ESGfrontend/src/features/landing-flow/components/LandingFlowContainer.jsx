import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GeneralDetailsForm from './tabs/GeneralDetailsForm';
import PolicyManagementForm from './tabs/PolicyManagementForm';
import PolicyReviewForm from './tabs/PolicyReviewForm';
import GovernanceForm from './tabs/GovernanceForm';
import ValidationMessage from './common/ValidationMessage';
import { selectHasUnsavedChanges } from '../store/responses';

const TABS = [
    { id: 'general_details', label: 'General Details' },
    { id: 'policy_management', label: 'Policy Management' },
    { id: 'policy_review', label: 'Policy Review' },
    { id: 'governance', label: 'Governance' }
];

const LandingFlowContainer = ({ companyId }) => {
    const [activeTab, setActiveTab] = useState('general_details');
    const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);

    // Handle tab change
    const handleTabChange = (tabId) => {
        if (hasUnsavedChanges) {
            // Let the user know their changes are being saved
            // The auto-save functionality in the form components will handle the actual saving
        }
        setActiveTab(tabId);
    };

    // Render the active form component
    const renderActiveForm = () => {
        switch (activeTab) {
            case 'general_details':
                return <GeneralDetailsForm companyId={companyId} />;
            case 'policy_management':
                return <PolicyManagementForm companyId={companyId} />;
            case 'policy_review':
                return <PolicyReviewForm companyId={companyId} />;
            case 'governance':
                return <GovernanceForm companyId={companyId} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                                    py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Active Form */}
            <div className="bg-white rounded-lg shadow">
                {renderActiveForm()}
            </div>
        </div>
    );
};

export default LandingFlowContainer; 