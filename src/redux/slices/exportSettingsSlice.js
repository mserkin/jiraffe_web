import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {
    "oneCellExportEnabled": false,
    "oneCellExportTemplate": null,
    "individualCellsTemplates": []
};

const fetchExportSettings = createAsyncThunk(
    'exportSettings',
    async ({ url }, thunkAPI) => {
        try {
            console.log('fetchSettings executed. Url:' + url)
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

const exportSettingsSlice = createSlice({
    name: 'exportSettings',
    initialState,
    reducers: {
        setOneCellExportEnabled: (state, action) => {
            state.oneCellExportEnabled = action.payload;
        },
        setOneCellExportTemplate: (state, action) => {
            state.oneCellExportTemplate = action.payload;
        },
        setIndividualCellsTemplates: (state, action) => {
            state.individualCellsTemplates = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchExportSettings.fulfilled, (state, action) => {
            return action.payload;
        });
    },
});

const { setOneCellExportEnabled, setOneCellExportTemplate, setIndividualCellsTemplates } = exportSettingsSlice.actions;
const selectExportSettings = (state) => state.exportSettings;
const selectOneCellExportEnabled = (state) => state.exportSettings.oneCellExportEnabled;
const selectOneCellExportTemplate = (state) => state.exportSettings.oneCellExportTemplate;
const selectIndividualCellsTemplates = (state) => state.exportSettings.individualCellsTemplates;

export {
    selectExportSettings, 
    fetchExportSettings,
    setOneCellExportEnabled,
    selectOneCellExportEnabled,
    setOneCellExportTemplate,
    selectOneCellExportTemplate,
    setIndividualCellsTemplates,
    selectIndividualCellsTemplates,
};

export default exportSettingsSlice.reducer;
