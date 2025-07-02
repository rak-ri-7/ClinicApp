import { configureStore } from "@reduxjs/toolkit";
import patientHistoryReducer from "./patientHistorySlice";

// Configure the store with patient history reducer
const store = configureStore({
  reducer: {
    patientHistory: patientHistoryReducer, // Adding the patient history slice to the store
  },
});

export default store;
