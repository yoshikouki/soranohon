# soranohon

soranohon は、青空文庫の児童文学を子どもに読みやすいように提供するサービスです。

## 挿絵計画機能

このプロジェクトには、物語から挿絵計画を自動的に生成する機能が含まれています。

### 使い方

```bash
# 特定のMDXファイルの挿絵計画を生成（ローカルツールを使用）
bun run illustration:plan src/books/42308_17916.mdx

# Claudeを使ってより詳細な挿絵計画を生成
bun run illustration:claude src/books/59835_72466.mdx
```

### 出力内容

生成される挿絵計画（`[ファイル名]-illustration-plan.md`）には以下の情報が含まれます：

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

詳細については `/src/tools/illustration-automation/README.md` を参照してください。

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
│   ├── main-navigation.tsx # App-specific navigation component
│   └── [feature]/         # Feature-specific pages and routes
│       ├── page.tsx       # Feature main page
│       └── [...]/         # Additional feature pages
├── components/            # Shared UI components (e.g., Button, Card)
├── features/             # Feature-specific business logic and components
│   └── [feature]/
│       ├── components/   # Feature-specific UI components
│       └── *.ts         # Feature-specific business logic, types, and utilities
└── lib/                 # Shared utilities and configurations
    ├── db/             # Database configuration and schema
    └── utils.ts        # Shared utility functions
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
   - Only UI components are separated into a `components/` directory
   - Other feature-specific code (business logic, types, utilities) lives directly in the feature directory
   - Each feature is self-contained and can be moved/refactored easily

4. **Shared Libraries (`src/lib/`)**
   - Shared utilities, configurations, and types
   - Database and external service configurations
   - Helper functions used across features

### File Naming Conventions

- React Components: kebab-case (e.g., `login-button.tsx`)
- Other files: kebab-case (e.g., `main-navigation.tsx`, `use-auth.ts`)
- Next.js special files: as per Next.js conventions (e.g., `layout.tsx`, `page.tsx`)

### Import Conventions

- Use absolute imports with `@/` prefix for non-relative imports
- Use relative imports for files within the same feature/module
- Keep import paths as short as possible while maintaining clarity
- **NEVER use index.ts** files for re-exporting - import directly from the source files
- Avoid barrel exports to prevent circular dependency issues
