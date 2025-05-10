import { beforeEach, describe, expect, it, vi } from "vitest";
import { IllustrationPlanService } from "../services/illustration-plan-service";
import { generateIllustrationPlan } from "./generate-illustration-plan";

// Serviceのモック
vi.mock("../services/illustration-plan-service", () => ({
  IllustrationPlanService: vi.fn(),
}));

describe("generateIllustrationPlan", () => {
  const mockGeneratePlan = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(IllustrationPlanService).mockImplementation(() => ({
      generatePlan: mockGeneratePlan,
      loadPlan: vi.fn(),
      savePlan: vi.fn(),
    }));
  });

  it("Serviceを呼び出し、結果を返すこと", async () => {
    // 期待される結果
    const expectedResult = {
      plan: {
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
      },
      message: "挿絵プランを生成し、保存しました。",
    };

    // モックの戻り値を設定
    mockGeneratePlan.mockResolvedValue(expectedResult);

    // Server Actionを呼び出し
    const request = { bookId: "test_book", sceneCount: 1 };
    const result = await generateIllustrationPlan(request);

    // 検証
    expect(mockGeneratePlan).toHaveBeenCalledWith(request);
    expect(result).toEqual(expectedResult);
  });

  it("エラー時も適切に結果を返すこと", async () => {
    // エラー結果
    const errorResult = {
      plan: null,
      message: "エラーが発生しました",
    };

    // モックの戻り値を設定
    mockGeneratePlan.mockResolvedValue(errorResult);

    // Server Actionを呼び出し
    const result = await generateIllustrationPlan({ bookId: "non_existent_book" });

    // 検証
    expect(mockGeneratePlan).toHaveBeenCalledWith({ bookId: "non_existent_book" });
    expect(result).toEqual(errorResult);
  });
});
