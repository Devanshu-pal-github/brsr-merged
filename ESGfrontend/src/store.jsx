import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice.jsx';
import modulesReducer from './features/modules/moduleSlice';
import landingFlowQuestionsReducer from './features/landing-flow/store/questions';
import landingFlowResponsesReducer from './features/landing-flow/store/responses';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        modules: modulesReducer,
        landingFlow: {
            questions: landingFlowQuestionsReducer,
            responses: landingFlowResponsesReducer
        }
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false // Disable serializable check for now
        }).concat(apiSlice.middleware),
});