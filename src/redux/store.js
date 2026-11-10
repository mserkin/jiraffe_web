import { configureStore } from '@reduxjs/toolkit';
import statusReducer from './slices/statusSlice.js';
import errorReducer from './slices/errorSlice.js';
import queryListReducer from './slices/queryListSlice.js';
import openQueryReducer from './slices/openQuerySlice.js';
import settingsReducer from './slices/settingsSlice.js';
import exportSettingsReducer from './slices/exportSettingsSlice.js';
import jiraMetadataReducer from './slices/jiraMetadataSlice.js';
import searchResultsReducer from './slices/searchResultsSlice.js';

const store = configureStore({
    reducer: {
        error: errorReducer,
        openQuery: openQueryReducer,
        queryList: queryListReducer,
        status: statusReducer,
        settings: settingsReducer,
        exportSettings: exportSettingsReducer,
        jiraMetadata: jiraMetadataReducer,
        searchResults: searchResultsReducer,
    },
});

export default store;
