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
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchQuery.fulfilled, (state, action) => {
            console.log(action.payload);
            return action.payload;
        });
    },
});

const selectOpenQuery = (state) => state.openQuery;

export { selectOpenQuery, fetchQuery };
export default openQuerySlice.reducer;
