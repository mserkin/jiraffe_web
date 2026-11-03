import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    issues: [],
    progress: 0,
    total: 0,
};

const searchResultsSlice = createSlice({
    name: "searchResults",
    initialState,
    reducers: {
        clearSearchResults: () => initialState,
        setSearchResults: (state, action) => {
            state.issues = action.payload.issues;
            state.progress = action.payload.progress ?? 0;
            state.total = action.payload.total ?? 0;
        },
    },
});

export const { clearSearchResults, setSearchResults } =
    searchResultsSlice.actions;
export const selectSearchResults = (state) => state.searchResults;
export default searchResultsSlice.reducer;
