// 該 JS 主要是富文本編輯器的功能，
// 對於 node 和 leaf 的操作 (例如 : bold, align, code等)
import { Editor, Transforms, Element, Range } from "slate";
import { ReactEditor } from "slate-react";
const CustomEditor = {
  // 獲取當前選中的 block。
  // currentSelectedBlock(editor) {
  //   let selected = null;
  //   if (editor.selection !== null && editor.selection.anchor !== null) {
  //     selected = editor.children[editor.selection.anchor.path[0]];
  //   } else {
  //     selected = null;
  //   }
  //   return selected;
  // },

  unwrapList(editor) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        Element.isElement(n) &&
        (n.type === "link" || n.type === "ol" || n.type === "ul"),
      split: true,
    });
  },

  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isBlockActive(editor, type) {
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);

    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  // 此自定義輔助函數(Customer Hepler Function)未使用，將整個block-level 的 type 轉變 code
  // toggleCodeBlock(editor) {
  //   const isActive = CustomEditor.isBlockActive(editor, "code");
  //   Transforms.setNodes(
  //     editor,
  //     { type: isActive ? null : "code" },
  //     { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
  //   );
  //   CustomEditor.unwrapList(editor);
  // },

  alignElement(editor, alignType) {
    const isActive = CustomEditor.isBlockActive(editor, "li");
    Transforms.setNodes(
      editor,
      { align: alignType },
      {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
        mode: isActive ? "highest" : "lowest",
      }
    );
  },

  textIncrease(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "ol" || n.type === "ul",
      mode: "highest",
    });

    if (match) {
      Transforms.setNodes(
        editor,
        {
          fontsize: match[0].fontsize > 1 ? match[0].fontsize + 0.2 : 1.2,
        },
        {
          mode: "highest",
        }
      );
    } else {
      const mark = Editor.marks(editor);
      if (mark?.fontsize && mark.fontsize >= 1) {
        Editor.addMark(editor, "fontsize", mark.fontsize + 0.2);
      } else {
        Editor.addMark(editor, "fontsize", 1);
      }
    }
  },

  textDecrease(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "ol" || n.type === "ul",
      mode: "highest",
    });

    if (match) {
      Transforms.setNodes(
        editor,
        {
          fontsize: match[0].fontsize > 1 ? match[0].fontsize - 0.2 : 1,
        },
        {
          mode: "highest",
        }
      );
    } else {
      const mark = Editor.marks(editor);
      if (mark?.fontsize && mark.fontsize > 1) {
        Editor.addMark(editor, "fontsize", mark.fontsize - 0.2);
      } else if (mark?.fontsize <= 1) {
        Editor.addMark(editor, "fontsize", 1);
      }
    }
  },
  setCodeSnippet(editor) {
    const marks = Editor.marks(editor);
    if (marks?.type === "code") {
      Editor.removeMark(editor, "type");
    } else {
      Editor.addMark(editor, "type", "code");
    }
  },

  setHeadOne(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "h1",
    });
    Transforms.setNodes(
      editor,
      { type: match ? null : "h1" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
    CustomEditor.unwrapList(editor);
  },

  setHeadTwo(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "h2",
    });
    Transforms.setNodes(
      editor,
      { type: match ? null : "h2" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
    CustomEditor.unwrapList(editor);
  },

  // 該函數用來插入有序清單，檢查block類型是否為li，
  // True 則設為 null 並移除 ol 的包裹；False 則設為 li 並包裹在 ol 中。
  insertOrderList(editor) {
    const isActive = CustomEditor.isBlockActive(editor, "li");
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "li" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
    if (isActive) {
      CustomEditor.unwrapList(editor);
    } else {
      Transforms.wrapNodes(editor, { type: "ol", children: [] });
    }
  },

  // 和 insertOrderList(editor) 一樣，只是改被 ul 包裹。
  insertBulletList(editor) {
    const isActive = CustomEditor.isBlockActive(editor, "li");

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "li" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
    if (isActive) {
      CustomEditor.unwrapList(editor);
    } else {
      Transforms.wrapNodes(editor, { type: "ul", children: [] });
    }
  },
  changeTextColor(editor, color) {
    Editor.addMark(editor, "color", color);
  },

  addLink(editor, url) {
    const { selection } = editor;
    CustomEditor.unwrapList(editor);

    if (!selection || Range.isCollapsed(selection)) {
      const linkNode = {
        type: "link",
        url,
        children: [{ text: "連結" }],
      };

      // 插入連結節點
      Transforms.insertNodes(editor, linkNode, { select: false });
    } else {
      Transforms.wrapNodes(editor, { type: "link", url }, { split: true });
      Transforms.collapse(editor, { edge: "end" });
    }

    Transforms.insertNodes(editor, { text: "" });

    Transforms.select(editor, Editor.end(editor, []));
    ReactEditor.focus(editor);
  },
};

export default CustomEditor;
