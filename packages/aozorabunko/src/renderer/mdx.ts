/**
 * AST → MDX 文字列生成
 */

import type { AST, ASTNode } from "../types";

export function renderMdx(ast: AST | ASTNode): string {
  function serialize(node: AST | ASTNode): string {
    if (node.type === "root") {
      return node.children.map(serialize).join("");
    }
    if (node.type === "text") {
      return node.value;
    }
    if (node.type === "heading") {
      const hashes = "#".repeat(node.depth);
      return hashes + " " + node.children.map(serialize).join("") + "\n\n";
    }
    if (node.type === "element") {
      const props = node.properties ?? {};
      const attrString = Object.entries(props)
        .map(([k, v]) => `${k}="${String(v)}"`)
        .join(" ");
      const open = `<${node.tagName}${attrString ? " " + attrString : ""}>`;
      const content = node.children.map(serialize).join("");
      const close = `</${node.tagName}>`;
      return open + content + close;
    }
    return "";
  }

  return serialize(ast);
}
