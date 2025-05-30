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
          const { data: loginData } = await queryFulfilled;
          // Store token
          localStorage.setItem("access_token", loginData.access_token);
          // Removed automatic module access query call
        } catch (error) {
          console.error("Login error:", error);
        }
      },
    }),
    getModuleAccess: builder.query({
      query: () => ({
        url: "/roleAccess/moduleAccess",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store module access data in localStorage
          localStorage.setItem("moduleAccess", JSON.stringify(data));
          
          if (data?.module_ids?.length > 0) {
            // Automatically fetch complete module details when we get module IDs
            dispatch(
              apiSlice.endpoints.getModuleDetails.initiate(data.module_ids)
            );
          }
        } catch (error) {
          console.error("Module access error:", error);
        }
      },
    }),
    getModuleDetails: builder.mutation({
      query: (moduleIds) => ({
        url: "/modules/details",
        method: "POST",
        body: moduleIds,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.group("Module Details Response");
          console.log("Full Response:", data);

          if (data?.modules?.length > 0) {
            data.modules.forEach((module, index) => {
              console.group(`Module ${index + 1}: ${module.module_name}`);
              console.log("Module ID:", module._id);
              console.log("Module Name:", module.module_name);
              console.log("Description:", module.description);

              if (module.submodules?.length > 0) {
                console.group("Submodules");
                module.submodules.forEach((submodule, sIndex) => {
                  console.log(`${sIndex + 1}. ${submodule.name}`);
                  if (submodule.categories?.length > 0) {
                    console.group("Categories");
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
            console.log("No modules found in the response");
          }
          console.groupEnd();
        } catch (error) {
          console.error("Error fetching module details:", error);
        }
      },
    }),
  }),
});

// Export the auto-generated hooks for the mutations and queries
export const {
  useBulkUploadQuestionsMutation,
  useLoginMutation,
  useGetModuleAccessQuery,
  useGetModuleDetailsMutation,
} = apiSlice;
