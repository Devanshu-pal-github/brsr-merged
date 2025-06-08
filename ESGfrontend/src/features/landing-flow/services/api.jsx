import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';

// API service for landing flow
export const landingFlowAPI = {
    // Questions
    async getQuestionsByModule(moduleId) {
        try {
            const response = await axios.get(`/questions/module/${moduleId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Responses
    async getResponsesBySection(companyId, plantId, sectionId) {
        try {
            const response = await axios.get(`/company/${companyId}/plant/${plantId}/responses/${sectionId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async bulkUpdateResponses(companyId, plantId, sectionId, responses, financialYear) {
        try {
            // Add section_id and financial_year to each response
            const preparedResponses = responses.map(response => ({
                ...response,
                section_id: sectionId,
                financial_year: financialYear
            }));

            const response = await axios.post(
                `/company/${companyId}/plant/${plantId}/responses/${sectionId}/bulk`,
                preparedResponses
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Validation
    async validateResponse(questionId, response) {
        try {
            const result = await axios.get(`/questions/validate/${questionId}`, {
                params: { response }
            });
            return result.data.is_valid;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Metadata
    async getQuestionsMetadata() {
        try {
            const response = await axios.get('/questions/metadata');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Error handling
    handleError(error) {
        if (error.response) {
            // Server responded with error
            throw new Error(error.response.data.detail || error.response.data.message || 'Server error');
        } else if (error.request) {
            // Request made but no response
            throw new Error('No response from server');
        } else {
            // Something else went wrong
            throw error;
        }
    }
}; 