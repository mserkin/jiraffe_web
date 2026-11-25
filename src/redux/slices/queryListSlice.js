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
            const queryIndex = state.findIndex((query) => query.id === action.payload);
            if (queryIndex > 0) {
                [state[queryIndex - 1], state[queryIndex]] = [
                    state[queryIndex],
                    state[queryIndex - 1],
                ];
            }
        },
        moveQueryDown: (state, action) => {
            const queryIndex = state.findIndex((query) => query.id === action.payload);
            if (queryIndex >= 0 && queryIndex < state.length - 1) {
                [state[queryIndex], state[queryIndex + 1]] = [
                    state[queryIndex + 1],
                    state[queryIndex],
                ];
            }
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
