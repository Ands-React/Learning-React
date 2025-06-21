import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteData, insertData } from "./indexedDB";
import axios from "axios";

const api = axios.create({
  baseURL: "https://personalbackend-8b4m.onrender.com", // 替換為你的後端 API 網域
});

// 攔截器：每次請求自動加上 JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 每次讀取最新的 Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const initialState = {
  isLoggedin: false,
  articles: {},
  articleOrder: [],
  selectedID: null,
  editId: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    selectedArticle: (state, action) => {
      state.selectedID = action.payload;
    },
    editArticle: (state, action) => {
      if (state.editId === action.payload.id) return;
      insertData(action.payload.content);
      state.editId = action.payload.id;
    },
  },
  extraReducers: (builder) => {
    builder
      // 處理登入後端響應
      .addCase(setLogin.fulfilled, (state, action) => {
        state.isLoggedin = action.payload.isValid;
        localStorage.setItem("token", action.payload.token);
      })

      .addCase(setLogout.fulfilled, (state, action) => {
        state.isLoggedin = action.payload.isValid;
        localStorage.clear();
      })

      //檢查session的後端響應
      .addCase(checkSession.fulfilled, (state, action) => {
        // console.log(action.payload);
        // console.log("session延長成功");

        if (action.payload.isValid && action.payload.token) {
          state.isLoggedin = action.payload.isValid;
          localStorage.setItem("token", action.payload.token);
        }
      })

      .addCase(checkSession.rejected, (state, action) => {
        // console.log(action.payload);
        // console.log("session延長失敗");
        state.isLoggedin = action.payload.isValid;
      })

      // todo : 新增pedding狀態，讓使用者知道正在從資料庫獲取文章
      .addCase(getArticlesByDB.fulfilled, (state, action) => {
        console.log("從資料庫獲取文章成功");
        state.articles = action.payload.articles;
        state.articleOrder = action.payload.articleOrder;
        state.selectedID = action.payload.articleOrder[0];
      })

      // todo : 新增pedding狀態，讓使用者知道正在新增文章到資料庫，並禁止使用者一切操作直到完成狀態。
      .addCase(insertArticlesToDB.fulfilled, (state, action) => {
        console.log("新增文章到資料庫成功");
        state.articles[action.payload.article.id] =
          action.payload.article.content;
        state.articleOrder = [action.payload.article.id, ...state.articleOrder];
        state.selectedID = action.payload.article.id;
        deleteData(action.payload.article.type);
      })

      .addCase(editArticlesToDB.fulfilled, (state, action) => {
        console.log("更新文章到資料庫成功");
        state.articles[action.payload.article.id] =
          action.payload.article.content;
        state.editId = null;
        deleteData(action.payload.article.type);
      })

      .addCase(deleteArticlesFromDB.fulfilled, (state, action) => {
        console.log(action.payload);
        console.log("從資料庫成功刪除文章");
        state.articleOrder = state.articleOrder.filter(
          (id) => id !== action.payload.selectedID
        );
        state.selectedID = state.articleOrder[0] || null;
      });
  },
});

export const setLogout = createAsyncThunk(
  "profile/logout",
  async (_, thunkAPI) => {
    try {
      const response = await api.post("/logout");
      return response.data;
    } catch (err) {
      console.log(err);
      return thunkAPI.rejectWithValue({
        message: err.response?.data.message,
        status: err.response?.status,
      });
    }
  }
);

export const setLogin = createAsyncThunk(
  "profile/login",
  async (data, thunkAPI) => {
    try {
      const response = await axios.post(
        "https://personalbackend-8b4m.onrender.com/login",
        data
      );
      return response.data;
    } catch (err) {
      console.log(err);
      return thunkAPI.rejectWithValue({
        message: err.response?.data.message || "無法連接到伺服器",
        status: err.response?.status || 500,
      });
    }
  }
);

export const checkSession = createAsyncThunk(
  "profile/checkSession",

  //features是app.jsx按鈕的參數，需要的目的讓後端確任目前想執行哪種操作，
  //並根據後端的響應判斷該開啟哪種UI。
  async (features, thunkAPI) => {
    try {
      const response = await api.get("/check-session", {
        params: {
          state: features,
        },
      });

      return response.data;
    } catch (err) {
      console.log(err);
      if (!err.response) {
      }
      return thunkAPI.rejectWithValue({
        message: err.response?.data.message,
        status: err.response?.status,
      });
    }
  }
);

export const getArticlesByDB = createAsyncThunk(
  "profile/getArticlesByDB",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        "https://personalbackend-8b4m.onrender.com/getArticles"
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || "無法從資料庫獲取文章",
      });
    }
  }
);

export const insertArticlesToDB = createAsyncThunk(
  "profile/insertArticlesToDB",
  async (articleData, thunkAPI) => {
    try {
      const response = await api.post("/insertArticle", articleData);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.response?.data.message,
        status: err.response?.status,
      });
    }
  }
);
export const editArticlesToDB = createAsyncThunk(
  "profile/editArticlesToDB",
  async (articleData, thunkAPI) => {
    try {
      const response = await api.post("/editArticle", articleData);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.response?.data.message,
        status: err.response?.status,
      });
    }
  }
);

export const deleteArticlesFromDB = createAsyncThunk(
  "profile/deleteArticlesFromDB",
  async (selectedID, thunkAPI) => {
    try {
      const response = await api.post("/deleteArticle", { id: selectedID });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.response?.data.message,
        status: err.response?.status,
      });
    }
  }
);

export const { cancelUI, selectedArticle, editArticle } = profileSlice.actions;
export default profileSlice.reducer;
