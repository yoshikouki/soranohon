import { beforeEach, describe, expect, it, vi } from "vitest";
import { IllustrationPlanService } from "../services/illustration-plan-service";
import { IllustrationPlan } from "../types/illustration-plan";
import { saveIllustrationPlan } from "./save-illustration-plan";

// Serviceのモック
vi.mock("../services/illustration-plan-service", () => ({
  IllustrationPlanService: vi.fn(),
}));

describe("saveIllustrationPlan", () => {
  const mockSavePlan = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(IllustrationPlanService).mockImplementation(() => ({
      generatePlan: vi.fn(),
      loadPlan: vi.fn(),
      savePlan: mockSavePlan,
    }));
  });

  it("Serviceを呼び出し、結果を返すこと", async () => {
    // テスト用プラン
    const testPlan: IllustrationPlan = {
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

    // 期待される結果
    const expectedResult = {
      success: true,
      message: "挿絵プランを保存しました: test_book",
    };

    // モックの戻り値を設定
    mockSavePlan.mockResolvedValue(expectedResult);

    // Server Actionを呼び出し
    const result = await saveIllustrationPlan(testPlan);

    // 検証
    expect(mockSavePlan).toHaveBeenCalledWith(testPlan);
    expect(result).toEqual(expectedResult);
  });

  it("エラー時も適切に結果を返すこと", async () => {
    // テスト用プラン
    const testPlan: IllustrationPlan = {
      bookId: "test_book",
      scenes: [],
      createdAt: "2023-05-10T12:00:00Z",
    };

    // エラー結果
    const errorResult = {
      success: false,
      message: "プランの保存に失敗しました: test_book",
    };

    // モックの戻り値を設定
    mockSavePlan.mockResolvedValue(errorResult);

    // Server Actionを呼び出し
    const result = await saveIllustrationPlan(testPlan);

    // 検証
    expect(mockSavePlan).toHaveBeenCalledWith(testPlan);
    expect(result).toEqual(errorResult);
  });
});
