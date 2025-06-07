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
            const storedAnswers = JSON.parse(localStorage.getItem('answers') || '{}');
            
            // Initialize tab if it doesn't exist
            if (!storedAnswers[tabId]) {
                storedAnswers[tabId] = {};
            }

            // Update local storage with new answer
            storedAnswers[tabId][questionId] = {
                ...answer,
                timestamp: new Date().toISOString(),
                updated_by: localStorage.getItem('user_id') || 'current_user',
                status: 'draft'
            };

            // Update local storage
            localStorage.setItem('answers', JSON.stringify(storedAnswers));

            // Create the answer update object
            const answerUpdate = {
                question_id: questionId,
                response: answer
            };

            const company_id = localStorage.getItem("company_id");
            const plant_id = localStorage.getItem("plant_id");
            const financial_year = localStorage.getItem("financial_year");

            if (!company_id || !plant_id || !financial_year) {
                throw new Error('Missing required context: company_id, plant_id, or financial_year');
            }

            // Use the standardized endpoint
            const response = await fetch(`${BASE_URL}/company/${company_id}/plants/${plant_id}/reportsNew/${financial_year}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify([answerUpdate])
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
