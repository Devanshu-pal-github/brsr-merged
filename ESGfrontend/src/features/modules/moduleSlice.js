import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../../api/apiSlice';

const initialState = {
    modules: [],
    loading: false,
    error: null
};

const moduleSlice = createSlice({
    name: 'modules',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addMatcher(
            apiSlice.endpoints.getModuleDetails.matchFulfilled,
            (state, action) => {
                state.modules = action.payload.modules.map(module => ({
                    id: module._id,
                    name: module.module_name,
                    route: `/${module.module_name.toLowerCase().replace(/\s+/g, '')}`,
                    icon: 'FileText', // Default icon, you can map this based on module name if needed
                    submodules: module.submodules?.map(submodule => ({
                        id: submodule.id,
                        name: submodule.submodule_name,
                        categories: submodule.question_categories
                    })) || []
                }));
                state.loading = false;
                state.error = null;
            }
        );
        builder.addMatcher(
            apiSlice.endpoints.getModuleDetails.matchPending,
            (state) => {
                state.loading = true;
                state.error = null;
            }
        );
        builder.addMatcher(
            apiSlice.endpoints.getModuleDetails.matchRejected,
            (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        );
    }
});

export default moduleSlice.reducer;

// Selector to get all modules
export const selectAllModules = (state) => state.modules.modules; 