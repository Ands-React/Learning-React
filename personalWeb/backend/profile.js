import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import fs from "fs";
import {
  getArticlesByDB,
  insertArticleToDB,
  editArticleToDB,
  deleteArticlesFromDB,
} from "./mongoDB.js";
import jwt from "jsonwebtoken";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const EXPIRATION_TIMES = {
  ONE_MINUTE: 1000 * 60,
  HALF_HOUR: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
};

const generateAccessToken = (username) => {
  return jwt.sign(
    { username: username, signInTime: Date.now() },
    process.env.ACCESS_SECRET,
    { expiresIn: "30m" }
  );
};

function verifyToken(req, res, next) {
  // const token = req.cookie.token  直接從 Cookie 讀取 Token
  const token = req.headers.authorization.replace("Bearer ", "")
  if (!token) return res.status(401).end();
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded; // 存入 req.user
    next();
  } catch (error) {
    res.status(403).json({ message: "登入已逾時請重新登入", isValid: false });
  }
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.USER_ACCOUNT &&
    password === process.env.USER_PASSWORD
  ) {
    const token = generateAccessToken(username);
    /* res.cookie("token", token, {
      httpOnly: true, // 防止 JavaScript 存取
      secure: false, // 只允許 HTTPS
      sameSite: "lax", // 防止 CSRF 攻擊
      maxAge: EXPIRATION_TIMES.HALF_HOUR, // 半小時
    }); */
    res.status(200).send({ message: "登入成功", isValid: true, token: token });
  } else {
    res.status(400).send({ message: "帳號或密碼有誤" });
  }
});

app.post("/logout",verifyToken ,(req, res) => {
  res.status(200).send({ message: "已成功登出", isValid: false });
});

// 獲取mongoDB文章資料
app.post("/getArticles", async (req, res) => {
  try {
    const { articles, articleOrder } = await getArticlesByDB();
    
    res.status(200).send({ articles, articleOrder });
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
});

// 新增文章至 mongoDB
app.post("/insertArticle", verifyToken, async (req, res) => {
  try {
    const article = req.body;
    // console.log("要新增的文章: ", article);
    const result = await insertArticleToDB(article.content);
    console.log("新增文章成功")
    res.status(200).send({ message: result, article: article });
  } catch (err) {
    console.error("新增文章失敗", err)
    res.status(500).send({ message: err.message });
  }
});

// 編輯文章至 mongoDB
app.post("/editArticle", verifyToken, async (req, res) => {
  try {
    const article = req.body;
    // console.log("要編輯的文章: ", article);
    const result = await editArticleToDB(article.id, article.content);
        console.log("編輯文章成功")
    res.status(200).send({ message: result, article: article });
  } catch (err) {
    console.error("編輯文章失敗", err)
    res.status(500).send({ message: err.message });
  }
});

// 刪除文章從 mongoDB
app.post("/deleteArticle", verifyToken, async (req, res) => {
  try {
    const selectedID = req.body.id;
    const result = await deleteArticlesFromDB(selectedID);
    console.log("刪除文章成功")
    res.status(200).send({ message: result, selectedID: selectedID });
  } catch (err) {
    console.error("刪除文章失敗", err)
    res.status(500).send({ message: err.message });
  }
});

// 處理上傳頭像
app.post("/uploadImg", verifyToken, upload.single("image"), (req, res) => {
  res.status(200).send({ message: "頭像上傳成功" });
});
app.get("/getImg", (req, res) => {
  fs.readFile("./uploads/headshot.png", (err, data) => {
    if (err) {
      res.status(500).send("沒有頭像在資料庫內");
    }
    res.status(200).send(data);
  });
});

// 所有新增、編輯、刪除的模式，都會先透過該路由檢查session並延長。
app.get("/check-session", verifyToken, (req, res) => {
  if (req.query.state === "islogged") {
    res.status(200).send({ message: "歡迎回來", isValid: true });
  }
  if (req.query.state === "insert" || req.query.state === "edit") {
    console.log("輪詢開始");

    const token = generateAccessToken(req.user.username);

    /* res.cookie("token", token, {
      httpOnly: true, // 防止 JavaScript 存取
      secure: false, // 只允許 HTTPS
      sameSite: "lax", // 防止 CSRF 攻擊
      maxAge: EXPIRATION_TIMES.HALF_HOUR, // 7 天
    }); */

    res.status(200).send({ state: req.query.state, token: token });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
