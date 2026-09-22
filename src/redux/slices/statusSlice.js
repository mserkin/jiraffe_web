import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  isQueryChanged: false,
  isInitialQueryOpened: false,
  isQueryListRefreshPending: false
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsQueryChanged: (state, action) => {
      state.isQueryChanged = action.payload;
    },
    setIsInitialQueryOpened: (state, action) => {
      state.isInitialQueryOpened = action.payload;
    },
    setIsQueryListRefreshPending: (state, action) => {
      state.isQueryListRefreshPending = action.payload;
    },
  },
});

const { setIsLoading, setIsQueryChanged, setIsInitialQueryOpened, setIsQueryListRefreshPending } = statusSlice.actions;
const selectIsLoading = (state) => state.status.isLoading;
const selectIsQueryChanged = (state) => state.status.isQueryChanged;
const selectIsInitialQueryOpened = (state) => state.status.isInitialQueryOpened;
const selectIsQueryListRefreshPending = (state) => state.status.isQueryListRefreshPending;

export {
  setIsLoading,
  selectIsLoading,
  setIsQueryChanged,
  selectIsQueryChanged,
  setIsInitialQueryOpened,
  selectIsInitialQueryOpened,
  setIsQueryListRefreshPending,
  selectIsQueryListRefreshPending
};
export default statusSlice.reducer;
