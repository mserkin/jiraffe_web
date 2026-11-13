import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setError } from './errorSlice';

const initialState = {
    oneCellExportEnabled: false,
    oneCellExportTemplate: "",
    individualCellsTemplates: [],
    status: 'idle',
};

const fetchExportSettings = createAsyncThunk(
    'exportSettings/fetch',
    async ({ url }, thunkAPI) => {
        try {
            const res = await axios.get(url);
            return res.data ?? {};
        } catch (error) {
            thunkAPI.dispatch(
                setError(`Ошибка при подключении к серверу: ${error.message}`),
            );
            throw error;
        }
    },
    {
        condition: (_, { getState }) => {
            const status = getState().exportSettings.status;
            return status !== 'loading' && status !== 'succeeded';
        },
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
        setExportSettings: (state, action) => {
            return {
                ...state,
                ...action.payload,
                status: 'succeeded',
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExportSettings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchExportSettings.fulfilled, (state, action) => ({
                ...initialState,
                ...action.payload,
                individualCellsTemplates: Array.isArray(
                    action.payload.individualCellsTemplates,
                )
                    ? action.payload.individualCellsTemplates
                    : [],
                status: 'succeeded',
            }))
            .addCase(fetchExportSettings.rejected, (state) => {
                state.status = 'failed';
            });
    },
});

const {
    setOneCellExportEnabled,
    setOneCellExportTemplate,
    setIndividualCellsTemplates,
    setExportSettings,
} = exportSettingsSlice.actions;
const selectExportSettings = (state) => state.exportSettings;
const selectExportSettingsStatus = (state) => state.exportSettings.status;
const selectOneCellExportEnabled = (state) => state.exportSettings.oneCellExportEnabled;
const selectOneCellExportTemplate = (state) => state.exportSettings.oneCellExportTemplate;
const selectIndividualCellsTemplates = (state) => state.exportSettings.individualCellsTemplates;

export {
    selectExportSettings, 
    selectExportSettingsStatus,
    fetchExportSettings,
    setExportSettings,
    setOneCellExportEnabled,
    selectOneCellExportEnabled,
    setOneCellExportTemplate,
    selectOneCellExportTemplate,
    setIndividualCellsTemplates,
    selectIndividualCellsTemplates,
};

export default exportSettingsSlice.reducer;
