import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {
    epicViewType: null,
    id: null,
    levelFilters: [],
    name: null,
    queryText: null,
    project: null,
    countLimit: 0,
    customFilters: []
};

const fetchQuery = createAsyncThunk(
    'openQuery',
    async ({ url, queryId }, thunkAPI) => {
        try {
            const res = await axios.get(`${url}/${queryId}`);
            return res.data;
        } catch (error) {
            thunkAPI.dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
            throw error;
        }
    },
);

const openQuerySlice = createSlice({
    name: 'openQuery',
    initialState,
    reducers: {
        clearOpenQuery: () => initialState,
        setQueryName: (state, action) => {
            state.name = action.payload;
        },
        setEpicViewType: (state, action) => {
            state.epicViewType = action.payload;
        },
        setQueryText: (state, action) => {
            state.queryText = action.payload;
        },
        setProject: (state, action) => {
            state.project = action.payload;
        },
        setCountLimit: (state, action) => {
            state.countLimit = action.payload;
        },        
        setCustomFilters:(state, action) => {
            state.setCustomFilters = action.payload;
        }, 
        setLevelFilters: (state, action) => {
            state.levelFilters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchQuery.fulfilled, (state, action) => {
            return action.payload;
        });
    },
});
const { clearOpenQuery, setQueryName, setQueryText, setProject, setCountLimit, setEpicViewType, setCustomFilters, setLevelFilters } = openQuerySlice.actions;
const selectOpenQuery = (state) => state.openQuery;
const selectQueryName = (state) => state.openQuery.name;
const selectCountLimit = (state) => state.openQuery.countLimit;
const selectCustomFilters = (state) => state.openQuery.customFilters;
const selectEpicViewType = (state) => state.openQuery.epicViewType;
const selectQueryText = (state) => state.openQuery.queryText;
const selectProject = (state) => state.openQuery.project;
const selectLevelFilters = (state) => state.openQuery.levelFilters;

export {
    selectOpenQuery, 
    fetchQuery,
    clearOpenQuery,
    setQueryName,
    selectQueryName,
    setQueryText,
    selectQueryText,
    setProject,
    selectProject,
    setCountLimit,
    selectCountLimit,
    setCustomFilters,
    selectCustomFilters,
    setEpicViewType,
    selectEpicViewType,
    setLevelFilters,
    selectLevelFilters,
};

export default openQuerySlice.reducer;
