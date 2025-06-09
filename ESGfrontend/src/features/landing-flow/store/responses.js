import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchResponses = createAsyncThunk(
    'landingFlow/responses/fetch',
    async ({ companyId, plantId, sectionId, financialYear }) => {
        const response = await axios.get(`/company/${companyId}/plants/${plantId}/reportsNew/${financialYear}`);
        // Extract responses from the response data
        return response.data?.responses || {};
    }
);

export const bulkUpdateResponses = createAsyncThunk(
    'landingFlow/responses/bulkUpdate',
    async ({ companyId, plantId, sectionId, responses, financialYear }) => {
        const response = await axios.post(
            `/company/${companyId}/plants/${plantId}/reportsNew/${financialYear}`,
            responses.map(response => ({
                ...response,
                section_id: sectionId,
                financial_year: financialYear
            }))
        );
        return response.data?.responses || {};
    }
);

const initialState = {
    byId: {},
    loading: false,
    error: null,
    unsavedChanges: new Set(),
    lastSavedAt: null
};

const responsesSlice = createSlice({
    name: 'landingFlow/responses',
    initialState,
    reducers: {
        clearResponses: (state) => {
            state.byId = {};
            state.error = null;
            state.unsavedChanges = new Set();
            state.lastSavedAt = null;
        },
        markUnsaved: (state, action) => {
            state.unsavedChanges.add(action.payload);
        },
        markSaved: (state, action) => {
            state.unsavedChanges.delete(action.payload);
        },
        updateLocalResponse: (state, action) => {
            const { questionId, response } = action.payload;
            if (!state.byId) state.byId = {};
            state.byId[questionId] = {
                question_id: questionId,
                response: response || {}
            };
            state.unsavedChanges.add(questionId);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch responses
            .addCase(fetchResponses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResponses.fulfilled, (state, action) => {
                state.loading = false;
                state.byId = action.payload || {};
            })
            .addCase(fetchResponses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Bulk update responses
            .addCase(bulkUpdateResponses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUpdateResponses.fulfilled, (state, action) => {
                state.loading = false;
                state.byId = {
                    ...state.byId,
                    ...action.payload
                };
                // Clear unsaved changes for updated questions
                Object.keys(action.payload || {}).forEach(questionId => {
                    state.unsavedChanges.delete(questionId);
                });
                state.lastSavedAt = new Date().toISOString();
            })
            .addCase(bulkUpdateResponses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

// Base selectors
const selectResponsesState = state => state?.landingFlow?.responses;
const selectResponsesById = state => selectResponsesState(state)?.byId || {};

// Memoized selectors
export const selectResponseByQuestionId = createSelector(
    [selectResponsesById, (_, questionId) => questionId],
    (byId, questionId) => byId[questionId] || null
);

export const selectResponsesForQuestions = createSelector(
    [selectResponsesById, (_, questions) => questions],
    (byId, questions) => {
        if (!questions || !Array.isArray(questions)) return {};
        
        return questions.reduce((acc, question) => {
            if (!question?.question_id) return acc;
            
            acc[question.question_id] = byId[question.question_id] || {
                question_id: question.question_id,
                response: {}
            };
            return acc;
        }, {});
    }
);

export const selectResponsesLoading = createSelector(
    [selectResponsesState],
    state => state?.loading || false
);

export const selectResponsesError = createSelector(
    [selectResponsesState],
    state => state?.error || null
);

export const selectHasUnsavedChanges = createSelector(
    [selectResponsesState],
    state => (state?.unsavedChanges?.size || 0) > 0
);

export const selectIsQuestionUnsaved = createSelector(
    [selectResponsesState, (_, questionId) => questionId],
    (state, questionId) => state?.unsavedChanges?.has(questionId) || false
);

export const selectLastSavedAt = createSelector(
    [selectResponsesState],
    state => state?.lastSavedAt || null
);

export const { clearResponses, markUnsaved, markSaved, updateLocalResponse } = responsesSlice.actions;

export default responsesSlice.reducer; 