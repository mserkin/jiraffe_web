import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './slices/statusSlice.js';
import errorReducer from './slices/errorSlice.js';
import queryListReducer from './slices/queryListSlice.js';

const store = configureStore({
    reducer: {
        error: errorReducer,
        queryList: queryListReducer,
        status: statusReducer,
    },
});

export default store;
