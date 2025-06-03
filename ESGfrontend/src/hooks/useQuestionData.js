import { useState, useEffect } from 'react';

export const useQuestionData = (questionId) => {
    const [questionData, setQuestionData] = useState(null);

    useEffect(() => {
        const loadQuestionData = () => {
            try {
                const activeQuestionsData = JSON.parse(localStorage.getItem('activeQuestionsData') || '[]');
                const foundQuestion = activeQuestionsData.find(q => q.questionId === questionId);
                setQuestionData(foundQuestion || null);
            } catch (error) {
                console.error('Error loading question data:', error);
                setQuestionData(null);
            }
        };

        loadQuestionData();
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', loadQuestionData);
        return () => window.removeEventListener('storage', loadQuestionData);
    }, [questionId]);

    return questionData;
};

export const useAllQuestionData = () => {
    const [allQuestionData, setAllQuestionData] = useState([]);

    useEffect(() => {
        const loadAllQuestionData = () => {
            try {
                const activeQuestionsData = JSON.parse(localStorage.getItem('activeQuestionsData') || '[]');
                setAllQuestionData(activeQuestionsData);
            } catch (error) {
                console.error('Error loading all question data:', error);
                setAllQuestionData([]);
            }
        };

        loadAllQuestionData();
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', loadAllQuestionData);
        return () => window.removeEventListener('storage', loadAllQuestionData);
    }, []);

    return allQuestionData;
};
