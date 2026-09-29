import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './slices/statusSlice.js';
import errorReducer from './slices/errorSlice.js';
import queryListReducer from './slices/queryListSlice.js';
import openQueryReducer from './slices/openQuerySlice.js';
import settingsReducer from './slices/settingsSlice.js';
import jiraMetadataReducer from './slices/jiraMetadata.js';

const store = configureStore({
    reducer: {
        error: errorReducer,
        openQuery: openQueryReducer,
        queryList: queryListReducer,
        status: statusReducer,
        settings: settingsReducer,
        jiraMetadata: jiraMetadataReducer
    },
});

export default store;
