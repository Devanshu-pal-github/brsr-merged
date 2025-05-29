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
                    icon: 'FileText',
                    submodules: module.submodules?.map(submodule => ({
                        id: submodule.id,
                        name: submodule.submodule_name,
                        submodule_name: submodule.submodule_name,
                        question_categories: submodule.question_categories?.map(category => ({
                            id: category.id,
                            category_name: category.category_name,
                            questions: category.questions?.map(question => ({
                                ...question,
                                type: question.type || 'subjective'
                            })) || []
                        })) || []
                    })) || []
                }));
                state.loading = false;
                state.error = null;
                
                console.log('Transformed modules:', state.modules);
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