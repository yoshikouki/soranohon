/**
 * HTML → AST parser using unified/rehype
 */

import { JSDOM } from "jsdom";
import type { ASTNode, AST } from "../types";

/**
 * HTML → AST parser
 * JSDOMを使用してDOMを生成し、簡易的なHASTライクなASTを返す
 */
export function parseHtml(html: string): AST {
  const { document } = new JSDOM(html).window;

  function traverse(node: Node): ASTNode | null {
    if (node.nodeType === node.TEXT_NODE) {
      return { type: "text", value: node.textContent || "" };
    }
    if (node.nodeType === node.ELEMENT_NODE) {
      const el = node as Element;
      const properties: Record<string, string> = {};
      for (const attr of Array.from(el.attributes)) {
        properties[attr.name] = attr.value;
      }
      return {
        type: "element",
        tagName: el.tagName.toLowerCase(),
        properties,
        children: Array.from(el.childNodes)
          .map(traverse)
          .filter(Boolean) as ASTNode[],
      };
    }
    return null;
  }

  const children = Array.from(document.body.childNodes)
    .map(traverse)
    .filter(Boolean) as ASTNode[];
  return { type: "root", children };
}
