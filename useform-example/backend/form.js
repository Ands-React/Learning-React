const express = require("express");
const cors = require("cors");
const multer  = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 存儲目錄
  },
  filename: (req, file, cb) => {
    const formatDate = new Date();
    const day = formatDate.getDate();
    const month = formatDate.getMonth() + 1;
    const years = formatDate.getFullYear();
    const hours = formatDate.getHours();
    const min = formatDate.getMinutes();
    const sec = formatDate.getSeconds();
    const combinDate =  years + "年" + month + "月" + day + "日" + hours + "時" + min + "分" + sec + "秒"

    cb(null, combinDate + '-' + file.originalname); // 確保文件名唯一
  }
});
const upload = multer({ storage: storage });

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.post("/api/data",upload.single('image') ,(req, res) => {
    const expectedUsername = 'Ands';
    const expectedPassword = 'password123';
    

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    
    console.log(req.file)
    console.log(req.body)

    if(req.file && req.body){
      res.status(200).send({message: "傳送成功"})
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
