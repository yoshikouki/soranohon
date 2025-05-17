# プロジェクト進捗管理

## 最終更新日: 2025-01-17

## 現在の開発状況

### 進行中の作業

- **キャラクターデザイン生成機能** (7783d6a)
  - 現在、以下のファイルが編集中:
    - `src/app/api/illustrations/character-design/route.ts`
    - `src/app/books/[bookId]/edit/page.tsx`
    - `src/features/illustration-generator/components/character-design-generator.tsx`
  - AIを使用したキャラクターデザイン生成機能の実装中

### 最近の実装

1. **キャラクターデザイン生成機能を追加** (7783d6a)
   - 基本的な生成機能の実装完了

2. **next/imageのキャッシュを無効化** (0afd420)
   - 最新画像を表示するための修正完了

3. **画像生成時に画像を参照** (37901e3)
   - 画像生成プロセスの改善

## 技術的な注意事項

### コーディング原則（CLAUDE.mdより）

1. **イミュータブルデータ構造の使用**
2. **副作用の分離**
3. **型安全性の確保**
4. **開発した機能ごとに git commit すること**
5. **`try-catch` は使用を禁止する** (NEVER USE `try-catch`)
6. **コメントを書かない** (NEVER WRITE `// comments`)

### TDD (Test-Driven Development)

- Red-Green-Refactorサイクル
- テストを仕様書として扱う
- 小さな単位での反復
- 継続的なリファクタリング

## 未コミット変更

- `CLAUDE.md` - プロジェクト原則の更新（以下を追加）
  - 開発した機能ごとに git commit すること
  - `try-catch` は使用を禁止する。NEVER USE `try-catch`
  - コメントを書かない。コメントがなくとも意図が分かる命名や設計が一流。NEVER WRITE `// comments`
- `docs/progress-tracking.md` - プロジェクト進捗管理ドキュメント（新規作成）

## 次のアクション

1. 現在編集中のファイルをコミット
2. キャラクターデザイン生成機能のテストを作成
3. lintとtypecheckの実行
4. 機能が完全に動作することを確認

## CI/CD

- GitHub ActionsでCIが設定済み (1982454)
- lint:nextがCIから削除済み (144ff98)