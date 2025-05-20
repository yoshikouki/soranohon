/**
 * 見出し変換など AST 操作
 */

import type { AST, ASTNode } from "../types";

export function transformHeadings(ast: AST | ASTNode): AST | ASTNode {
  if (
    typeof ast === "object" &&
    ast !== null &&
    (ast as any).type === "element" &&
    typeof (ast as any).tagName === "string"
  ) {
    const tag = (ast as any).tagName;
    const match = tag.match(/^h([1-6])$/);
    if (match) {
      const depth = parseInt(match[1], 10);
      return {
        type: "heading",
        depth,
        children: (ast as any).children,
      } as ASTNode;
    }
  }
  if (
    typeof ast === "object" &&
    ast !== null &&
    Array.isArray((ast as any).children)
  ) {
    return {
      ...(ast as any),
      children: (ast as any).children.map(transformHeadings),
    } as typeof ast;
  }
  return ast;
}
