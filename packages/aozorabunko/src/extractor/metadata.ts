import path from "path";
import type { AST, ASTNode, ElementNode, Metadata, RootNode, TextNode } from "../types";

/**
 * メタデータ（書誌情報）抽出
 */

export function extractMetadata(ast: AST, htmlPath?: string): Metadata {
  const id = htmlPath ? path.basename(htmlPath, path.extname(htmlPath)) : "";
  let title = "";
  let creator = "";
  let translator: string | undefined;
  let bibliographyRaw = "";

  function extractText(nodes: ASTNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === "text") {
          return node.value;
        }
        if ("children" in node) {
          return extractText(node.children);
        }
        return "";
      })
      .join("");
  }

  function traverse(node: ASTNode | RootNode): void {
    if (node.type === "element") {
      const { tagName, properties, children } = node as ElementNode;
      const className = properties?.class;
      if (tagName === "h1" && !title) {
        title = extractText(children);
      } else if (tagName === "h2" && className === "author" && !creator) {
        creator = extractText(children);
      } else if (tagName === "h2" && className === "translator" && translator === undefined) {
        translator = extractText(children);
      } else if (
        tagName === "div" &&
        className === "bibliographical_information" &&
        !bibliographyRaw
      ) {
        const lines = children
          .filter((n): n is TextNode => n.type === "text")
          .map((n) => n.value.trim());
        bibliographyRaw = lines.join("\n");
      }
    }
    if ("children" in node) {
      node.children.forEach(traverse);
    }
  }

  traverse(ast);

  return { id, title, creator, translator, bibliographyRaw };
}
