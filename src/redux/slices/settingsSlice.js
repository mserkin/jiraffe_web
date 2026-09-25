import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {
    jiraLogin: '',
    jiraPassword: '',
    jiraServer: '',
    project: '',
    teamMembers: [],
};

const fetchSettings = createAsyncThunk(
    'settings',
    async ({ url }, thunkAPI) => {
        try {
            console.log('fetchSettings executed. Url:' + url)
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            thunkAPI.dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
            throw error;
        }
    },
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setJiraLogin: (state, action) => {
            state.jiraLogin = action.payload;
        },
        setJiraPassword: (state, action) => {
            state.jiraPassword = action.payload;
        },
        setJiraServer: (state, action) => {
            state.jiraServer = action.payload;
        },
        setProject: (state, action) => {
            state.project = action.payload;
        },
        setTeamMembers: (state, action) => {
            state.teamMembers = action.payload;
        },        
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSettings.fulfilled, (state, action) => {
            return action.payload;
        });
    },
});

const { setJiraLogin, setJiraPassword, setJiraServer, setProject, setTeamMembers } = settingsSlice.actions;
const selectSettings = (state) => state.settings;
const selectJiraLogin = (state) => state.settings.jiraLogin;
const selectJiraPassword = (state) => state.settings.jiraPassword;
const selectJiraServer = (state) => state.settings.jiraServer;
const selectProject = (state) => state.settings.project;
const selectTeamMembers = (state) => state.settings.teamMembers;

export {
    selectSettings, 
    fetchSettings,
    setJiraLogin,
    selectJiraLogin,
    setJiraPassword,
    selectJiraPassword,
    setJiraServer,
    selectJiraServer,
    setProject,
    selectProject,
    setTeamMembers,
    selectTeamMembers
};

export default settingsSlice.reducer;
