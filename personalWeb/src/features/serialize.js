import escapeHtml from "escape-html";
import { Text } from "slate";

export const serializes = (node) => {
  return node.map(function serialize(n) {
    if (Text.isText(n)) {
      let string = escapeHtml(n.text);
      let style = "";
      if (n.bold) {
        style += `font-weight:bold; `;
      }
      if (n.fontsize) {
        style += `font-size:${n.fontsize}; `;
      }
      if (n.color) {
        style += `color:${n.color}; `;
      }
      switch (n.type) {
        case "code":
          return `<code>${string}</code>`;
      }
      return style ? `<span style="${style}">${string}</span>` : string;
    }
    const children = n.children.map((value) => serialize(value)).join("");

    //後續有其他style屬性直接寫判斷就好。用switch需要有統一的對象。
    let attrString = "";
    if (n.align) {
      attrString += `text-align:${n.align}; `;
    }
    if(n.fontsize){
      attrString += `font-size:${n.fontsize}; `;
    }
    // console.log(attrString)

    switch (n.type) {
      case "paragraph":
        return `<div ${attrString ? `style="${attrString}"` : attrString}>${children}</div>`;
      case "h1":
        return `<h1 ${attrString ? `style="${attrString}"` : attrString}>${children}</h1>`;
      case "h2":
        return `<h2 ${attrString ? `style="${attrString}"` : attrString}>${children}</h2>`;
      case "ol":
        return `<ol ${attrString ? `style="${attrString}"` : attrString}>${children}</ol>`;
      case "ul":
        return `<ul ${attrString ? `style="${attrString}"` : attrString}>${children}</ul>`;
      case "li":
        return `<li>${children}</li>`;
      default:
        return `<div>${children}</div>`;
    }
  });
};
