// BookContentインターフェースの定義
// このインターフェースによって@/features/book-content/coreへの直接依存を避ける
export interface BookContentInterface {
  contents: string[];
  toMdx(): string;
  toStringWithoutTags(): string;
  addParagraph(paragraph: string): void;
}

export class SimpleBookContent implements BookContentInterface {
  contents: string[] = [];

  constructor(content?: string) {
    this.contents = content ? content.split("\n\n") : [];
  }

  toMdx(): string {
    return this.contents.join("\n\n");
  }

  toStringWithoutTags(): string {
    // シンプルな実装（HTMLタグを取り除く処理は省略）
    return this.contents.join("\n\n");
  }

  addParagraph(paragraph: string): void {
    this.contents.push(paragraph);
  }
}
