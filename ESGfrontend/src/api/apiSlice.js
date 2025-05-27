import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the API slice
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:8000',
        credentials: 'include', // Include credentials (cookies, etc.) if needed for CORS
    }), 
    endpoints: (builder) => ({
        bulkUploadQuestions: builder.mutation({
            query: (questions) => ({
                url: '/questions/',
                method: 'POST',
                body: questions,
            }),
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials,
            }),
        }),
    }),
});

// Export the auto-generated hooks for the mutations
export const { useBulkUploadQuestionsMutation, useLoginMutation } = apiSlice;