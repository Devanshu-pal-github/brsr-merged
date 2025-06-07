import axios from 'axios';
import questionsData from '../data/landingFlow/questions.json';
import answersData from '../data/landingFlow/answers.json';

const BASE_URL = process.env.REACT_APP_API_URL;

class LandingFlowService {    // Get all questions for a specific tab
    static getTabQuestions(tabId) {
        const tab = questionsData.tabs.find(t => t.id === tabId);
        return tab ? tab.questions : [];
    }

    // Get answer for a specific question
    static getAnswer(questionId, tabId) {
        return tabId && answersData.responses[tabId]?.[questionId] || null;
    }

    // Get all answers for a tab
    static getTabAnswers(tabId) {
        return answersData.responses[tabId] || {};
    }

    // Save answer for a question
    static async saveAnswer(tabId, questionId, answer) {
        try {
            // Validate the tab exists
            if (!answersData.responses[tabId]) {
                answersData.responses[tabId] = {};
            }

            // Update local state first for immediate feedback
            answersData.responses[tabId][questionId] = {
                ...answer,
                timestamp: new Date().toISOString(),
                updated_by: "current_user" // TODO: Get from auth context
            };
            
            // Update metadata
            answersData.metadata = {
                ...answersData.metadata,
                last_updated: new Date().toISOString(),
                last_updated_by: "current_user", // TODO: Get from auth context
                status: "draft"
            };

            // Sync with backend
            const response = await axios.patch(`${BASE_URL}/landing-flow/responses`, {
                tab_id: tabId,
                question_id: questionId,
                response: answer
            });

            return response.data;
        } catch (error) {
            console.error('Error saving answer:', error);
            throw error;
        }
    }

    // Validate all required fields in a tab
    static validateTab(tabId) {
        const tab = questionsData.tabs.find(t => t.id === tabId);
        if (!tab) return { isValid: false, errors: ['Tab not found'] };

        const errors = [];
        const tabAnswers = this.getTabAnswers(tabId);

        tab.questions.forEach(question => {
            const answer = tabAnswers[question.question_id];
            if (question.string_value_required && !answer?.string_value) {
                errors.push(`${question.question} is required`);
            }
            if (question.decimal_value_required && answer?.decimal_value === null) {
                errors.push(`${question.question} is required`);
            }
            if (question.boolean_value_required && answer?.bool_value === null) {
                errors.push(`${question.question} requires a yes/no answer`);
            }
            if (question.link_required && !answer?.link) {
                errors.push(`${question.question} requires a link`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Submit all answers for final processing
    static async submitLandingFlow() {
        try {
            // Validate all tabs first
            const validationErrors = [];
            questionsData.tabs.forEach(tab => {
                const { isValid, errors } = this.validateTab(tab.id);
                if (!isValid) {
                    validationErrors.push(...errors.map(error => `${tab.name}: ${error}`));
                }
            });

            if (validationErrors.length > 0) {
                throw new Error('Validation failed:\n' + validationErrors.join('\n'));
            }

            // Update status to submitted
            answersData.metadata.status = 'submitted';
            answersData.metadata.last_updated = new Date().toISOString();
            answersData.metadata.last_updated_by = 'current_user'; // TODO: Get from auth context

            const response = await axios.post(`${BASE_URL}/landing-flow/submit`, {
                responses: answersData.responses,
                metadata: answersData.metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting landing flow:', error);
            throw error;
        }
    }
}

export default LandingFlowService;
