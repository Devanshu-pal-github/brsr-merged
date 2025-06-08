import { useState, useEffect } from 'react';
import { useGetModuleResponsesQuery, useBulkUpdateResponsesMutation } from '../api/apiSlice.jsx';

export const useFormData = (moduleId, initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: existingResponses, isLoading: isLoadingResponses } = useGetModuleResponsesQuery({
    moduleId
  });

  const [bulkUpdateResponses] = useBulkUpdateResponsesMutation();

  useEffect(() => {
    if (existingResponses) {
      setFormData(prev => ({
        ...prev,
        ...existingResponses
      }));
    }
  }, [existingResponses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const responses = {
        responses: Object.entries(formData).map(([questionId, value]) => {
          // Clean up the response by removing null/undefined/empty values
          const cleanValue = Object.entries(value).reduce((acc, [key, val]) => {
            if (val !== null && val !== undefined && val !== '') {
              acc[key] = val;
            }
            return acc;
          }, {});

          return {
            question_id: questionId,
            ...cleanValue,
            module_id: moduleId
          };
        }),
        moduleId
      };

      const result = await bulkUpdateResponses(responses).unwrap();
      if ('error' in result) {
        throw new Error(result.error.message || 'Failed to save responses');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
      console.error('Error saving responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const updatedValue = {
      ...formData[name], // Keep existing values
      string_value: type === 'text' || type === 'email' || type === 'tel' || type === 'url' ? value : formData[name]?.string_value,
      decimal_value: type === 'number' ? (value ? parseFloat(value) : null) : formData[name]?.decimal_value,
      bool_value: type === 'checkbox' ? checked : type === 'radio' ? value === 'yes' : formData[name]?.bool_value
    };

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    isLoadingResponses,
    handleSubmit,
    handleChange
  };
};
