/**
 * 見出し変換など AST 操作
 */

import type { AST, ASTNode } from "../types";

export function transformHeadings(ast: AST | ASTNode): AST | ASTNode {
  if (ast.type === "element") {
    const match = ast.tagName.match(/^h([1-6])$/);
    if (match) {
      const depth = parseInt(match[1], 10);
      return {
        type: "heading",
        depth,
        children: ast.children,
      } as ASTNode;
    }
  }
  if ("children" in ast) {
    return {
      ...ast,
      children: ast.children.map(transformHeadings),
    } as typeof ast;
  }
  return ast;
}
