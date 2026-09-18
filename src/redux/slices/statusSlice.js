import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  isQueryChanged: false,
  isInitialQueryOpened: false,
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
  },
});

const { setIsLoading, setIsQueryChanged, setIsInitialQueryOpened } = statusSlice.actions;
const selectIsLoading = (state) => state.status.isLoading;
const selectIsQueryChanged = (state) => state.status.isQueryChanged;
const selectIsInitialQueryOpened = (state) => state.status.isInitialQueryOpened;

export {
  setIsLoading,
  selectIsLoading,
  setIsQueryChanged,
  selectIsQueryChanged,
  setIsInitialQueryOpened,
  selectIsInitialQueryOpened,
};
export default statusSlice.reducer;
