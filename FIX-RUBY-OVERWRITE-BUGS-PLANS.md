# Ruby タグの上書き問題の分析と解決策

## 問題の概要

src/lib/ruby-utils.ts で実装されている ruby の上書き防止修正について、上書きが発生するパターンが見つかった。

具体例：
```diff
- <ruby>一<rt>いっ</rt></ruby><ruby>軒
+ <ruby>一<rt>ひと</rt></ruby><ruby>軒
```

上書きが発生するコマンド

```bash
$ bun run ./bin/html2mdx.ts /Users/yoshikouki/src/github.com/aozorabunko/aozorabunko/cards/001091/files/42308_17916.html
```

## 問題の機序

上書きが発生する原因は、以下の通り。

1. 変換前の HTML に同じ感じに対してルビが存在するものとないものがある
  (例: `ルビなしの家、ルビありの<ruby><rb>家</rb><rp>（</rp><rt>うち</rt><rp>）</rp></ruby>、ルビなしの家`)
2. #addRubyTagsWithPreservation の引数 existingRubyTags にはどちらのルビも保存されている
  (例: `{ "家": ["いえ", "うち", "いえ"] }`)
  (例: `ルビなしの<ruby>家<rt>いえ</rt></ruby>、ルビありの<ruby>家<rt>うち</rt></ruby>、ルビなしの<ruby>家<rt>いえ</rt></ruby>`)
3. #addRubyTagsWithPreservation の処理で HTML の既存ルビはプレイスホルダーに置き換わる
  (例: `ルビなしの家、ルビありの__RUBY_TAG_1__、ルビなしの家`)
4. ルビなしの漢字に ruby タグが張られ、 existingRubyTags によって復元される
  (例: `{ "家": ["うち"] }`)
  (例: `ルビなしの<ruby>家<rt>いえ</rt></ruby>、ルビありの__RUBY_TAG_1__、ルビなしの<ruby>家<rt>うち</rt></ruby>`)
5. 最後にプレースホルダーが元のルビに戻される
  (例: `ルビなしの<ruby>家<rt>いえ</rt></ruby>、ルビありの<ruby>家<rt>うち</rt></ruby>、ルビなしの<ruby>家<rt>うち</rt></ruby>`)

変換前後で差分が発生する (2, 5 で差分が生じている)

```diff
- ルビなしの<ruby>家<rt>いえ</rt></ruby>、ルビありの<ruby>家<rt>うち</rt></ruby>、ルビなしの<ruby>家<rt>いえ</rt></ruby>
+ ルビなしの<ruby>家<rt>いえ</rt></ruby>、ルビありの<ruby>家<rt>うち</rt></ruby>、ルビなしの<ruby>家<rt>うち</rt></ruby>
```

## 解決手順

以下のそれぞれの手順で git commit を実行する

- 問題の原因を特定して、当ドキュメントを更新する
- ルビ関係処理を修正する計画を当ドキュメントに記載する
- TDDに乗っ取り、テストケースを書く
- テストが落ちることを確認する bun run test
- 修正してテストが通ることを確認する

## 原因

WIP

## 修正計画

WIP
