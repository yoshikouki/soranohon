# soranohon

soranohon は、青空文庫の児童文学を子どもに読みやすいように提供するサービスです。

## Docs

- [📝 要件定義](./docs/requirements.md) - プロジェクトの機能要件と技術要件

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
