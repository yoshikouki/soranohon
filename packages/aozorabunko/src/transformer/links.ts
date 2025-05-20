/**
 * リンク変換: <a href="..."> を MDX 出力パスに変換
 */
import { convertUrlToFilePath } from "../utils/path";
import type { AST, ASTNode } from "../types";

export function transformLinks(ast: AST | ASTNode): AST | ASTNode {
  if (
    typeof ast === "object" &&
    ast !== null &&
    (ast as any).type === "element" &&
    (ast as any).tagName === "a" &&
    typeof (ast as any).properties === "object" &&
    typeof (ast as any).properties.href === "string"
  ) {
    const el = ast as any;
    const newHref = convertUrlToFilePath(el.properties.href);
    return {
      ...el,
      properties: { ...el.properties, href: newHref },
      children: Array.isArray(el.children) ? el.children.map(transformLinks) : el.children,
    };
  }
  if (typeof ast === "object" && ast !== null && Array.isArray((ast as any).children)) {
    const el = ast as any;
    return {
      ...el,
      children: el.children.map(transformLinks),
    } as typeof ast;
  }
  return ast;
}
