import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkSession,
  insertArticlesToDB,
  editArticlesToDB,
} from "./features/profileSlice";
import { cancelUI } from "./features/uiSlice";
import { createEditor, Editor, Node } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import CustomEditor from "./features/customerHelper";
import { insertData, getData } from "./features/indexedDB";
import { serializes } from "./features/serialize";

export const InsertUI = () => {
  const initialValue = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];

  const operation = useSelector((state) => state.ui.operation);
  const light = useSelector((state) => state.ui.light);
  const insertLoading = useSelector((state) => state.ui.insertLoading);

  const selectedID = useSelector((state) => state.profile.selectedID);
  const dispatch = useDispatch();

  const [editor] = useState(() => withReact(withHistory(createEditor())));
  const [currentColor, setCurrentColor] = useState("#000000");
  const [editorKey, setEditorKey] = useState(0); // 強制讓slate重新渲染初始值
  const [dataToIndexedDB, setDataToIndexedDB] = useState({
    type: operation,
    isShow: true,
  });

  //每次插入到indexedDB的都是字串化的JSON
  if (dataToIndexedDB.title || dataToIndexedDB.article) {
    insertData({
      type: dataToIndexedDB.type,
      title: dataToIndexedDB.title,
      article: dataToIndexedDB.article,
    });
  }

  // 每10秒(可更改)輪詢更新cookie過期值，關閉 UI 觸發清理函數。
  useEffect(() => {
    const rolling = setInterval(() => {
      dispatch(checkSession("insert"));
    }, 1000 * 60 * 5);

    return () => {
      clearInterval(rolling);
      // console.log("setInterval 被清除了");
    };
  }, [dispatch]);

  useEffect(() => {
    // 根據模式載入 indexedDB 中的數據。
    const load = async (type) => {
      const getDataByIndexedDB = await getData(type);
      // console.log(getDataByIndexedDB);
      if (!getDataByIndexedDB) return;
      // indexedDB有數據才執行
      if (getDataByIndexedDB) {
        const articleByIndexedDB = getDataByIndexedDB.article || "";
        setDataToIndexedDB((prev) => ({
          ...prev,
          article: articleByIndexedDB,
          title: getDataByIndexedDB.title,
        }));

        setEditorKey(1);
      }

      // console.log("getDataByIndexedDB : ", getDataByIndexedDB);
    };
    if (dataToIndexedDB.type) {
      load(dataToIndexedDB.type);
    }
  }, []);

  const handleEditorChange = (newValue) => {
    // 從 editor 取得目前選區的 marks
    // console.log("slate內容 :", newValue);
    const marks = Editor.marks(editor);
    const isAstChange = editor.operations.some(
      (op) => "set_selection" !== op.type
    );
    setCurrentColor((prevColor) => {
      if (prevColor === marks?.color) return;
      return marks?.color || "#000000";
    });
    if (isAstChange) {
      setDataToIndexedDB((prev) => ({ ...prev, article: newValue }));
    }
  };

  const handleInsert = async (event) => {
    event.preventDefault();
    const plaintext = dataToIndexedDB.article
      ? dataToIndexedDB.article
          .map((node) => Node.string(node))
          .join("")
          .trim()
      : false;
    if (!plaintext) {
      alert("文章不能完全為空");
      return;
    }
    if (!dataToIndexedDB.type) {
      alert("出現未知錯誤");
      return;
    }
    const serializesHTML = serializes(dataToIndexedDB.article);
    const idMap = { insert: Date.now(), edit: selectedID };
    const id = idMap[dataToIndexedDB.type];
    const articleData = {
      id: id,
      type: dataToIndexedDB.type,
      content: {
        id: id,
        title: dataToIndexedDB.title,
        article: serializesHTML,
        articleJson: dataToIndexedDB.article,
        isShow: dataToIndexedDB.isShow,
      },
    };
    if (dataToIndexedDB.type === "insert") {
      dispatch(insertArticlesToDB(articleData));
    } else if (dataToIndexedDB.type === "edit") {
      console.log("將遠端資料庫更新", articleData);
      dispatch(editArticlesToDB(articleData));
    }

    // console.log(Object.prototype.toString.call(dataToIndexedDB.article));
  };

  // 選擇渲染 block-level 元素的函數。
  const renderElement = useCallback((props) => {
    const style = {
      textAlign: props.element.align ? props.element.align : "left",
    };
    switch (props.element.type) {
      case "h1":
        return <HeadOneElement style={style} {...props} />;
      case "h2":
        return <HeadTwoElement style={style} {...props} />;
      case "ol":
        return <Orderlist style={style} {...props} />;
      case "ul":
        return <Bulletlist style={style} {...props} />;
      case "li":
        return <ListElement {...props} />;
      default:
        return <DefaultElement style={style} {...props} />;
    }
  }, []);

  // 選擇渲染 inline-level 元素的函數
  const renderLeaf = useCallback((props) => {
    switch (props.leaf.type) {
      case "code":
        return <Codeleaf {...props} />;
      default:
        return <Leaf {...props} />;
    }
  }, []);

  const renderPlaceholder = useCallback((props) => {
    return <Placeholder {...props} />;
  }, []);

  return (
    <>
      <form
        onSubmit={handleInsert}
        className={`insertUI ${light ? "lightmode" : "darkmode"} ${
          insertLoading && "block"
        }`}
      >
        <div className="insert-title">
          <label htmlFor="title">標題</label>
          <input
            defaultValue={dataToIndexedDB.title || ""}
            type="text"
            id="title"
            placeholder="請輸入標題"
            onChange={(event) =>
              setDataToIndexedDB((prev) => ({
                ...prev,
                title: event.target.value,
              }))
            }
            required
          />
        </div>
        <Slate
          key={editorKey}
          editor={editor}
          initialValue={dataToIndexedDB.article || initialValue}
          onChange={handleEditorChange}
        >
          <div className="insert-features">
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.setHeadOne(editor);
              }}
            >
              format_h1
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.setHeadTwo(editor);
              }}
            >
              format_h2
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.insertOrderList(editor);
              }}
            >
              format_list_numbered
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.insertBulletList(editor);
              }}
            >
              format_list_bulleted
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
              }}
            >
              format_bold
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.textIncrease(editor);
              }}
            >
              text_increase
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.textDecrease(editor);
              }}
            >
              text_decrease
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.alignElement(editor, "left");
              }}
            >
              format_align_left
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.alignElement(editor, "center");
              }}
            >
              format_align_center
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.alignElement(editor, "right");
              }}
            >
              format_align_right
            </span>
            <span
              className="material-symbols-rounded"
              onClick={(event) => {
                event.preventDefault();
                CustomEditor.setCodeSnippet(editor);
              }}
            >
              code
            </span>
            <input
              type="color"
              value={currentColor}
              onChange={(e) =>
                CustomEditor.changeTextColor(editor, e.target.value)
              }
            />
          </div>
          <Editable
            className="insert-editor"
            placeholder="Enter some text..."
            renderElement={renderElement}
            // Pass in the `renderLeaf` function.
            renderLeaf={renderLeaf}
            renderPlaceholder={renderPlaceholder}
            onKeyDown={(event) => {
              if (Editor.marks(editor)?.type === "code") {
                Editor.removeMark(editor, "type");
              }
              if (!event.altKey) return;
              switch (event.code) {
                case "KeyO":
                  event.preventDefault();
                  CustomEditor.insertOrderList(editor);
                  break;
                case "KeyB":
                  event.preventDefault();
                  CustomEditor.insertBulletList(editor);
                  break;
              }
            }}
          />
        </Slate>
        <div className="login">
          <button className="btnlogin" type="submit">
            儲存退出
          </button>

          {/* 之後記得刪除 "insert" */}
          <button className="btnlogin" onClick={() => dispatch(cancelUI())}>
            取消
          </button>
        </div>
      </form>
      {insertLoading && <div className="spinner" />}
    </>
  );
};

