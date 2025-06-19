import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  setLogin,
  setLogout,
  checkSession,
  getArticlesByDB,
  insertArticlesToDB,
  editArticlesToDB,
  deleteArticlesFromDB,
} from "./profileSlice";

const initialState = {
  loginUI: false,
  insertUI: false,
  operation: "",
  light: true,
  insertLoading: false,
  getLoading: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleLight: (state) => {
      state.light = !state.light;
    },

    openLoginUI: (state) => {
      state.loginUI = !state.loginUI;
    },

    // 當點擊關閉UI介面。
    cancelUI: (state) => {
      state.insertUI = !state.insertUI;
      state.operation = "";
      localStorage.removeItem("type");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setLogin.fulfilled, (state, action) => {
        toast.success(action.payload.message);
        state.loginUI = !state.loginUI;
      })
      .addCase(setLogin.rejected, (state, action) => {
        console.log(action.payload);
        toast.error(`${action.payload.status} : ${action.payload.message}`);
      })
      .addCase(setLogout.fulfilled, (state, action) => {
        toast.success(action.payload.message);
      })
      .addCase(setLogout.rejected, (state, action) => {
        toast.error(`${action.payload.status} : ${action.payload.message}`);
      })

      //響應成功後開啟UI。
      .addCase(checkSession.fulfilled, (state, action) => {
        if (action.payload.message) {
          toast.success(action.payload.message);
        }
        if (action.payload.state) {
          state.insertUI = true;
          state.operation = action.payload.state;
          localStorage.setItem("type", action.payload.state);
        }
        if (!state.insertUI) {
          state.insertUI =
            localStorage.getItem("type") === "insert" ||
            localStorage.getItem("type") === "edit";
          state.operation = localStorage.getItem("type") || "";
        }
      })
      .addCase(checkSession.rejected, (state, action) => {
        if (action.payload.message) {
          toast.warning(`${action.payload.status} : ${action.payload.message}`);
        }
      })

      .addCase(getArticlesByDB.pending, (state) => {
        state.getLoading = true;
      })
      .addCase(getArticlesByDB.fulfilled, (state) => {
        state.getLoading = false;
      })
      .addCase(getArticlesByDB.rejected, (state, action) => {
        console.log(action.payload);
        console.log(state.getLoading);
        state.getLoading = false;
        if (!state.insertUI) {
          toast.info(`${action.payload.message}`);
        }
      })

      .addCase(insertArticlesToDB.pending, (state) => {
        state.insertLoading = true;
      })
      .addCase(insertArticlesToDB.fulfilled, (state, action) => {
        state.insertUI = false;
        state.operation = "";
        state.insertLoading = false;
        localStorage.clear();
        toast.success(action.payload.message);
      })
      .addCase(insertArticlesToDB.rejected, (state, action) => {
        state.insertLoading = false;
        toast.error(`${action.payload.status} : ${action.payload.message}`);
      })

      .addCase(editArticlesToDB.pending, (state) => {
        state.insertLoading = true;
      })
      .addCase(editArticlesToDB.fulfilled, (state, action) => {
        state.insertUI = false;
        state.operation = "";
        state.insertLoading = false;
        localStorage.clear();
        toast.success(action.payload.message);
      })
      .addCase(editArticlesToDB.rejected, (state, action) => {
        state.insertLoading = false;
        toast.error(`${action.payload.status} : ${action.payload.message}`);
      })

      .addCase(deleteArticlesFromDB.pending, (state) => {
        state.getLoading = true;
      })

      .addCase(deleteArticlesFromDB.fulfilled, (state, action) => {
        state.getLoading = false;
        toast.success(action.payload.message);
      })

      .addCase(deleteArticlesFromDB.rejected, (state, action) => {
        state.getLoading = false;
        toast.error(`${action.payload.status} : ${action.payload.message}`);
      });
  },
});

export const { openLoginUI, toggleLight, cancelUI } = uiSlice.actions;

export default uiSlice.reducer;
