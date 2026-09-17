import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    isQueryChanged: false
};

const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setIsQueryChanged: (state, action) => {
            state.isQueryChanged = action.payload;
        },
    },
});

const { setIsLoading, setIsQueryChanged } = statusSlice.actions;
const selectIsLoading = (state) => state.status.isLoading;
const selectIsQueryChanged = (state) => state.status.isQueryChanged;

export { setIsLoading, selectIsLoading, setIsQueryChanged, selectIsQueryChanged };
export default statusSlice.reducer;
