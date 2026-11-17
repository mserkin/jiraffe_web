import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';
import { BACKEND_URI, ISSUE_TYPES_PATH_PART, LINK_TYPES_PATH_PART, SPRINTS_PATH_PART } from '../../modules/const';

const initialState = {
    issueTypes: [],
    linkTypes: [],
    sprints: [],
    sprintsUnavailable: false,
    isLoading: false,
};

const fetchJiraMetadata = createAsyncThunk(
    'jiraMetadata/fetch',
    async (_, thunkAPI) => {
        console.log("fetchJiraMetadata executed")
        try {
            const issueTypes = (await axios.get(`${BACKEND_URI}${ISSUE_TYPES_PATH_PART}`)).data;
            const linkTypes = (await axios.get(`${BACKEND_URI}${LINK_TYPES_PATH_PART}`)).data;
            let sprints;
            try {
                sprints = (
                    await axios.get(`${BACKEND_URI}${SPRINTS_PATH_PART}`)
                ).data;
            } catch (error) {
                if (error.response?.status === 500) {
                    return thunkAPI.rejectWithValue({
                        sprintsUnavailable: true,
                    });
                }
                throw error;
            }
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
            .addCase(fetchJiraMetadata.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJiraMetadata.fulfilled, (state, action) => {
                state.issueTypes = action.payload.issueTypes;
                state.linkTypes = action.payload.linkTypes;
                state.sprints = action.payload.sprints;
                state.sprintsUnavailable = false;
                state.isLoading = false;
            })
            .addCase(fetchJiraMetadata.rejected, (state, action) => {
                state.issueTypes = [];
                state.linkTypes = [];
                state.sprints = [];
                state.sprintsUnavailable =
                    action.payload?.sprintsUnavailable ?? false;
                state.isLoading = false;
            });
    },
});
const selectJiraMetadata = (state) => state.jiraMetadata;
const selectIssueTypes = (state) => state.jiraMetadata.issueTypes;
const selectLinkTypes = (state) => state.jiraMetadata.linkTypes;
const selectSprints = (state) => state.jiraMetadata.sprints;
const selectSprintsUnavailable = (state) =>
    state.jiraMetadata.sprintsUnavailable;
const selectIsJiraMetadataLoading = (state) => state.jiraMetadata.isLoading;

export {
    selectJiraMetadata, 
    fetchJiraMetadata,
    selectIssueTypes,
    selectLinkTypes,
    selectSprints,
    selectSprintsUnavailable,
    selectIsJiraMetadataLoading,
};

export default jiraMetadataSlice.reducer;
