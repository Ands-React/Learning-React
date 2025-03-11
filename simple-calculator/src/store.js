import {configureStore} from "@reduxjs/toolkit";
import calculatorReducer from "./features/calculatorSlice";
export const store = configureStore({
  reducer: {
    // Define a top-level state field named `calculator`, handled by `calculatorReducer`
    calculator: calculatorReducer,
  },
});