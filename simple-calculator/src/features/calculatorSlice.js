import { createSlice } from "@reduxjs/toolkit";
import { Decimal } from "decimal.js";

const getDivisionNum = (a, b) => {
  return new Decimal(a).div(b).toString();
};

const getMultipleNum = (a, b) => {
  return new Decimal(a).mul(b).toString();
};

function getPercentNum(a) {
  return new Decimal(a).div(100).toString(); // 計算百分比
}

// 執行剩餘的 + 和 - 運算
function runCodeWithFunction(obj) {
  obj = obj.replace(/\b0+(\d+)/g, "$1"); // 移除數字中的前導零，例如 0001 -> 1
  try {
    return Function(`"use strict";return (${obj}).toString();`)();
  } catch (error) {
    console.error("錯誤:", error.message);
    throw new Error("無效的表達式: " + obj);
  }
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
      const percentIndex = regex.indexOf("%");

      // 找到優先級最高的運算符
      let opIndex = -1;
      if (xIndex !== -1 && (opIndex === -1 || xIndex < opIndex))
        opIndex = xIndex;
      if (divIndex !== -1 && (opIndex === -1 || divIndex < opIndex))
        opIndex = divIndex;

      // 百分號比較不一樣，要優先於 x, /
      if (percentIndex !== -1 && (opIndex === -1 || percentIndex > opIndex))
        opIndex = percentIndex;

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
        result = getPercentNum(left);
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
  if (regex.length === 1) {
    return regex[0];
  } else {
    return runCodeWithFunction(regex.join(""));
  }
}

const initialState = {
  value: 0,
  statment: "",
  result: 0,
};

export const calculatorSlice = createSlice({
  name: "calculator",
  initialState,
  reducers: {
    setTarget: (state, action) => {
      if (state.result) {
        state.result += action.payload;
      } else {
        state.value += action.payload;
      }
    },
    setStatemt: (state) => {
      if (state.result) {
        state.statment = state.result;
      } else {
        state.statment = state.value;
      }
    },
    setCalcu: (state) => {
      // 計算結果 (result) 為字串
      if (state.result) {
        state.result = getPriorityNum(state.result);
      } else {
        state.result = getPriorityNum(state.value);
      }
    },
    setReset: (state) => {
      state.value = 0;
      state.statment = "";
      state.result = 0;
    },
    
    setBack: (state) => {
      if (state.result) {
        state.result = state.result.slice(0, -1);
      } else  {
        state.value = state.value.slice(0, -1);
      }
    },
  },
});

export const { setTarget, setCalcu, setReset, setStatemt, setBack } =
  calculatorSlice.actions;
export default calculatorSlice.reducer;
