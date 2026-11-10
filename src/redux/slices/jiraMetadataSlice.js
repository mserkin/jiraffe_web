import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';
import { BACKEND_URI, ISSUE_TYPES_PATH_PART, LINK_TYPES_PATH_PART, SPRINTS_PATH_PART } from '../../modules/const';

const initialState = {
    issueTypes: [],
    linkTypes: [],
    sprints: [],
};

const fetchJiraMetadata = createAsyncThunk(
    'jiraMetadata/fetch',
    async (_, thunkAPI) => {
        console.log("fetchJiraMetadata executed")
        try {
            const issueTypes = (await axios.get(`${BACKEND_URI}${ISSUE_TYPES_PATH_PART}`)).data;
            const linkTypes = (await axios.get(`${BACKEND_URI}${LINK_TYPES_PATH_PART}`)).data;
            const sprints = (await axios.get(`${BACKEND_URI}${SPRINTS_PATH_PART}`)).data;
            const result = {
                issueTypes,
                linkTypes,
                sprints
            }
            return result;
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
        builder
            .addCase(fetchJiraMetadata.fulfilled, (state, action) => {
                state.issueTypes = action.payload.issueTypes;
                state.linkTypes = action.payload.linkTypes;
                state.sprints = action.payload.sprints;
            })
            .addCase(fetchJiraMetadata.rejected, (state) => {
                state.issueTypes = [];
                state.linkTypes = [];
                state.sprints = [];
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
