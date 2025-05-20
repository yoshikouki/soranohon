/**
 * リンク変換: <a href="..."> を MDX 出力パスに変換
 */

import type { AST, ASTNode } from "../types";
import { convertUrlToFilePath } from "../utils/path";

export function transformLinks(ast: AST | ASTNode): AST | ASTNode {
  if (
    ast.type === "element" &&
    ast.tagName === "a" &&
    typeof ast.properties?.href === "string"
  ) {
    const newHref = convertUrlToFilePath(ast.properties.href);
    return {
      ...ast,
      properties: { ...ast.properties, href: newHref },
      children: ast.children.map(transformLinks),
    };
  }
  if ("children" in ast) {
    return {
      ...ast,
      children: ast.children.map(transformLinks),
    } as typeof ast;
  }
  return ast;
}
