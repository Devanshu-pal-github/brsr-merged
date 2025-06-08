import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { landingFlowAPI } from '../services/api';

// Async thunk
export const fetchQuestionsByModule = createAsyncThunk(
    'landingFlow/questions/fetchByModule',
    async (moduleId) => {
        try {
            const response = await landingFlowAPI.getQuestionsByModule(moduleId);
            
            // Group questions by category
            const questionsByCategory = response.reduce((acc, question) => {
                const categoryId = question.category_id;
                if (!acc[categoryId]) {
                    acc[categoryId] = {
                        id: categoryId,
                        category_name: question.category_name,
                        questions: []
                    };
                }
                acc[categoryId].questions.push(question);
                return acc;
            }, {});

            return Object.values(questionsByCategory);
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error;
        }
    }
);

export const fetchQuestionsMetadata = createAsyncThunk(
    'landingFlow/questions/fetchMetadata',
    async () => {
        return await landingFlowAPI.getQuestionsMetadata();
    }
);

const initialState = {
    questions: {},
    loading: false,
    error: null
};

const questionsSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        setQuestions: (state, action) => {
            state.questions = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        setError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestionsByModule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestionsByModule.fulfilled, (state, action) => {
                state.loading = false;
                state.questions = {
                    ...state.questions,
                    [action.meta.arg]: action.payload
                };
            })
            .addCase(fetchQuestionsByModule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { setQuestions, setLoading, setError } = questionsSlice.actions;

// Base selector
const selectQuestionsState = state => state.landingFlow?.questions;

// Memoized selectors
export const selectQuestionsByModule = moduleId => createSelector(
    [selectQuestionsState],
    questionsState => {
        const questions = questionsState?.questions?.[moduleId] || [];
        return Array.isArray(questions) ? questions : [];
    }
);

export const selectQuestionsLoading = createSelector(
    [selectQuestionsState],
    questionsState => questionsState?.loading || false
);

export const selectQuestionsError = createSelector(
    [selectQuestionsState],
    questionsState => questionsState?.error || null
);

export default questionsSlice.reducer; 