import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from '../features/landing-flow/store/questions';
import responsesReducer from '../features/landing-flow/store/responses';
import authReducer from '../features/auth/authSlice';

// Configure axios defaults
import axios from 'axios';

// Create axios instance with defaults
axios.defaults.baseURL = 'http://localhost:8000';

// Add token to requests if available
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear local storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const store = configureStore({
    reducer: {
        landingFlow: {
            questions: questionsReducer,
            responses: responsesReducer
        },
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/login/fulfilled'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['items.dates']
            }
        })
}); 