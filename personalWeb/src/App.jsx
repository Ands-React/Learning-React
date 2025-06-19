import { useLayoutEffect, useRef, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import headshot from "./assets/defaultheadshot.png";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import {
  checkSession,
  setLogout,
  selectedArticle,
  editArticle,
  getArticlesByDB,
  deleteArticlesFromDB,
} from "./features/profileSlice";
import { openLoginUI, toggleLight } from "./features/uiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faPlus,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, Bounce, toast } from "react-toastify";
import { LoginUI } from "./loginUI";
import { InsertUI } from "./insertUI";
import axios from "axios";

function App() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const loginUI = useSelector((state) => state.ui.loginUI);
  const insertUI = useSelector((state) => state.ui.insertUI);
  const light = useSelector((state) => state.ui.light);
  const getLoading = useSelector((state) => state.ui.getLoading);

  const isLoggedin = useSelector((state) => state.profile.isLoggedin);
  const articles = useSelector((state) => state.profile.articles);
  const articleOrder = useSelector((state) => state.profile.articleOrder);
  const selectedID = useSelector((state) => state.profile.selectedID);
  const editId = useSelector((state) => state.profile.editId);

  // 顯示選則的文章標題內容，若沒有則顯示第一篇文章內容
  const content = selectedID ? articles[selectedID] : articles[articleOrder[0]];
  const [headshotImg, setHeadshotImg] = useState(headshot);

  // const profile = useSelector((state) => state.profile);

  useLayoutEffect(() => {
    console.log("useEffect被觸發了");
    dispatch(checkSession("islogged"));
    dispatch(getArticlesByDB());
  }, [dispatch]);

  useLayoutEffect(() => {
    let imgURL;
    const getImg = async () => {
      try {
        const res = await axios.get("https://personalbackend-olip.onrender.com/getImg", {
          responseType: "arraybuffer",
        });
        const blob = new Blob([res.data], { type: "image/png" });
        imgURL = URL.createObjectURL(blob);
        setHeadshotImg(imgURL);
      } catch (error) {
        toast.error(error.message);
      }
    };

    getImg();
    
    return () => {
      if (imgURL) {
        URL.revokeObjectURL(imgURL);
      }
    };
  }, []);

  const handleEdit = () => {
    if (!selectedID) return;
    dispatch(checkSession("edit"));
    dispatch(
      editArticle({
        id: selectedID,
        content: {
          type: "edit",
          title: articles[selectedID].title,
          article: articles[selectedID].articleJson,
        },
      })
    );
  };

  const hadnleDeleteArticle = () => {
    const result = confirm(
      `確定要刪除文章 : ${articles[selectedID].title} 嗎?`
    );
    if (!result) return;
    if (result) {
      dispatch(deleteArticlesFromDB(selectedID));
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.type.startsWith("image")) return alert("只接受圖片");

    const imgURL = URL.createObjectURL(file);
    setHeadshotImg(imgURL);

    const filedata = new FormData();
    filedata.append("image", file, "headshot.png");
    const token = localStorage.getItem("token")
    try {
      const res = await axios.post(
        "https://personalbackend-olip.onrender.com/uploadImg",
        filedata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`${res.data.message}`);
    } catch (error) {
      toast.error("頭像上傳失敗，請重新上傳");
    }
  };

  return (
    <>
      <div
        className={`container ${(loginUI || insertUI) && "block"} ${
          light ? "lightmode" : "darkmode"
        }`}
      >
        <div className="profilebody">
          <div className="headshot">
            <img className="headshotImg" src={headshotImg} alt="預設頭像" />
            {isLoggedin && (
              <div>
                <label htmlFor="headshotUpload" className="headshotupload">
                  上傳頭像
                </label>
                <input
                  id="headshotUpload"
                  type="file"
                  onChange={handleUpload}
                  hidden
                />
              </div>
            )}
          </div>
          <div className="title">
            <div className="title-layout">
              <h3>文章列表</h3>
              <div className="title-list">
                {articleOrder.map((id) => (
                  <div
                    key={id}
                    className={
                      id === editId ? "title-cell title-edit" : "title-cell"
                    }
                    onClick={() => dispatch(selectedArticle(id))}
                  >
                    {articles[id].title}
                  </div>
                ))}
              </div>
            </div>
            {isLoggedin && (
              <div className="feature-list">
                <button className="btndelete" onClick={hadnleDeleteArticle}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>

                <button
                  className="btninsert"
                  onClick={() => dispatch(checkSession("insert"))}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>

                <button className="btnedit" onClick={handleEdit}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
              </div>
            )}
          </div>
          <div className="article">
            {getLoading ? (
              <div className="spinner" />
            ) : content ? (
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: content.article.join("\n") }}
              ></div>
            ) : (
              "目前沒有文章"
            )}
          </div>
        </div>

        <div className="toolbar">
          <label htmlFor="toggle" className="switch">
            <input
              id="toggle"
              type="checkbox"
              onClick={() => {
                dispatch(toggleLight());
              }}
            />
            <span className="slider">
              <FontAwesomeIcon className="faicon" icon={faMoon} />
              <FontAwesomeIcon className="faicon" icon={faSun} />
            </span>
          </label>

          {isLoggedin ? (
            <button
              className="btnlogin"
              onClick={() => {
                dispatch(setLogout());
              }}
            >
              登出
            </button>
          ) : (
            <button
              className="btnlogin"
              onClick={() => {
                dispatch(openLoginUI());
              }}
            >
              登入
            </button>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      {loginUI && <LoginUI />}
      {insertUI && <InsertUI />}
    </>
  );
}

export default App;
