# 挿絵生成機能のリファクタリング計画

## 現状の課題

挿絵生成機能の現在の実装状況を調査した結果、以下の設計上の問題点が特定されました：

### 1. 依存性注入の一貫性のない使用

- リポジトリクラスはインターフェースを持ち、依存性注入のための構造は整っています
- しかし同時に、リポジトリクラスはシングルトンインスタンスとしてもエクスポートされています
- コンストラクタインジェクションとシングルトンパターンが混在しており、設計に一貫性がありません

```typescript
// シングルトンインスタンスの例（plan-repository.ts、mdx-repository.ts）
export const planRepository = new FilesystemPlanRepository();
export const mdxRepository = new FilesystemMdxRepository();
```

### 2. Server Actionレイヤーの依存関係の固定化

- Server Actionが直接サービスインスタンスを生成しており、依存関係が固定化されています
- これにより、テスト時に依存関係をモックするのが困難になっています

```typescript
// Server Actionの例（generate-illustration-plan.ts）
export async function generateIllustrationPlan(...) {
  const service = new IllustrationPlanService();
  return service.generatePlan(request);
}
```

### 3. 過剰なモックの使用

- インターフェースと依存性注入の仕組みがありながら、テストでは大量のモックに依存しています
- モジュールレベルのモック（`vi.mock`）を多用しており、テストが脆弱になっています

```typescript
// モジュールレベルのモックの例（generate-illustration-plan.test.ts）
vi.mock("../services/illustration-plan-service", () => ({
  IllustrationPlanService: vi.fn(),
}));
```

### 4. ファイルシステム依存の抽象化レベルの不一致

- `FileSystem`インターフェースは適切に抽象化されていますが、その使い方が一貫していません
- `defaultFileSystem`に依存するコードと、明示的に注入するコードが混在しています

## リファクタリングの目標

1. 依存性注入を一貫して使用する設計にすることで、単体テストの容易性を向上させる
2. モックの使用を最小限に抑え、より堅牢なテストを実現する
3. 依存関係を明示的に管理し、コードの保守性と拡張性を向上させる

## リファクタリング計画

### 1. DIコンテナの導入

現在の問題の根本的な解決策として、DIコンテナを導入します。これにより、依存関係の管理とサービスの取得が集中管理されます。

```typescript
// services/di-container.ts
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`Service not registered: ${key}`);
    }
    return this.services.get(key) as T;
  }

  // テスト用にコンテナをリセットするメソッド
  reset(): void {
    this.services.clear();
  }
}
```

### 2. インターフェースの整理

既存のインターフェースを活用しつつ、より一貫性のある形に整理します。

```typescript
// repository/interfaces.ts
export interface MdxRepository {
  getMdxContent(bookId: string): Promise<MdxContent | null>;
}

export interface PlanRepository {
  savePlan(bookId: string, plan: IllustrationPlan): Promise<boolean>;
  getPlan(bookId: string): Promise<IllustrationPlan | null>;
}

// services/interfaces.ts
export interface IllustrationPlanServiceInterface {
  generatePlan(request: IllustrationPlanRequest): Promise<{ plan: IllustrationPlan | null; message: string }>;
  loadPlan(bookId: string): Promise<{ plan: IllustrationPlan | null; message: string }>;
  savePlan(plan: IllustrationPlan): Promise<{ success: boolean; message: string }>;
}
```

### 3. サービスの依存性注入の改善

サービスクラスはすべての依存関係をコンストラクタで受け取るようにします。

```typescript
// services/illustration-plan-service.ts
export class IllustrationPlanService implements IllustrationPlanServiceInterface {
  constructor(
    private readonly mdxRepository: MdxRepository,
    private readonly planRepository: PlanRepository
  ) {}

  // ...メソッドの実装
}
```

### 4. アプリケーション初期化時にDIコンテナを設定

アプリケーション起動時にDIコンテナを初期化し、必要なサービスを登録します。

