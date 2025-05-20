/**
 * ルビ処理等 AST 操作
 */

import type { AST, ASTNode, ElementNode, TextNode } from "../types";

export function transformRuby(ast: AST | ASTNode): AST | ASTNode {
  if (ast.type === "element" && ast.tagName === "ruby") {
    const baseNodes = ast.children.filter(
      (node) => !(node.type === "element" && node.tagName.toLowerCase() === "rt"),
    );
    const rtNode = ast.children.find(
      (node): node is ElementNode =>
        node.type === "element" && node.tagName.toLowerCase() === "rt",
    );
    let kana = "";
    if (rtNode) {
      kana = rtNode.children
        .filter((c): c is TextNode => c.type === "text")
        .map((c) => c.value)
        .join("");
    }
    return {
      type: "element",
      tagName: "Ruby",
      properties: { kana },
      children: baseNodes.map(transformRuby),
    } as ASTNode;
  }
  if ("children" in ast) {
    return {
      ...ast,
      children: ast.children.map(transformRuby),
    } as typeof ast;
  }
  return ast;
}
