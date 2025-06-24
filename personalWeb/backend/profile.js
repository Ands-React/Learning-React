import express from "express";
import dotenv from "dotenv";
import session from "express-session";
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
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

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
const port = 3000;
const EXPIRATION_TIMES = {
  ONE_MINUTE: 1000 * 60,
  HALF_HOUR: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
};
// let redisClient = createClient({
//   socket: {
//     host: "localhost", // 你的 Redis 伺服器位址
//     port: 6379, // 預設端口
//   },
// });

// await redisClient.connect().catch(console.error);

// let redisStore = new RedisStore({
//   client: redisClient,
// });
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

app.use(
  session({
    // store: redisStore,
    secret: "hashcat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // 設置 secure 為 true 需要 HTTPS
      maxAge: EXPIRATION_TIMES.HALF_HOUR, // 設置過期時間 30分鐘
    },
  })
);

const checkSession = (req, res, next) => {
  if (!req.session || !req.session.username) {
    return res.status(401).send({ message: "未授權操作請重新登入" });
  }
  next(); // 通過驗證，繼續執行後續請求
};

app.post("/login", (req, res) => {
  if (
    req.body.username === process.env.USER_ACCOUNT &&
    req.body.password === process.env.USER_PASSWORD
  ) {
    req.session.username = req.body.username;
    console.log(req.session);
    res.status(200).send({ message: "登入成功", isValid: true });
  } else {
    res.status(400).send({ message: "帳號或密碼有誤" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({ message: "伺服器內部發生錯誤" });
    } else {
      res.clearCookie("connect.sid", {
        path: "/",
        domain: "localhost",
      });
      res.status(200).send({ message: "已成功登出", isValid: false });
    }
  });
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
app.post("/insertArticle", checkSession, async (req, res) => {
  try {
    const article = req.body;
    console.log("要新增的文章: ", article);
    const result = await insertArticleToDB(article.content);
    res.status(200).send({ message: result, article: article });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// 編輯文章至 mongoDB
app.post("/editArticle", checkSession, async (req, res) => {
  try {
    const article = req.body;
    console.log("要新增的文章: ", article);
    const result = await editArticleToDB(article.id, article.content);
    res.status(200).send({ message: result, article: article });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// 刪除文章從 mongoDB
app.post("/deleteArticle", checkSession, async (req, res) => {
  try {
    const selectedID = req.body.id;
    const result = await deleteArticlesFromDB(selectedID);
    res.status(200).send({ message: result, selectedID: selectedID });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// 處理上傳頭像
app.post("/uploadImg", checkSession, upload.single("image"), (req, res) => {
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
app.get("/check-session", (req, res) => {
  if (!req.session.username) {
    if (req.query.state === "islogged") {
      console.log("F5 進入檢查");
      console.log(req.session);
      res.status(401).end();
    } else {
      res.status(401).send({ message: "登入已逾時請重新登入", isValid: false });
    }
  }
  if (req.session.username) {
    if (req.query.state === "islogged") {
      res.status(200).send({ message: "歡迎回來", isValid: true });
    }
    if (req.query.state === "insert" || req.query.state === "edit") {
      // req.sessionStore.touch(req.sessionID, req.session, (err) => {
      //   if (err) console.error("更新 Redis TTL 失敗:", err);
      // });
      console.log("輪詢開始");

      const cookieSideID = req.cookies["connect.sid"];

      req.session.touch();
      res.cookie("connect.sid", cookieSideID, {
        maxAge: EXPIRATION_TIMES.HALF_HOUR,
        secure: false,
      });
      res.status(200).send({ state: req.query.state });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
