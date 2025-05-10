# html2mdx.ts リファクタリング計画

## 目標

- コードの境界を明確にし、テスト容易性を高める
- AozoraBunkoHtml, RubyTags クラスの設計と実装
- 既存の BookContent クラスとの連携
- モックを使わない設計に変更

## ドメインモデル設計

### AozoraBunkoHtml クラス

```typescript
// src/lib/aozorabunko/aozora-bunko-html.ts
export class AozoraBunkoHtml {
  private readonly html: string;
  private readonly mainText: cheerio.Cheerio;

  private constructor(html: string) {
    this.html = html;
    this.mainText = this.extractMainText();
  }

  // ファクトリーメソッド
  static async read(htmlProvider: () => Promise<string>): Promise<AozoraBunkoHtml> {
    const html = await htmlProvider();
    return new AozoraBunkoHtml(html);
  }

  // メタデータ抽出
  extractBookMeta(): BookMeta {
    // 既存の extractBookMeta.ts の実装を移行
  }

  // BookContentへの変換
  convertToBookContent(options: { bookContent: BookContent; existingRubyTags: RubyTags }): void {
    const lines = this.extractLines();
    const paragraphs = this.formParagraphs(lines);
    
    // BookContentに追加
    for (const paragraph of paragraphs) {
      options.bookContent.addParagraph(paragraph);
    }
  }

  // private メソッド群
  private extractMainText(): cheerio.Cheerio {
    // 既存の extractMainText 関数の実装
  }

  private extractLines(): string[] {
    // 既存の extractLines 関数の実装
  }

  private formParagraphs(lines: string[]): string[] {
    // 既存の formParagraphs 関数の実装
  }
}
```

### RubyTags クラス

```typescript
// src/lib/aozorabunko/ruby-tags.ts
export class RubyTags {
  private rubyMap: Map<string, string[]>;

  constructor(rubyMap: Map<string, string[]> = new Map()) {
    this.rubyMap = rubyMap;
  }

  // ファクトリーメソッド - BookContentからルビを抽出
  static extract(bookContent: BookContent | null): RubyTags {
    if (!bookContent) return new RubyTags();
    
    const mdx = bookContent.toMdx();
    const rubyMap = new Map<string, string[]>();
    
    // 既存の extractExistingRubyTags のロジックを移植
    const matches = [...mdx.matchAll(rubyTagRegex)];
    for (const match of matches) {
      // ルビ抽出ロジック
    }
    
    return new RubyTags(rubyMap);
  }

  // 漢字へのルビタグ追加
  addPlaceholderRubyToKanji(text: string): string {
    // 既存の addPlaceholderRubyToKanji の実装を移植
  }

  // 既存ルビを保持しながらルビタグ追加
  addRubyTagsWithPreservation(mdx: string): string {
    // 既存の addRubyTagsWithPreservation の実装を移植
  }
}
```

### BookContent クラスの拡張

既存の BookContent クラスを拡張し、必要なメソッドを追加します。

## テストケース設計

### AozoraBunkoHtmlのテスト

- `AozoraBunkoHtml.read` メソッドのテスト
- `extractBookMeta` メソッドのテスト
- `convertToBookContent` メソッドのテスト
- 各 private メソッドのテスト

### RubyTagsのテスト

- `RubyTags.extract` メソッドのテスト
- `addPlaceholderRubyToKanji` メソッドのテスト
- `addRubyTagsWithPreservation` メソッドのテスト

## 実装ステップ

1. `AozoraBunkoHtml` クラスの実装とテスト
2. `RubyTags` クラスの実装とテスト
3. `html2mdx.ts` スクリプトのリファクタリング

## ディレクトリ構造

```
src/
  lib/
    aozorabunko/
      aozora-bunko-html.ts     # AozoraBunkoHtml クラス
      aozora-bunko-html.test.ts
      ruby-tags.ts             # RubyTags クラス
      ruby-tags.test.ts
      book-meta.ts             # 既存のメタデータ抽出関連
      encoding.ts              # 既存のエンコーディング関連
      path.ts                  # 既存のパス関連
```