import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import modulesReducer from './features/modules/moduleSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer, // Add the API slice reducer
        modules: modulesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware), // Add RTK Query middleware
});