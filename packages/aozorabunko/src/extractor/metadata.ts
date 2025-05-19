import path from "path";

/**
 * メタデータ（書誌情報）抽出
 */
export interface Metadata {
  id: string;
  title: string;
  creator: string;
  translator?: string;
  bibliographyRaw: string;
}

export function extractMetadata(ast: unknown, htmlPath?: string): Metadata {
  const id = htmlPath ? path.basename(htmlPath, path.extname(htmlPath)) : "";
  let title = "";
  let creator = "";
  let translator: string | undefined;
  let bibliographyRaw = "";

  function extractText(nodes: any[]): string {
    return nodes
      .map((node) => {
        if (node && typeof node === "object") {
          if (node.type === "text" && typeof (node as any).value === "string") {
            return (node as any).value;
          }
          if (Array.isArray((node as any).children)) {
            return extractText((node as any).children);
          }
        }
        return "";
      })
      .join("");
  }

  function traverse(node: any): void {
    if (node && typeof node === "object" && node.type === "element") {
      const { tagName, properties, children } = node;
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
        const lines = (children as any[])
          .filter((n) => n.type === "text" && typeof n.value === "string")
          .map((n) => n.value.trim());
        bibliographyRaw = lines.join("\n");
      }
    }
    if (node && typeof node === "object" && Array.isArray((node as any).children)) {
      (node as any).children.forEach(traverse);
    }
  }

  traverse(ast as any);

  return { id, title, creator, translator, bibliographyRaw };
}
