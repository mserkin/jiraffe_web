import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';
import { ISSUE_TYPES_PATH_PART, LINK_TYPES_PATH_PART } from '../../modules/const';

const initialState = {
    issueTypes: [],
    linkTypes: [],
    sprints: [],
};

const fetchJiraMetadata = createAsyncThunk(
    'jiraMetadata',
    async ({ }, thunkAPI) => {
        try {
            const issueTypes = (await axios.get(ISSUE_TYPES_PATH_PART)).data;
            const linkTypes = (await axios.get(LINK_TYPES_PATH_PART)).data;
            return {
                issue_types: issueTypes,
                link_types: linkTypes,
                sprints: []
            };
        } catch (error) {
            thunkAPI.dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
            throw error;
        }
    },
);

const jiraMetadataSlice = createSlice({
    name: 'jiraMetadata',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(fetchJiraMetadata.fulfilled, (state, action) => {
            return action.payload;
        });
    },
});
const selectJiraMetadata = (state) => state.jiraMetadata;
const selectIssueTypes = (state) => state.jiraMetadata.issueTypes;
const selectLinkTypes = (state) => state.jiraMetadata.linkTypes;
const selectSprints = (state) => state.jiraMetadata.sprints;

export {
    selectJiraMetadata, 
    fetchJiraMetadata,
    selectIssueTypes,
    selectLinkTypes,
    selectSprints,
};

export default jiraMetadataSlice.reducer;
