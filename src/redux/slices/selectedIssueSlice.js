import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    key: null,
    summary: null,
    issuetype: null,
    status: null,
    sprints: [],
    creatorLogin: null,
    assigneeLogin: null,
    reporterLogin: null,
    storyPoints: null,
    description: null
};

const selectedIssueSlice = createSlice({
    name: "selectedIssue",
    initialState,
    reducers: {
        dropSelection: () => initialState,
        setSelection: (state, action) => {
            state.key = action.payload.key;
            state.summary = action.payload.summary;
            state.issuetype = action.payload.issuetype;
            state.status = action.payload.status;
            state.sprints = action.payload.sprints,
            state.creatorLogin = action.payload.creatorLogin;
            state.assigneeLogin = action.payload.assigneeLogin;
            state.reporterLogin = action.payload.reporterLogin;
            state.storyPoints = action.payload.storyPoints;
            state.description = action.payload.description;
        },
    },
});

export const { dropSelection, setSelection } = selectedIssueSlice.actions;
export const selectSelectedIssue = (state) => state.selectedIssue;
export default selectedIssueSlice.reducer;
