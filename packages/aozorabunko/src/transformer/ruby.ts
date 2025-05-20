/**
 * ルビ処理等 AST 操作
 */

import type { AST, ASTNode } from "../types";

export function transformRuby(ast: AST | ASTNode): AST | ASTNode {
  if (
    typeof ast === "object" &&
    ast !== null &&
    (ast as any).type === "element" &&
    (ast as any).tagName === "ruby" &&
    Array.isArray((ast as any).children)
  ) {
    const children = (ast as any).children as ASTNode[];
    const baseNodes = children.filter(
      (node) => !(node.type === "element" && (node.tagName as string).toLowerCase() === "rt"),
    );
    const rtNode = children.find(
      (node) => node.type === "element" && (node.tagName as string).toLowerCase() === "rt",
    ) as any | undefined;
    let kana = "";
    if (rtNode && Array.isArray(rtNode.children)) {
      kana = rtNode.children
        .map((c: any) => (c.type === "text" && typeof c.value === "string" ? c.value : ""))
        .join("");
    }
    return {
      type: "element",
      tagName: "Ruby",
      properties: { kana },
      children: baseNodes.map(transformRuby),
    } as ASTNode;
  }
  if (typeof ast === "object" && ast !== null && Array.isArray((ast as any).children)) {
    return {
      ...(ast as any),
      children: (ast as any).children.map(transformRuby),
    } as typeof ast;
  }
  return ast;
}
