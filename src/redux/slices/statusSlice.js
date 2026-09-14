import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
};

const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

const { setIsLoading } = statusSlice.actions;
const selectIsLoading = (state) => state.status.isLoading;

export { setIsLoading, selectIsLoading };
export default statusSlice.reducer;
