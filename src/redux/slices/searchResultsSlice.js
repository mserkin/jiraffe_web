import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    issues: [],
    progress: 0,
    limitReached: false,
    countLimit: 0,
    hasSearchRun: false,
    isSearchComplete: false,
    searchError: null,
    resetVersion: 0,
};

const searchResultsSlice = createSlice({
    name: "searchResults",
    initialState,
    reducers: {
        clearSearchResults: (state) => ({
            ...initialState,
            resetVersion: state.resetVersion + 1,
        }),
        setSearchResults: (state, action) => {
            state.issues = action.payload.issues;
            state.progress = action.payload.progress ?? 0;
            state.limitReached = action.payload.limitReached ?? false;
            state.countLimit = action.payload.countLimit ?? 0;
            state.hasSearchRun = true;
            state.isSearchComplete = false;
        },
        setSearchComplete: (state, action) => {
            state.isSearchComplete = action.payload;
        },
        setSearchError: (state, action) => {
            state.searchError = action.payload;
        },
    },
});

export const {
    clearSearchResults,
    setSearchResults,
    setSearchComplete,
    setSearchError,
} = searchResultsSlice.actions;
export const selectSearchResults = (state) => state.searchResults;
export default searchResultsSlice.reducer;
