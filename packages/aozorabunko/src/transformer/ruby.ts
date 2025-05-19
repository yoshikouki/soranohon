/**
 * ルビ処理等 AST 操作
 */

export function transformRuby(ast: unknown): unknown {
  if (
    typeof ast === "object" &&
    ast !== null &&
    (ast as any).type === "element" &&
    (ast as any).tagName === "ruby" &&
    Array.isArray((ast as any).children)
  ) {
    const children = (ast as any).children as any[];
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
    };
  }
  if (typeof ast === "object" && ast !== null && Array.isArray((ast as any).children)) {
    return {
      ...(ast as any),
      children: (ast as any).children.map(transformRuby),
    };
  }
  return ast;
}
