import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./features/profileSlice";
import uiReducer from "./features/uiSlice"

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    ui: uiReducer,
  },
});