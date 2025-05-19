/**
 * AST → MDX 文字列生成
 */

export function renderMdx(ast: unknown): string {
  function serialize(node: any): string {
    if (node.type === "root" && Array.isArray(node.children)) {
      return node.children.map(serialize).join("");
    }
    if (node.type === "text" && typeof node.value === "string") {
      return node.value;
    }
    if (
      node.type === "heading" &&
      typeof node.depth === "number" &&
      Array.isArray(node.children)
    ) {
      const hashes = "#".repeat(node.depth);
      return hashes + " " + node.children.map(serialize).join("") + "\n\n";
    }
    if (node.type === "element" && typeof node.tagName === "string") {
      const props = node.properties || {};
      const attrString = Object.entries(props)
        .map(([k, v]) => `${k}="${String(v)}"`)
        .join(" ");
      const open = `<${node.tagName}${attrString ? " " + attrString : ""}>`;
      const content = Array.isArray(node.children) ? node.children.map(serialize).join("") : "";
      const close = `</${node.tagName}>`;
      return open + content + close;
    }
    return "";
  }

  return serialize(ast);
}
