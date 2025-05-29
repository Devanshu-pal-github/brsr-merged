import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the API slice
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:8000',
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            // Get the token from localStorage if it exists
            const token = localStorage.getItem('access_token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
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
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: loginData } = await queryFulfilled;
                    // Store token
                    localStorage.setItem('access_token', loginData.access_token);
                    // Automatically trigger module access query after successful login
                    dispatch(apiSlice.endpoints.getModuleAccess.initiate());
                } catch (error) {
                    console.error('Login error:', error);
                }
            },
        }),
        getModuleAccess: builder.query({
            query: () => ({
                url: '/roleAccess/moduleAccess',
                method: 'GET',
            }),
        }),
    }),
});

// Export the auto-generated hooks for the mutations and queries
export const { 
    useBulkUploadQuestionsMutation, 
    useLoginMutation,
    useGetModuleAccessQuery 
} = apiSlice; 