```typescript
// services/setup.ts
import { DIContainer } from "./di-container";
import { FilesystemMdxRepository } from "../repository/mdx-repository";
import { FilesystemPlanRepository } from "../repository/plan-repository";
import { IllustrationPlanService } from "./illustration-plan-service";
import { defaultFileSystem } from "@/lib/fs";

export function setupServices(): void {
  const container = DIContainer.getInstance();
  
  // FileSystem
  container.register("FileSystem", defaultFileSystem);
  
  // Repositories
  container.register(
    "MdxRepository", 
    new FilesystemMdxRepository(container.get("FileSystem"))
  );
  container.register(
    "PlanRepository", 
    new FilesystemPlanRepository(container.get("FileSystem"))
  );
  
  // Services
  container.register(
    "IllustrationPlanService", 
    new IllustrationPlanService(
      container.get("MdxRepository"),
      container.get("PlanRepository")
    )
  );
}
```

### 5. Server Actionの改善

Server Actionはサービスをコンテナから取得するように変更します。

```typescript
// actions/generate-illustration-plan.ts
"use server";

import { DIContainer } from "../services/di-container";
import { IllustrationPlanServiceInterface } from "../services/interfaces";
import { IllustrationPlan, IllustrationPlanRequest } from "../types/illustration-plan";

export async function generateIllustrationPlan(
  request: IllustrationPlanRequest
): Promise<{ plan: IllustrationPlan | null; message: string }> {
  const service = DIContainer.getInstance().get<IllustrationPlanServiceInterface>("IllustrationPlanService");
  return service.generatePlan(request);
}
```

### 6. テストの改善

テストでは、モジュールモックではなく、DIコンテナを利用してモックサービスを注入します。

```typescript
// actions/generate-illustration-plan.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DIContainer } from "../services/di-container";
import { IllustrationPlanServiceInterface } from "../services/interfaces";
import { generateIllustrationPlan } from "./generate-illustration-plan";

describe("generateIllustrationPlan", () => {
  let mockService: IllustrationPlanServiceInterface;
  
  beforeEach(() => {
    // テスト前にDIコンテナをリセット
    DIContainer.getInstance().reset();
    
    // モックサービスの作成
    mockService = {
      generatePlan: vi.fn(),
      loadPlan: vi.fn(),
      savePlan: vi.fn()
    };
    
    // DIコンテナにモックサービスを登録
    DIContainer.getInstance().register("IllustrationPlanService", mockService);
  });

  it("サービスを呼び出し、結果を返すこと", async () => {
    // 期待される結果
    const expectedResult = {
      plan: {
        bookId: "test_book",
        scenes: [/* ... */],
        createdAt: "2023-05-10T12:00:00Z",
      },
      message: "挿絵プランを生成し、保存しました。",
    };

    // モックの戻り値を設定
    vi.mocked(mockService.generatePlan).mockResolvedValue(expectedResult);

    // Server Actionを呼び出し
    const request = { bookId: "test_book", sceneCount: 1 };
    const result = await generateIllustrationPlan(request);

    // 検証
    expect(mockService.generatePlan).toHaveBeenCalledWith(request);
    expect(result).toEqual(expectedResult);
  });
});
```

## 実装手順

1. DIコンテナのクラスを作成する
2. インターフェースを整理・拡充する
3. リポジトリおよびサービスクラスを依存性注入を適切に利用するように修正する
4. DIコンテナの初期化と設定を行うコードを追加する
5. Server Actionを修正して、DIコンテナからサービスを取得するようにする
6. テストをDIコンテナを利用するように書き換える
7. シングルトンエクスポートを削除する

## 期待される効果

- 依存関係が明示的になり、コードの可読性と保守性が向上する
- テストが簡単になり、モックの使用が減少する
- コードの拡張性が向上し、新機能の追加がしやすくなる
- 依存関係の変更が一箇所（DIコンテナの設定）で完結するようになる

このリファクタリングにより、依存性注入のパターンが一貫して適用され、テストの信頼性が向上し、コードベースの全体的な品質が改善されます。