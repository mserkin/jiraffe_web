import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {
    jiraLogin: '',
    jiraPassword: '',
    jiraServer: '',
    boardId: 0,
    timeout: 300,
    demoModeEnabled: false,
    project: '',
    teamMembers: [],
    theme: localStorage.getItem('jiraffe-theme') === 'dark' ? 'dark' : 'light',
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
        setBoardId: (state, action) => {
            state.boardId = action.payload;
        },
        setTimeout: (state, action) => {
            state.timeout = action.payload;
        },    
        setDemoModeEnabled: (state, action) => {
            state.demoModeEnabled = action.payload;
        },                
        setTeamMembers: (state, action) => {
            state.teamMembers = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload === 'dark' ? 'dark' : 'light';
            localStorage.setItem('jiraffe-theme', state.theme);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSettings.fulfilled, (state, action) => {
            const theme =
                action.payload?.theme ??
                state.theme ??
                (localStorage.getItem('jiraffe-theme') === 'dark' ? 'dark' : 'light');
            const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
            localStorage.setItem('jiraffe-theme', normalizedTheme);
            return {
                ...state,
                ...action.payload,
                theme: normalizedTheme,
            };
        });
    },
});

const { setJiraLogin, setJiraPassword, setJiraServer, setProject, setBoardId, setTimeout, setDemoModeEnabled, setTeamMembers, setTheme } = settingsSlice.actions;
const selectSettings = (state) => state.settings;
const selectJiraLogin = (state) => state.settings.jiraLogin;
const selectJiraPassword = (state) => state.settings.jiraPassword;
const selectJiraServer = (state) => state.settings.jiraServer;
const selectProject = (state) => state.settings.project;
const selectBoardId = (state) => state.settings.boardId;
const selectTimeout = (state) => state.settings.timeout;
const selectDemoModeEnabled = (state) => state.settings.demoModeEnabled;
const selectTeamMembers = (state) => state.settings.teamMembers;
const selectTheme = (state) => state.settings.theme;

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
    setBoardId,
    selectBoardId,
    setTimeout,
    selectTimeout,        
    setDemoModeEnabled,
    selectDemoModeEnabled,        
    setTeamMembers,
    selectTeamMembers,
    setTheme,
    selectTheme
};

export default settingsSlice.reducer;
