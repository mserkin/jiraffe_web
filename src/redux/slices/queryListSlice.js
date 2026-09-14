import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = [];

const fetchQueryList = createAsyncThunk(
    'queries',
    async (url, thunkAPI) => {
        console.log(thunkAPI);
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
    },
    extraReducers: (builder) => {
        builder.addCase(fetchQueryList.fulfilled, (state, action) => {
            if (action.payload.id && action.payload.name) {
                state.push({
                    id: action.payload.id,
                    name: action.payload.name,
                });
            }
            console.log(state);
        });
    },
});

//const { addBook, deleteBook, toggleFavorite } = booksSlice.actions;

const selectQueryList = (state) => state.queryList;

export { /*addBook, deleteBook, toggleFavorite,*/ selectQueryList, fetchQueryList };
export default queryListSlice.reducer;