const DefaultElement = (props) => {
  // console.log(props);
  return (
    <div style={{ ...props.style }} {...props.attributes}>
      {props.children}
    </div>
  );
};

const HeadOneElement = (props) => {
  return (
    <h1 style={{ ...props.style, margin: "0px" }} {...props.attributes}>
      {props.children}
    </h1>
  );
};

const HeadTwoElement = (props) => {
  return (
    <h2 style={{ ...props.style, margin: "0px" }} {...props.attributes}>
      {props.children}
    </h2>
  );
};

const Placeholder = (props) => {
  return (
    <span {...props.attributes} className="insert-placeholder">
      {props.children}
    </span>
  );
};

const Leaf = (props) => {
  // console.log(props);
  return (
    <span
      {...props.attributes}
      style={{
        color: props.leaf.color || "#000000",
        fontWeight: props.leaf.bold ? "bold" : "normal",
        fontSize: props.leaf.fontsize > 1 ? `${props.leaf.fontsize}em` : "1em",
      }}
    >
      {props.children}
    </span>
  );
};

const Codeleaf = (props) => {
  // console.log(props);
  return <code {...props.attributes}>{props.children}</code>;
};

const Orderlist = (props) => {
  // console.log("ol :", props);
  return (
    <ol
      style={{
        ...props.style,
        listStylePosition: "inside",
        fontSize: props.element.fontsize
          ? `${props.element.fontsize}em`
          : "1em",
      }}
      {...props.attributes}
    >
      {props.children}
    </ol>
  );
};

const Bulletlist = (props) => {
  return (
    <ul
      style={{ ...props.style, listStylePosition: "inside" }}
      {...props.attributes}
    >
      {props.children}
    </ul>
  );
};

const ListElement = (props) => {
  // console.log("li :", props);
  return <li {...props.attributes}>{props.children}</li>;
};
