import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // Get the token from localStorage if it exists
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
          // Store all relevant user data
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
      query: () => {
        const company_id = localStorage.getItem("company_id");
        const plant_id = localStorage.getItem("plant_id");
        const financial_year = localStorage.getItem("financial_year");
        const user_role = localStorage.getItem("user_role");
        
        // Parse user_role - if it's an array in string form, get the first role
        const primaryRole = user_role ? 
          (JSON.parse(user_role)[0] || "default") : 
          "default";
        
        console.log("🔄 Initiating module access request with params:", { 
          company_id, 
          plant_id, 
          financial_year,
          user_role: primaryRole
        });
        
        return {
          url: `/roleAccess/moduleAccess`,
          method: "POST",
          body: {
            company_id,
            plant_id,
            financial_year,
            user_role: primaryRole // Send single role as string
          },
          headers: {
            'Content-Type': 'application/json'
          }
        };
      },
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
        
        // The backend expects module_ids as a direct parameter, not nested in a body object
        return {
          url: "/modules/details",
          method: "POST",
          body: moduleIds,  // Send the array directly as the body
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
    createEmployee: builder.mutation({
      query: ({ company_id, plant_id, financial_year, employee }) => ({
        url: `/plants/${plant_id}/employees/${financial_year}?company_id=${company_id}`,
        method: "POST",
        body: employee,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Employee created successfully:", data);
        } catch (error) {
          console.error("Create employee error:", error);
        }
      },
    }),
    getSubmodulesByModuleId: builder.query({
      query: (moduleId) => {
        if (!moduleId) {
          throw new Error('Module ID is required to fetch submodules');
        }
        // Use the module ID from module access API and the correct endpoint
        console.log('🔄 Fetching submodules for module ID:', moduleId);
        return {
          url: `/modules/${moduleId}/submodules`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        };
      },
      transformResponse: (response) => {
        // The response is now a direct array of submodules
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
  }),
});

// Export the auto-generated hooks for the mutations and queries
export const {
  useBulkUploadQuestionsMutation,
  useLoginMutation,
  useGetModuleAccessQuery,
  useGetModuleDetailsMutation,
  useCreateEmployeeMutation,
  useGetSubmodulesByModuleIdQuery,
} = apiSlice;