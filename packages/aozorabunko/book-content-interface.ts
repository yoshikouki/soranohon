// bookContentのインターフェース定義
export interface BookContentInterface {
  contents: string[];
  toMdx: (contents?: string[]) => string;
  toStringWithoutTags: () => string;
  addParagraph: (paragraph: string) => void;
}

// シンプルなBookContent実装
export class SimpleBookContent implements BookContentInterface {
  contents: string[] = [];

  constructor(content?: string) {
    this.contents = content ? content.split("\n\n") : [];
  }

  toMdx(_contents = this.contents): string {
    return _contents.join("\n\n");
  }

  toStringWithoutTags(): string {
    const _contents = this.contents.map((content) =>
      content.replace(/<ruby>.*?<rb>(.*?)<\/rb>.*?<\/ruby>/g, "$1").replace(/<[^>]*>/g, ""),
    );
    return _contents.join("\n\n");
  }

  addParagraph(paragraph: string) {
    this.contents.push(paragraph);
  }
}
