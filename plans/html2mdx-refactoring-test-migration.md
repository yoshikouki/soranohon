# html2mdx.ts リファクタリングにおけるテスト移行状況

## テスト移行状況一覧

| テストケース | 移行先 | 状態 |
|------------|-------|------|
| extractMainText | AozoraBunkoHtml (private method) | 移行済み |
| htmlToMdx | AozoraBunkoHtml.convertToBookContent | 部分的に移行 |
| extractLines | AozoraBunkoHtml (private method) | 移行済み |
| formParagraphs | AozoraBunkoHtml (private method) | 移行済み |
| removeTrailingBreaks | AozoraBunkoHtml (private method) | 移行済み |
| addPlaceholderRubyToKanji | RubyTags.addPlaceholderRubyToKanji | 移行済み |
| addRubyTagsToMdx | RubyTags.addRubyTagsWithPreservation | 移行済み |
| convertHtmlToMdxWithRuby | AozoraBunkoHtml + RubyTags 連携 | 部分的に移行 |
| isJisageOrStyledDiv | AozoraBunkoHtml (private method) | 移行済み |
| removeLeadingFullWidthSpace | AozoraBunkoHtml (private method) | 移行済み |

## 元のテストケースの詳細

### extractMainText (移行済み)
- main_text要素を抽出できるか
- main_text要素がない場合にエラーをスローするか
- ネストされた要素を処理できるか
- 空のmain_textを処理できるか

### htmlToMdx (部分的に移行)
- プレーンテキストを変換できるか
- brタグを処理できるか
- rubyタグを処理できるか
- emタグを処理できるか
- 全角スペースで段落を分割してそれを削除するか
- 「や（で始まる行を段落として分割するか
- 先頭と末尾のbrを削除するか
- 空行や空白だけの行を無視するか
- main_textがない場合にエラーをスローするか
- classをclassNameに変換するか
- 複数のタグが混在する場合を処理できるか
- 空のmain_textに対して空文字を返すか
- 連続したbrタグの間の空白を無視するか
- 段落分割前に複数のbrタグを削除するか
- ネストされたタグを処理できるか
- brタグだけのmain_textを処理できるか
- 複数の属性を持つタグを処理できるか
- 予期しないタグを処理できるか
- 交互にテキストとタグがある場合を処理できるか
- 空白とbrタグだけの場合に空文字を返すか
- 全角スペースを削除するか
- 複雑なrubyタグを簡素化するか
- 複雑なrubyタグを含むコンテンツを処理できるか
- 単純なrubyタグと複雑なrubyタグの混在を処理できるか

### extractLines (移行済み)
- テキストノードを行として抽出するか
- 空のテキストノードを無視するか
- 連続したbrタグを一つにまとめるか
- HTMLタグを変換してclassをclassNameに置き換えるか
- 混合コンテンツを処理できるか
- 先頭と末尾のbrを削除するか
- 空のmain_textを処理できるか

### formParagraphs (移行済み)
- 行から段落を形成できるか
- 全角スペースで段落を分割してそれを削除するか
- 「で始まる行で段落を分割するか
- （で始まる行で段落を分割するか
- 段落末尾のbrを削除し、先頭の全角スペースを削除するか
- 空の行配列を処理できるか
- 複数の段落区切りがある複雑なケースを処理できるか

### removeTrailingBreaks (移行済み)
- 末尾のbrタグを削除するか
- 末尾にbrがない場合は何もしないか
- 空の行配列を処理できるか
- 末尾のbrタグだけを削除するか
- brタグだけの場合はすべて削除するか

### addPlaceholderRubyToKanji (移行済み)
- 漢字にプレースホルダルビタグを追加するか
- 非漢字文字は変更しないか
- タグ内のコンテンツを変更するか
- 既存のrubyタグを保持するか
- 複雑なコンテンツを正しく処理できるか
- 複数の既存rubyタグを持つ複雑なコンテンツを処理できるか
- 既存のrubyタグと漢字が混在する場合を処理できるか
- ネストされたタグの中の漢字を処理できるか
- 同じ漢字の異なるルビを保持するか
- 複数の異なるルビで同じ漢字が出現する場合を処理できるか

### addRubyTagsToMdx (移行済み)
- MDXテキスト内の漢字にプレースホルダルビタグを追加するか
- 既存のrubyタグを保持するか
- 全角スペースで始まる段落を処理できるか
- 引用符で囲まれたテキストを処理できるか
- 実際の本からの例を処理できるか

### removeLeadingFullWidthSpace (移行済み)
- 先頭の全角スペースを削除するか
- 複数の先頭全角スペースを削除するか
- 先頭に全角スペースがない場合は変更しないか
- テキスト中の全角スペースは削除しないか
- 空文字列を処理できるか
- nullやundefinedを処理できるか

### htmlToMdx 全角スペース処理 (部分的に移行)
- HTMLをMDXに変換して全角スペースを削除するか
- 全角スペースがないHTMLを処理できるか

### convertHtmlToMdxWithRuby (部分的に移行)
- ルビタグを有効にした場合にHTMLをMDXに変換するか
- ルビタグを無効にした場合にHTMLをMDXに変換するか
- 既存のルビタグを保持してプレースホルダルビタグを追加するか
- 複雑なルビタグと一緒にプレースホルダルビタグを処理できるか
- 常に先頭の全角スペースを削除するか
- ルビタグと全角スペースの削除の両方を処理できるか

### isJisageOrStyledDiv (移行済み)
- jisage_1クラスを持つdivに対してtrueを返すか
- jisage_10クラスを持つdivに対してtrueを返すか
- style属性を持つdivに対してtrueを返すか
- jisageクラスとstyle属性の両方を持つdivに対してtrueを返すか
- jisageクラスもstyle属性も持たないdivに対してfalseを返すか
- div以外のタグに対してfalseを返すか
- 空文字列に対してfalseを返すか
- 複雑な属性を持つdivで、jisageを含む場合にtrueを返すか
- 複雑なstyle属性を持つdivに対してtrueを返すか

## リファクタリング後のテストケース

### AozoraBunkoHtml
- **read**: HTMLからインスタンスを作成
- **extractBookMeta**: HTMLからメタデータを抽出
- **convertToBookContent**: HTMLからBookContentを生成、段落の処理、字下げdivの処理、ルビタグの処理

### RubyTags
- **extract**: BookContentからルビを抽出
- **addPlaceholderRubyToKanji**: 漢字にプレースホルダルビタグを追加
- **addRubyTagsWithPreservation**: 既存のルビマップに基づいて漢字にルビを追加

## 移行漏れや対応が必要なテストケース

1. **htmlToMdx**の多くの機能が**AozoraBunkoHtml.convertToBookContent**に部分的に移行されていますが、一部のHTML特殊処理（classNameへの変換など）のテストがカバーされていません。

2. **convertHtmlToMdxWithRuby**の機能がAozoraBunkoHtmlとRubyTagsの連携で実現されますが、明示的なテストケースがありません。

3. 複雑なrubyタグの簡素化テストが明示的にカバーされていません。

## 今後の対応

1. AozoraBunkoHtmlのconvertToBookContentメソッドに、より詳細なHTMLタグ処理のテストケースを追加する

2. AozoraBunkoHtmlとRubyTagsの連携をテストするインテグレーションテストを追加する

3. 複雑なrubyタグの簡素化に関する明示的なテストケースを追加する