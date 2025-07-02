import { createSlice } from "@reduxjs/toolkit";

// Initial state for patient history
const initialState = {
  histories: [],
};

// Create Redux slice for patient history
const patientHistorySlice = createSlice({
  name: "patientHistory",
  initialState,
  reducers: {
    // Action to add a new history entry
    addHistory: (state, action) => {
      state.histories.push(action.payload);
    },
    // Action to clear history (if needed)
    clearHistory: (state) => {
      state.histories = [];
    },
  },
});

// Export actions and reducer
export const { addHistory, clearHistory } = patientHistorySlice.actions;
export default patientHistorySlice.reducer;
