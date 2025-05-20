# soranohon

soranohon は、Next.js と TypeScript を使用して構築された、青空文庫の児童文学を子どもに読みやすいように提供するサービスです。
主な目的は、古典的な日本の児童文学へのアクセスを容易にし、若い読者にとって魅力的な読書体験を提供することです。

## 挿絵計画機能 (Illustration Planning Feature)

このプロジェクトの主要な機能の一つとして、物語から挿絵計画を自動的に生成する機能が含まれています。

### 使い方

```bash
# 特定のMDXファイルの挿絵計画を生成（ローカルツールを使用）
bun run illustration:plan src/books/42308_17916.mdx

# Claudeを使ってより詳細な挿絵計画を生成
bun run illustration:claude src/books/59835_72466.mdx
```

### 出力内容

生成される挿絵計画（`[ファイル名]-illustration-plan.json`）には以下の情報が含まれます：

1. **物語の概要** - 物語の簡潔な要約
2. **登場人物リスト** - 主要登場人物とその特徴
   - 外見的特徴
   - 性格特性
   - キャラクター設定用プロンプト案
3. **挿絵計画** - 各挿絵の詳細情報
   - シーンの説明
   - 行番号（MDXファイル内の位置）
   - 登場人物
   - 場所と雰囲気
   - 視覚的要素
   - 挿絵生成用プロンプト案

詳細については `./docs/requirements.md` を参照してください。

## Docs

- [📝 要件定義](./docs/requirements.md) - プロジェクトの機能要件と技術要件
- [📊 進捗管理](./docs/progress-tracking.md) - 開発進捗とタスクの管理
- [🗺️ ロードマップ](./docs/roadmap.md) - 今後の開発計画とビジョン

## Directory Structure

```
src/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout with providers and global components
│   ├── page.tsx           # Root page
│   └── [feature]/         # Feature-specific pages and routes (e.g., src/app/books/[bookId]/page.tsx)
│       ├── page.tsx       # Feature main page
│       └── [...]/         # Additional feature pages
├── components/            # Shared UI components (e.g., Button, Card) - currently empty or not heavily used
├── features/             # Feature-specific business logic and components
│   └── [feature]/         # Example: src/features/book-viewer/
│       ├── components/   # Feature-specific UI components (e.g., book-viewer/components/viewer-settings-menu.tsx)
│       ├── *.ts          # Feature-specific logic, types, hooks, or utilities (e.g., book-viewer/book-viewer.tsx, illustration-generator/prompts.ts)
│       └── [subfolder]/  # Other feature-specific subfolders (e.g., book-viewer/hooks/, illustration-generator/services/)
└── lib/                 # Shared utilities, configurations, and helper functions (e.g., fs.ts, logger.ts, utils.ts)
```

### Package by Feature

This project follows the "Package by Feature" approach rather than "Package by Layer". This means:

- Code is organized around business features rather than technical layers
- Each feature is self-contained with its own components, logic, and types
- Reduces coupling between features
- Makes the codebase more maintainable and scalable
- Easier to understand the business domain
- Facilitates parallel development

For example, instead of:
```
src/
├── components/    # All components
├── services/     # All services
└── utils/        # All utilities
```

We organize by feature:
```
src/features/
├── auth/              # Authentication feature
│   ├── components/    # Auth-specific UI components
│   ├── auth.ts       # Auth business logic
│   ├── types.ts      # Auth-specific types
│   └── utils.ts      # Auth-specific utilities
├── votes/            # Voting feature
│   ├── components/   # Vote-specific UI components
│   ├── votes.ts     # Vote business logic
│   └── types.ts     # Vote-specific types
└── collections/      # Collection management feature
```

And corresponding pages:
```
src/app/
├── auth/
│   ├── page.tsx     # Sign in page
│   ├── signup/      # Sign up flow
│   └── settings/    # Auth settings
├── votes/
│   ├── page.tsx     # Votes list
│   ├── [id]/        # Individual vote
│   └── create/      # Vote creation
└── collections/
```

### Directory Structure Conventions

1. **App Router (`src/app/`)**
   - Contains Next.js pages and layouts
   - Feature-specific pages and routes
   - Follows Next.js routing conventions
   - Each feature can have multiple pages and nested routes
   - 主な責務：
     - URLやリクエストパラメーターの検証
     - Cookieやヘッダーからのセッション読み取り
     - 認証・認可の確認（ログイン要求・リダイレクトなど）
     - 適切な feature のロジックの呼び出し
   - 具体的な実装：
     - Next.js のページコンポーネント
     - ミドルウェアやルートハンドラー
     - レイアウトコンポーネント
   - このレイヤーでは以下を行わない：
     - 複雑なビジネスロジック（features/ に置く）
     - UIコンポーネントの実装（components/ に置く）
     - データベースアクセス（features/ のロジック経由で行う）

2. **Shared Components (`src/components/`)**
   - Reusable UI components only
   - Should be feature-agnostic
   - Examples: Button, Card, Input, etc.

3. **Features (`src/features/`)**
   - Organized by feature/domain
   - Contains all feature-specific code
   - Feature-specific UI components are typically in a `components/` sub-directory.
   - Other feature-specific code (business logic, types, hooks, services, repositories, utilities etc.) might live directly in the feature directory (e.g., `feature-name.ts`) or be organized into further sub-directories like `hooks/`, `services/`, `utils/` depending on complexity.
   - Each feature is self-contained and can be moved/refactored easily

4. **Shared Libraries (`src/lib/`)**
   - Shared utilities, configurations, and types (e.g., `src/lib/fs.ts`, `src/lib/logger.ts`).
   - Helper functions used across features.
   - Does not currently contain database (`db/`) specific configurations as previously mentioned.

### File Naming Conventions

- React Components: kebab-case (e.g., `login-button.tsx`, `book-viewer.tsx`).
- Other files (including hooks): kebab-case (e.g., `use-viewer-settings.ts`, `fs.ts`).
- Next.js special files: as per Next.js conventions (e.g., `layout.tsx`, `page.tsx`, `route.ts`).

### Import Conventions

- Use absolute imports with `@/` prefix for non-relative imports
- Use relative imports for files within the same feature/module
- Keep import paths as short as possible while maintaining clarity
- Avoid using `index.ts` files for re-exporting within `src/features` and `src/components` to prevent potential circular dependency issues. Import directly from source files in these cases. Their use in other areas like `packages/` (e.g. `packages/aozorabunko/index.ts`) or for simple data aggregation might be acceptable.
- Avoid barrel exports to prevent circular dependency issues, especially within the `src/` directory.
