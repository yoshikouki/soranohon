# `./bin/html2mdx.ts` の責務

## 全体の流れ

青空文庫のHTML形式のファイルをMDX形式に変換し、本の内容と書誌情報を扱うためのツール。

1. コマンドライン引数を解析
2. 入力パスの処理（URL or ローカルファイル）
3. HTMLファイルの読み込みと文字コード変換
4. 本の内容をパース（AozoraBunkoHtmlクラス）
5. ルビタグの処理（RubyTagsクラス）
6. MDX形式に変換して保存
7. 書誌情報の抽出と表示

## モジュール別の責務

* `./bin/html2mdx.ts`
  * コマンドライン引数のパース（parseCommandLineArgs）
  * 入力パスの処理（processInputPath）
  * 入力パスがURLの場合、ローカルファイルに変換（convertUrlToFilePath）
  * HTML処理のワークフロー制御（processHtmlFile）
  * 本のエントリー情報生成（generateBookEntry）
  * エラーハンドリングと終了コード設定

* `@/features/book-content/core`
  * BookContentクラス：本の内容を表現するモデル
  * パラグラフの追加と管理
  * MDX形式への変換（toMdx）
  * タグなしの純粋なテキスト取得（toStringWithoutTags）
  * ファイルからの読み込み（readFile, readFileByBookId）

* `@/lib/aozorabunko/aozora-bunko-html`
  * AozoraBunkoHtmlクラス：青空文庫HTML解析の主要クラス
  * HTMLからの本文テキスト抽出（extractMainText）
  * 行・段落の構造化（extractLines, formParagraphs）
  * BookContentへの変換（convertToBookContent）
  * 書誌情報の抽出（extractBookMeta）
  * 組版情報の処理（字下げ、ruby要素など）

* `@/lib/aozorabunko/encoding`
  * 文字コードの検出と変換（detectAndDecode）
  * ShiftJISからUTF-8などへの変換
  * エンコーディング検出失敗時のエラーハンドリング

* `@/lib/aozorabunko/path`
  * 入力HTMLパスからMDX出力パスの生成（getMdxOutputPath）
  * パスの正規化と拡張子の処理

* `@/lib/aozorabunko/ruby-tags`
  * RubyTagsクラス：ルビタグの処理を担当
  * 既存のルビタグの抽出と管理（extract）
  * 漢字へのプレースホルダールビの追加（addPlaceholderRubyToKanji）
  * 既存ルビを保持しながらの新規ルビ追加（addRubyTagsWithPreservation）
  * ルビマップの管理（単一・複合漢字両方に対応）

* `@/lib/aozorabunko-card-lists/get-book-card-url`
  * 本のIDから青空文庫の図書カードURLを取得（getAozoraBunkoCardUrl）
  * CSVデータからの情報ロード（loadCsvData）
  * IDの正規化と検索（先頭ゼロの有無に対応）
  * エラーハンドリングとロギング

* `@/lib/fs`
  * ファイルシステム操作の抽象化インターフェース（FileSystem）
  * ファイル読み書き、ディレクトリ作成などの操作
  * デフォルト実装の提供（defaultFileSystem）
  * パス操作のユーティリティメソッド提供

* `@/lib/logger`
  * ログ出力の抽象化インターフェース（Logger）
  * エラーと情報の出力メソッド
  * コンソールベースのデフォルト実装（defaultLogger）
