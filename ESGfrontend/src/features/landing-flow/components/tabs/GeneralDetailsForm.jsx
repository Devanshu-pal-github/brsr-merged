import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuestionField from '../common/QuestionField';
import TableInput from '../common/TableInput';
import ValidationMessage from '../common/ValidationMessage';
import { 
    fetchQuestionsByModule,
    selectQuestionsByModule, 
    selectQuestionsLoading, 
    selectQuestionsError 
} from '../../store/questions.js';
import { 
    selectHasUnsavedChanges, 
    selectLastSavedAt,
    selectResponsesForQuestions,
    fetchResponses,
    bulkUpdateResponses,
    updateLocalResponse
} from '../../store/responses';

const GeneralDetailsForm = ({ companyId, plantId }) => {
    const dispatch = useDispatch();
    
    // Memoize questions selector
    const questions = useSelector(state => selectQuestionsByModule('general_details')(state)) || [];
    const loading = useSelector(selectQuestionsLoading);
    const error = useSelector(selectQuestionsError);
    const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);
    const lastSavedAt = useSelector(selectLastSavedAt);
    
    // Get all responses for the questions using memoized selector
    const responses = useSelector(state => selectResponsesForQuestions(state, questions));

    // Load questions and responses
    useEffect(() => {
        if (companyId && plantId) {
        dispatch(fetchQuestionsByModule('general_details'));
            const financial_year = localStorage.getItem('financial_year') || '2023_2024';
        dispatch(fetchResponses({ 
            companyId, 
            plantId, 
                sectionId: 'section_a',
                financialYear: financial_year
        }));
        }
    }, [dispatch, companyId, plantId]);

    // Auto-save responses every 30 seconds if there are unsaved changes
    useEffect(() => {
        let saveInterval;
        
        if (hasUnsavedChanges) {
            saveInterval = setInterval(() => {
                handleSubmit();
            }, 30000);
        }

        return () => {
            if (saveInterval) {
                clearInterval(saveInterval);
            }
        };
    }, [hasUnsavedChanges]);

    const handleResponseChange = useCallback((questionId, response) => {
        if (!questionId) return;
        dispatch(updateLocalResponse({ questionId, response }));
    }, [dispatch]);

    const handleSubmit = useCallback(async () => {
        if (!hasUnsavedChanges || !companyId || !plantId) return;

        try {
            // Collect all responses that need to be saved
            const responsesToSave = questions
                .filter(question => question?.question_id)
                .map(question => ({
                question_id: question.question_id,
                response: responses[question.question_id]?.response || {}
                }))
                .filter(r => r.response && Object.keys(r.response).length > 0);

            const financial_year = localStorage.getItem('financial_year') || '2023_2024';

            await dispatch(bulkUpdateResponses({
                companyId,
                plantId,
                sectionId: 'section_a',
                responses: responsesToSave,
                financialYear: financial_year
            })).unwrap();

        } catch (error) {
            console.error('Error saving responses:', error);
        }
    }, [dispatch, companyId, plantId, questions, hasUnsavedChanges, responses]);

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

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return <ValidationMessage message="No questions available" type="warning" />;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">General Details</h2>
                <div className="flex justify-between items-center">
                    {hasUnsavedChanges && (
                        <ValidationMessage
                            message="You have unsaved changes. They will be automatically saved."
                            type="warning"
                        />
                    )}
                    {lastSavedAt && (
                        <span className="text-sm text-gray-500">
                            Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {questions.map(question => (
                    <div key={question.question_id} className="bg-white rounded-lg shadow p-4">
                        {question.type === 'table' ? (
                            <TableInput
                                question={question}
                                value={responses[question.question_id]?.response}
                                onChange={(value) => handleResponseChange(question.question_id, value)}
                            />
                        ) : (
                            <QuestionField
                                question={question}
                                value={responses[question.question_id]?.response}
                                onChange={(value) => handleResponseChange(question.question_id, value)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeneralDetailsForm;