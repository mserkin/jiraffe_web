import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = [];

const fetchQueryList = createAsyncThunk(
    'queries',
    async (url, thunkAPI) => {
        try {
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

const queryListSlice = createSlice({
    name: 'queryList',
    initialState,
    reducers: {
        moveQueryUp: (state, action) => {
            // Implementation for moving query up
            let newState = initialState;
            const queryIndex = state.findIndex((q) => q.id === action.payload.id);
            if (queryIndex > 0) {
                newState = [...state];
                [newState[queryIndex], newState[queryIndex - 1]] = [newState[queryIndex - 1], newState[queryIndex]];
            }
            return newState;
        },
        moveQueryDown: (state, action) => {
            // Implementation for moving query down
            let newState = initialState;
            const queryIndex = state.findIndex((q) => q.id === action.payload.id);
            if (queryIndex < state.length - 1) {
                newState = [...state];
                [newState[queryIndex], newState[queryIndex + 1]] = [newState[queryIndex + 1], newState[queryIndex]];
            }
            return newState;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchQueryList.fulfilled, (state, action) => {
            const queries = Array.isArray(action.payload) ? action.payload : [action.payload];
            const filtered_queries = queries
                .filter((query) => query?.id && query?.name)
                .map((query) => ({
                    id: query.id,
                    name: query.name,
                }));
            return filtered_queries;
        });
    },
});

const selectQueryList = (state) => state.queryList;

const { moveQueryUp, moveQueryDown } = queryListSlice.actions;
export { selectQueryList, moveQueryUp, moveQueryDown, fetchQueryList };
export default queryListSlice.reducer;
