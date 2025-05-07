# Ruby タグの上書き問題の分析と解決策

## 問題の概要

コミット 3eee43558cfc95c7cc3a1387a55f1e05c12c3a43 と 53bc82127a8277bd2f883a4d19ae3ee7a886b472 で実装した ruby の上書き防止修正について、まだ上書きが発生している。

具体例：
```
- <ruby>一<rt>いっ</rt></ruby><ruby>軒
+ <ruby>一<rt>ひと</rt></ruby><ruby>軒
```

期待する結果は、差分なしで元のルビ「ひと」が保持されること。

## 現在の FIFO 翻訳キューの概要
現在の FIFO キュー実装は以下のようになっています：

1. globalRubyQueue という Map を使って各漢字の現在のインデックスを追跡
2. 漢字が複数回出現すると、そのインデックスを進めて次の読みに移動
3. インデックスは (currentIndex + 1) % rubyArray.length でループさせている
4. このキューは文書全体でグローバルに保持され、文脈に関わらず順番に読みが適用される

特に ruby-utils.ts の 107-112 行目の以下のコードが中心的な実装です：
const currentIndex = globalRubyQueue.get(kanji) || 0;

// 使用するルビを取得し、インデックスを進める
const rubyToUse = rubyArray[currentIndex % rubyArray.length];
globalRubyQueue.set(kanji, (currentIndex + 1) % rubyArray.length);

これにより、「家」が「いえ」→「うち」→「いえ」と順番に変わっていきます。

## 復元元の ruby のパターン

復元元の ruby はいくつかパターンがあり、確認できているだけでも

- `<ruby><rb>壁</rb><rp>（</rp><rt>かべ</rt><rp>）</rp></ruby>`
- `<ruby><rb>壁</rb><rt>かべ</rt></ruby>`
- `<ruby>壁<rt>かべ</rt></ruby>`

## 問題のテストケース

src/lib/ruby-utils.test.ts にバグ再現を用意した
