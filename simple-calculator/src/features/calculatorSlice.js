import { createSlice } from "@reduxjs/toolkit";
import {Decimal} from 'decimal.js';

const getDivisionNum = (a, b) => {
  return new Decimal(a).div(b).toString();
};

const getMultipleNum = (a, b) => {
  return new Decimal(a).mul(b).toString();
};

function getPercentNum(a) {
  return new Decimal(a).div(100) // 計算百分比
}

// 執行剩餘的 + 和 - 運算
function runCodeWithFunction(obj) {
  return Function(`"use strict";return (${obj});`)();
}

// 優先處理 x, /, % 的需求
function getPriorityNum(obj) {
  let regex = obj.match(/-?\d+(?:\.\d+)?|\D/g);
  while (regex.length > 1) {
    if (
      regex.indexOf("x") !== -1 ||
      regex.indexOf("/") !== -1 ||
      regex.indexOf("%") !== -1
    ) {
      // 緩存索引
      const xIndex = regex.indexOf("x");
      const divIndex = regex.indexOf("/");
      const modIndex = regex.indexOf("%");

      // 找到優先級最高的運算符
      let opIndex = -1;
      if (xIndex !== -1 && (opIndex === -1 || xIndex < opIndex))
        opIndex = xIndex;
      if (divIndex !== -1 && (opIndex === -1 || divIndex < opIndex))
        opIndex = divIndex;
      if (modIndex !== -1 && (opIndex === -1 || modIndex < opIndex))
        opIndex = modIndex;

      // 根據運算符執行對應操作
      const operator = regex[opIndex];
      const left = regex[opIndex - 1];
      const right = regex[opIndex + 1];
      let result;

      if (operator === "x") {
        result = getMultipleNum(left, right);
      } else if (operator === "/") {
        result = getDivisionNum(left, right);
      } else if (operator === "%") {
        result = getPercentNum(left); // 假設你有一個對應處理 % 的函數
      }

      // 替換運算結果到 regex
      if (operator === "%") {
        regex.splice(opIndex - 1, 2, result);
      } else {
        regex.splice(opIndex - 1, 3, result);
      }
    } else {
      // 僅剩 + 和 -，跳出迴圈或 x / % 運算符已經處理完畢
      break;
    }
  }

  // 若 regex 等於 1，則直接回傳結果，否則執行剩餘運算
  return regex.length === 1 ? regex[0] : runCodeWithFunction(regex.join(""))
}

const initialState = {
  value: 0,
  statment: "",
  result: "",
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
    setResult: (state) => {
      state.result = getPriorityNum(state.value);
    },

  },
});

export const { setTarget, setCheck } = calculatorSlice.actions;
export default calculatorSlice.reducer;
