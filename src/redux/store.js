import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './slices/statusSlice.js';
import errorReducer from './slices/errorSlice.js';
import queryListReducer from './slices/queryListSlice.js';
import openQueryReducer from './slices/openQuerySlice.js';

const store = configureStore({
    reducer: {
        error: errorReducer,
        openQuery: openQueryReducer,
        queryList: queryListReducer,
        status: statusReducer,
    },
});

export default store;
