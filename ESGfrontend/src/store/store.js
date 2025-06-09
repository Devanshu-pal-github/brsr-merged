import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from '../features/landing-flow/store/questions';
import responsesReducer from '../features/landing-flow/store/responses';
import authReducer from '../features/auth/authSlice';

// Configure axios defaults
import axios from 'axios';

// Create axios instance with defaults
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add token to requests if available
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request details in development
        if (process.env.NODE_ENV === 'development') {
            console.group('🌐 API Request');
            console.log('URL:', config.url);
            console.log('Method:', config.method);
            console.log('Headers:', config.headers);
            if (config.data) console.log('Body:', config.data);
            console.groupEnd();
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Handle responses and errors
axios.interceptors.response.use(
    (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.group('✅ API Response');
            console.log('Data:', response.data);
            console.groupEnd();
        }
        return response;
    },
    async (error) => {
        // Log error details
        console.group('❌ API Error');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
        console.groupEnd();

        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('company_id');
            localStorage.removeItem('plant_id');
            localStorage.removeItem('financial_year');
            
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const store = configureStore({
    reducer: {
        questions: questionsReducer,
        responses: responsesReducer,
        auth: authReducer
    }
});

export default store; 