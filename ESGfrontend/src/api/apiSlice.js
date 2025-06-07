import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Custom baseQuery to handle 401 Unauthorized globally
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("company_id");
    localStorage.removeItem("plant_id");
    localStorage.removeItem("financial_year");
    localStorage.removeItem("module_ids");
    localStorage.removeItem("modules");
    window.location.href = "/login";
  }
  return result;
};

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ['PolicyAnswers', 'Questions', 'Answers', 'Responses'],
  endpoints: (builder) => ({
    bulkUploadQuestions: builder.mutation({
      query: (questions) => ({
        url: "/questions/",
        method: "POST",
        body: questions,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("user_id", data.user_id);
          localStorage.setItem("user_role", JSON.stringify(data.user_role));
          localStorage.setItem("company_id", data.company_id);
          localStorage.setItem("plant_id", data.plant_id);
          localStorage.setItem("financial_year", data.financial_year);
          console.log("Stored user data in localStorage");
        } catch (error) {
          console.error("Login error:", error);
        }
      },
    }),
    getModuleAccess: builder.query({
      query: () => ({
        url: `/roleAccess/moduleAccess`,
        method: "GET"
      }),
      transformResponse: (response) => {
        console.log('📥 Module Access Response:', response);
        if (response?.module_ids) {
          console.log('💾 Storing module IDs:', response.module_ids);
          localStorage.setItem("module_ids", JSON.stringify(response.module_ids));
          return response.module_ids;
        }
        console.warn('⚠️ No module IDs found in response');
        return [];
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Module access query completed successfully');
        } catch (error) {
          console.error('❌ Module access query failed:', error);
        }
      }
    }),
    getModuleDetails: builder.mutation({
      query: () => {
        const moduleIds = JSON.parse(localStorage.getItem("module_ids") || "[]");
        console.log('🔄 Fetching module details for IDs:', moduleIds);
        
        if (!moduleIds || moduleIds.length === 0) {
          console.warn('⚠️ No module IDs found in localStorage');
          throw new Error('No module IDs available');
        }
        
        return {
          url: "/modules/details",
          method: "POST",
          body: moduleIds,
          headers: {
            'Content-Type': 'application/json'
          }
        };
      },
      transformResponse: (response) => {
        console.log('📥 Module Details Raw Response:', response);
        if (response?.modules) {
          console.log('💾 Storing module details in localStorage');
          localStorage.setItem("modules", JSON.stringify(response.modules));
          return response;
        }
        console.warn('⚠️ No modules found in response');
        return { modules: [] };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.group("📦 Module Details Response");
          console.log("Full Response:", data);

          if (data?.modules?.length > 0) {
            data.modules.forEach((module, index) => {
              console.group(`📑 Module ${index + 1}: ${module.module_name}`);
              console.log("Module ID:", module._id);
              console.log("Module Name:", module.module_name);
              console.log("Description:", module.description);

              if (module.submodules?.length > 0) {
                console.group("📚 Submodules");
                module.submodules.forEach((submodule, sIndex) => {
                  console.log(`${sIndex + 1}. ${submodule.name}`);
                  if (submodule.categories?.length > 0) {
                    console.group("🗂️ Categories");
                    submodule.categories.forEach((category, cIndex) => {
                      console.log(`${cIndex + 1}. ${category.name}`);
                    });
                    console.groupEnd();
                  }
                });
                console.groupEnd();
              }
              console.groupEnd();
            });
          } else {
            console.warn("⚠️ No modules found in the response");
          }
          console.groupEnd();
        } catch (error) {
          console.error("❌ Error fetching module details:", error);
          throw error;
        }
      },
    }),
    

    getSubmodulesByModuleId: builder.query({
      query: (moduleId) => {
        if (!moduleId) {
          throw new Error('Module ID is required to fetch submodules');
        }
        console.log('🔄 Fetching submodules for module ID:', moduleId);
        return {
          url: `/modules/${moduleId}/submodules`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        };
      },

      transformResponse: (response) => {
        if (Array.isArray(response)) {
          console.log('📥 Submodules Response:', response);
          return response;
        }
        console.warn('⚠️ No submodules found in response');
        return [];
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Submodules fetched successfully:', data);
        } catch (error) {
          console.error('❌ Error fetching submodules:', error);
        }
      }
    }),
    getQuestionResponses: builder.mutation({
      query: (questionIds) => ({
        url: '/questionResponses',
        method: 'POST',
        body: { question_ids: questionIds },
        headers: {
          'Content-Type': 'application/json',
        }
      }),
    }),
    submitQuestionAnswer: builder.mutation({
      query: ({ questionId, answerData }) => {
        if (!questionId) throw new Error('Question ID is required');
        if (!answerData || typeof answerData !== 'object') throw new Error('Answer data is required and must be an object');
        
        const company_id = localStorage.getItem("company_id");
        const plant_id = localStorage.getItem("plant_id");
        const financial_year = localStorage.getItem("financial_year");

        if (!company_id || !plant_id || !financial_year) {
          throw new Error('Missing required context: company_id, plant_id, or financial_year');
        }

        const questionUpdate = {
          question_id: questionId,
          response: answerData
        };

        return {
          url: `/company/${company_id}/plants/${plant_id}/reportsNew/${financial_year}`,
          method: 'PATCH',
          body: [questionUpdate],
          headers: {
            'Content-Type': 'application/json',
          }
        };
      },
      transformResponse: (response) => {
        console.log('📥 Answer submission response:', response);
        return response;
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Answer submitted successfully:', data);
        } catch (error) {
          console.error('❌ Error submitting answer:', error);
          throw error;
        }
      }
    }),
    storeQuestionData: builder.mutation({
      query: ({ moduleId, questionId, metadata, answer }) => ({
        url: '/questionData',
        method: 'POST',
        body: {
          moduleId,
          questionId,
          metadata,
          answer,
        },
        headers: {
          'Content-Type': 'application/json',
        }
      }),
      async onQueryStarted({ moduleId, questionId, metadata, answer }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Stored question data in backend:', data);
        } catch (error) {
          console.error('❌ Error storing question data in backend:', error);
        }
      }
    }),
    getStoredQuestions: builder.query({
      query: () => '/questionData',
      transformResponse: (response) => {
        const storedQuestions = JSON.parse(localStorage.getItem('questionData') || '{}');
        return {
          ...response,
          ...storedQuestions
        };
      }
    }),
    // New endpoints for Gemini AI integration
    generateText: builder.mutation({
      query: ({ message, context }) => ({
        url: '/api/generate',
        method: 'POST',
        body: { message, context },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }),
      transformResponse: (response) => {
        console.log('📥 Generate Text Response:', response);
        if (response?.text) {
          return response.text;
        }
        throw new Error('No text found in response');
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Text generated successfully:', data);
        } catch (error) {
          console.error('❌ Error generating text:', error);
        }
      }
    }),

