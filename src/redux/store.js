import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './slices/statusSlice.js';
import errorReducer from './slices/errorSlice.js';

const store = configureStore({
    reducer: {
        error: errorReducer,
        status: statusReducer,
    },
});

export default store;
