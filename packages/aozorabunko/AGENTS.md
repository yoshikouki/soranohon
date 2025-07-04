# packages/aozorabunko 設計指針

## 背景と課題
- `bin/html2mdx.ts` に変換ロジック、CLI、ファイルI/O、ロギングなどが混在し、肥大化している
- `packages/aozorabunko` モジュール内部でも関心分離が不十分で、バグ修正や機能追加のコストが高い
- 正規表現や DOM API の直叩き実装が多く、ユニットテストが困難である

## 目的
- 各責務をレイヤー／モジュールごとに明確化し、可読性・保守性を向上させる
- 純粋関数／AST ベースの変換パイプラインを採用し、ユニットテストを容易にする
- ファイルI/O、CLI、Logger などの副作用を分離し、DI（依存性注入）可能にする
- ルビやタグ処理など変換ルールをプラグイン化・設定化し、拡張性を担保する

## アーキテクチャ概要
レイヤードアーキテクチャとパイプライン構造を組み合わせ、以下の責務分割を行う:

- **CLI レイヤ**
  - コマンドライン引数解析、ヘルプ表示
- **Orchestrator レイヤ**
  - パイプライン全体の制御、依存性注入、エラーハンドリング、ロギング
- **パーサ／AST レイヤ**
  - `unified`/`rehype-parse` を使った HTML → AST の構築
  - 文字エンコーディング検出・デコード
- **エクストラクタ レイヤ**
  - メタデータ（書誌情報）の抽出
- **トランスフォーメーション レイヤ**
  - ルビ処理、見出し変換、不要要素削除など AST 操作を純粋関数で実装
- **レンダリング レイヤ**
  - AST → MDX 文字列生成（`remark`/`remark-stringify` 等）
- **インフラストラクチャ**
  - ファイルシステム、パス操作、Logger、HTTP クライアントなど副作用処理

### 想定ディレクトリ構成
```
packages/aozorabunko/
├── AGENTS.md           # 本設計ドキュメント
├── src/
│   ├── cli.ts          # エントリポイント (bin/html2mdx.ts 相当)
│   ├── orchestrator.ts # パイプライン制御
│   ├── parser/
│   │   ├── html.ts     # HTML → AST
│   │   └── encoding.ts # 文字エンコーディング変換
│   ├── extractor/
│   │   └── metadata.ts # 書誌情報抽出
  │   ├── transformer/
  │   │   ├── ruby.ts     # ルビ処理等 AST 操作
  │   │   ├── headings.ts # 見出し変換など
  │   │   └── links.ts    # リンク変換（URL→MDX出力パス）
│   ├── renderer/
│   │   └── mdx.ts      # MDX 生成
│   ├── utils/
│   │   └── path.ts     # パス変換や URL → ファイルパス変換
│   └── types.ts        # ドメインモデル定義
└── test/
    ├── unit/           # ユニットテスト
    └── integration/    # 統合テスト・fixture
```

## テスト戦略
- AST 操作や純粋関数にはユニットテストを重点的に実装
- CLI／I/O 周りは統合テストやシナリオテストで振る舞い検証
- テスト用 fixture を `test/fixture/` に配置し、比較ベースのテストを行う
- CI で自動実行し、テストカバレッジの維持を図る

## マイグレーション方針
1. 現行ロジックを逐次新モジュールに切り出し、既存テストを流用
2. ユニットテストが通ることを確認しつつリファクタリング
3. `bin/html2mdx.ts` を `src/cli.ts` に置き換え、古いスクリプトは非推奨化
4. ドキュメント／README を更新し、新アーキテクチャを周知

## 今後のステップ
1. パイプライン設計に沿ってリポジトリ構造を再編
2. 各レイヤーのスケルトン実装とテスト骨組みを作成
3. 機能単位で段階的に既存コードを移行・置き換え
4. 最終的に旧コードを削除し、統合テストを実行して品質を担保