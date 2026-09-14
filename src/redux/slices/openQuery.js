import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {};

const fetchQuery = createAsyncThunk('openQuery', async (url, query_id, thunkAPI) => {
    console.log(thunkAPI);
    try {
        const res = await axios.get(`${url}/${query_id}`);
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
            if (action.payload.id && action.payload.name) {
                state.push({
                    id: action.payload.id,
                    name: action.payload.name,
                    queryText: action.payload.queryText,
                    epicViewType: action.payload.epicViewType
                });
            }
        });
    },
});

//const { addBook, deleteBook, toggleFavorite } = booksSlice.actions;

const selectQueryList = (state) => state.openQuery;

export {
    selectQuery, fetchQuery,
};
export default openQuerySlice.reducer;
