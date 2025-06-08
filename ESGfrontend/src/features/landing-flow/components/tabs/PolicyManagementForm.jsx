import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuestionField from '../common/QuestionField';
import TableInput from '../common/TableInput';
import ValidationMessage from '../common/ValidationMessage';
import { fetchQuestionsByTab } from '../../store/questions';
import { selectQuestionsByTab, selectQuestionsLoading, selectQuestionsError } from '../../store/questions';
import { selectHasUnsavedChanges } from '../../store/responses';

const PolicyManagementForm = ({ companyId }) => {
    const dispatch = useDispatch();
    const questions = useSelector(state => selectQuestionsByTab(state, 'policy_management'));
    const loading = useSelector(selectQuestionsLoading);
    const error = useSelector(selectQuestionsError);
    const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);

    useEffect(() => {
        dispatch(fetchQuestionsByTab('policy_management'));
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <ValidationMessage message={error} type="error" />;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Policy Management</h2>
                {hasUnsavedChanges && (
                    <ValidationMessage
                        message="You have unsaved changes. They will be automatically saved."
                        type="warning"
                    />
                )}
            </div>

            <div className="space-y-6">
                {questions.map(question => (
                    <div key={question.question_id}>
                        {question.type === 'table' ? (
                            <TableInput
                                question={question}
                                companyId={companyId}
                            />
                        ) : (
                            <QuestionField
                                question={question}
                                companyId={companyId}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PolicyManagementForm; 