getAllPlantEmployees: builder.query({
  query: () => {
    console.log('🔄 Fetching employees for authenticated user’s plant');
    return {
      url: '/plants/employees',
      method: 'GET',
    };
  },
}),


createEmployee: builder.mutation({
      query: (employee) => {
        console.log('🔄 Creating employee:', employee);
        return {
          url: '/plants/employees',
          method: 'POST',
          body: employee,
        };
      },
      invalidatesTags: ['Employees'], // Refetch employees after creation
    }),

      updateEmployeeRoles: builder.mutation({
      query: ({ employee_id, roles }) => {
        console.log('🔄 Updating roles for employee:', { employee_id, roles });
        return {
          url: '/plants/employees/updateRole',
          method: 'PUT',
          body: { employee_id, roles },
        };
      },
      invalidatesTags: ['Employees'],
    }),
    createGenerateStream: builder.mutation({
      query: ({ message, context }) => ({
        url: '/api/generate_stream',
        method: 'POST',
        body: { message, context },
        headers: {
          'Content-Type': 'application/json',
        }
      }),
      transformResponse: (response) => {
        console.log('📥 Create Stream Response:', response);
        if (response?.streamId) {
          return response.streamId;
        }
        throw new Error('No streamId found in response');
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Stream created successfully:', data);
        } catch (error) {
          console.error('❌ Error creating stream:', error);
        }
      }
    }),
    updatePolicyAnswers: builder.mutation({
      query: ({ questionId, response }) => {
        const company_id = localStorage.getItem("company_id");
        const plant_id = localStorage.getItem("plant_id");
        const financial_year = localStorage.getItem("financial_year");

        if (!company_id || !plant_id || !financial_year) {
          throw new Error('Missing required context: company_id, plant_id, or financial_year');
        }

        const answerUpdate = {
          question_id: questionId,
          response: response
        };

        return {
          url: `/company/${company_id}/plants/${plant_id}/reportsNew/${financial_year}`,
          method: "PATCH",
          body: [answerUpdate],
        };
      },
      transformResponse: (response) => {
        return { success: true, data: response };
      },      async onQueryStarted({ questionId, response }, { dispatch, getState }) {
        try {
          // Import answers.json data
          const answersData = JSON.parse(localStorage.getItem('answers') || '{}');
          const tabId = 'policy_management'; // or determine dynamically based on question

          // Update the answers structure
          if (!answersData.responses) {
            answersData.responses = {};
          }
          if (!answersData.responses[tabId]) {
            answersData.responses[tabId] = {};
          }

          // Update the specific answer
          answersData.responses[tabId][questionId] = {
            ...response,
            timestamp: new Date().toISOString(),
            updated_by: localStorage.getItem('user_id') || 'current_user',
            status: 'draft'
          };

          // Update metadata
          if (!answersData.meta) {
            answersData.meta = {};
          }
          answersData.meta = {
            ...answersData.meta,
            version: "1.0.0",
            last_updated: new Date().toISOString(),
            updated_by: localStorage.getItem('user_id') || 'current_user',
          };

          // Store back in localStorage
          localStorage.setItem('answers', JSON.stringify(answersData));

          // Log update for debugging
          console.log('✅ Updated answers data:', { questionId, newValue: response });
        } catch (error) {
          console.error('❌ Error updating answers:', error);
        }
      },
      invalidatesTags: (result) => result?.success 
        ? ['PolicyAnswers', 'Answers', 'Responses'] 
        : [],
    }),
    getAnswers: builder.query({
      query: () => {
        const company_id = localStorage.getItem("company_id");
        const plant_id = localStorage.getItem("plant_id");
        const financial_year = localStorage.getItem("financial_year");

        if (!company_id || !plant_id || !financial_year) {
          throw new Error('Missing required context');
        }

        return {
          url: `/company/${company_id}/plants/${plant_id}/reportsNew/${financial_year}`,
          method: 'GET',
        };
      },      transformResponse: (response) => {
        try {
          // Get stored answers with proper structure
          const storedAnswers = JSON.parse(localStorage.getItem('answers') || '{"responses":{},"meta":{}}');
          
          // Convert backend response to our local format
          const backendAnswers = response?.answers || {};
          
          // Deep merge responses
          const mergedAnswers = {
            responses: {
              ...backendAnswers,
              ...storedAnswers.responses,
            },
            meta: {
              version: "1.0.0",
              last_updated: new Date().toISOString(),
              updated_by: localStorage.getItem('user_id') || 'current_user',
              ...storedAnswers.meta,
            }
          };

          // Update local storage with merged data
          localStorage.setItem('answers', JSON.stringify(mergedAnswers));
          
          console.log('✅ Merged answers data:', mergedAnswers);
          return mergedAnswers;
        } catch (error) {
          console.error('❌ Error transforming answers:', error);
          return { responses: {}, meta: {} };
        }
      },
      providesTags: ['Answers', 'PolicyAnswers', 'Responses']
    }),
  }),
});

// Export all hooks
export const {
  useBulkUploadQuestionsMutation,
  useLoginMutation,
  useGetModuleAccessQuery,
  useGetModuleDetailsMutation,
  useCreateEmployeeMutation,
  useGetSubmodulesByModuleIdQuery,
  useGetQuestionResponsesMutation,
  useSubmitQuestionAnswerMutation,
  useStoreQuestionDataMutation,
  useGetStoredQuestionsQuery,
  useGenerateTextMutation,
  useCreateGenerateStreamMutation,
  useGetAllPlantEmployeesQuery,
  useUpdateEmployeeRolesMutation,
  useUpdatePolicyAnswersMutation,
  useGetAnswersQuery,
} = apiSlice;