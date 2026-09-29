import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {
    epicViewType: null,
    id: null,
    levelFilters: [],
    name: null,
    queryText: null,
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
        setQueryName: (state, action) => {
            state.name = action.payload;
        },
        setEpicViewType: (state, action) => {
            state.epicViewType = action.payload;
        },
        setQueryText: (state, action) => {
            state.queryText = action.payload;
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
const { setQueryName, setQueryText, setEpicViewType, setLevelFilters } = openQuerySlice.actions;
const selectOpenQuery = (state) => state.openQuery;
const selectQueryName = (state) => state.openQuery.name;
const selectEpicViewType = (state) => state.openQuery.epicViewType;
const selectQueryText = (state) => state.openQuery.queryText;
const selectLevelFilters = (state) => state.openQuery.levelFilters;

export {
    selectOpenQuery, 
    fetchQuery,
    setQueryName,
    selectQueryName,
    setQueryText,
    selectQueryText,
    setEpicViewType,
    selectEpicViewType,
    setLevelFilters,
    selectLevelFilters,
};

export default openQuerySlice.reducer;
