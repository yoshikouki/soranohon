/**
 * ドメインモデル定義
 */

export interface RootNode {
  type: "root";
  children: ASTNode[];
}

export interface TextNode {
  type: "text";
  value: string;
}

export interface ElementNode {
  type: "element";
  tagName: string;
  properties?: Record<string, string>;
  children: ASTNode[];
}

export interface HeadingNode {
  type: "heading";
  depth: number;
  children: ASTNode[];
}

export type ASTNode = TextNode | ElementNode | HeadingNode;

export type AST = RootNode;

export interface Metadata {
  id: string;
  title: string;
  creator: string;
  translator?: string;
  bibliographyRaw: string;
}

