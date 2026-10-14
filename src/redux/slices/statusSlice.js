import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  isQueryChanged: false,
  isQueryExecuting: false,
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
    setIsQueryExecuting: (state, action) => {
      state.isQueryExecuting = action.payload;
    },    
    setIsInitialQueryOpened: (state, action) => {
      state.isInitialQueryOpened = action.payload;
    },
    setIsQueryListRefreshPending: (state, action) => {
      state.isQueryListRefreshPending = action.payload;
    },
  },
});

const { setIsLoading, setIsQueryChanged, setIsQueryExecuting, setIsInitialQueryOpened, setIsQueryListRefreshPending } = statusSlice.actions;
const selectIsLoading = (state) => state.status.isLoading;
const selectIsQueryChanged = (state) => state.status.isQueryChanged;
const selectIsQueryExecuting = (state) => state.status.isQueryExecuting;
const selectIsInitialQueryOpened = (state) => state.status.isInitialQueryOpened;
const selectIsQueryListRefreshPending = (state) => state.status.isQueryListRefreshPending;

export {
  setIsLoading,
  selectIsLoading,
  setIsQueryChanged,
  selectIsQueryChanged,
  setIsQueryExecuting,
  selectIsQueryExecuting,
  setIsInitialQueryOpened,
  selectIsInitialQueryOpened,
  setIsQueryListRefreshPending,
  selectIsQueryListRefreshPending
};
export default statusSlice.reducer;
