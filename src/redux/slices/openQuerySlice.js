import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {};

const fetchQuery = createAsyncThunk('openQuery', async ({url, queryId}) => {
    try {
        const res = await axios.get(`${url}/${queryId}`);
        return res.data;
    } catch (error) {
        thunkAPI.dispatch(
            setError(`Ошибка при подключении к серверу: ${error.message}`),
        );
        throw error;
    }
});

const openQuerySlice = createSlice({
    name: 'openQuery',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchQuery.fulfilled, (state, action) => {
            return action.payload;
        });
    },
});

//const { addBook, deleteBook, toggleFavorite } = booksSlice.actions;

const selectOpenQuery = (state) => state.openQuery;

export {
    selectOpenQuery, fetchQuery,
};
export default openQuerySlice.reducer;
