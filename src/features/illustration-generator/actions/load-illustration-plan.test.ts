import { beforeEach, describe, expect, it, vi } from "vitest";
import { IllustrationPlanService } from "../services/illustration-plan-service";
import { IllustrationPlan } from "../types/illustration-plan";
import { loadIllustrationPlan } from "./load-illustration-plan";

// Serviceのモック
vi.mock("../services/illustration-plan-service", () => ({
  IllustrationPlanService: vi.fn(),
}));

describe("loadIllustrationPlan", () => {
  const mockLoadPlan = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(IllustrationPlanService).mockImplementation(() => ({
      generatePlan: vi.fn(),
      loadPlan: mockLoadPlan,
      savePlan: vi.fn(),
    }));
  });

  it("Serviceを呼び出し、結果を返すこと", async () => {
    // 期待される結果
    const mockPlan: IllustrationPlan = {
      bookId: "test_book",
      scenes: [
        {
          sceneId: "scene-1",
          title: "シーン 1",
          description: "テスト説明",
          mdxStart: 0,
          mdxEnd: 99,
        },
      ],
      createdAt: "2023-05-10T12:00:00Z",
    };

    const expectedResult = {
      plan: mockPlan,
      message: "挿絵プランを読み込みました: test_book",
    };

    // モックの戻り値を設定
    mockLoadPlan.mockResolvedValue(expectedResult);

    // Server Actionを呼び出し
    const result = await loadIllustrationPlan("test_book");

    // 検証
    expect(mockLoadPlan).toHaveBeenCalledWith("test_book");
    expect(result).toEqual(expectedResult);
  });

  it("エラー時も適切に結果を返すこと", async () => {
    // エラー結果
    const errorResult = {
      plan: null,
      message: "挿絵プランが見つかりませんでした: non_existent_book",
    };

    // モックの戻り値を設定
    mockLoadPlan.mockResolvedValue(errorResult);

    // Server Actionを呼び出し
    const result = await loadIllustrationPlan("non_existent_book");

    // 検証
    expect(mockLoadPlan).toHaveBeenCalledWith("non_existent_book");
    expect(result).toEqual(errorResult);
  });
});
