import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
  statment: "",
};

export const calculatorSlice = createSlice({
  name: "calculator",
  initialState,
  reducers: {
    setTarget: (state, action) => {
      state.value += action.payload;
    },
    setCheck: (state) => {
      console.log(state.value);
    },
  },
});

export const { setTarget,setCheck } = calculatorSlice.actions;
export default calculatorSlice.reducer;
