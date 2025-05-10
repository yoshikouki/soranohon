import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilesystemMdxRepository } from "../repository/mdx-repository";
import { FilesystemPlanRepository } from "../repository/plan-repository";
import { IllustrationPlan } from "../types/illustration-plan";
import { IllustrationPlanService } from "./illustration-plan-service";

// リポジトリのモック
vi.mock("../repository/mdx-repository", () => ({
  FilesystemMdxRepository: vi.fn(),
}));

vi.mock("../repository/plan-repository", () => ({
  FilesystemPlanRepository: vi.fn(),
}));

describe("IllustrationPlanService", () => {
  let service: IllustrationPlanService;
  let mockMdxRepository: any;
  let mockPlanRepository: any;
  let mockGetMdxContent: any;
  let mockGetPlan: any;
  let mockSavePlan: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // モックのセットアップ
    mockGetMdxContent = vi.fn();
    mockGetPlan = vi.fn();
    mockSavePlan = vi.fn();

    mockMdxRepository = {
      getMdxContent: mockGetMdxContent,
    };
    mockPlanRepository = {
      getPlan: mockGetPlan,
      savePlan: mockSavePlan,
    };

    vi.mocked(FilesystemMdxRepository).mockImplementation(() => mockMdxRepository);
    vi.mocked(FilesystemPlanRepository).mockImplementation(() => mockPlanRepository);

    service = new IllustrationPlanService(mockMdxRepository, mockPlanRepository);
  });

  describe("generatePlan", () => {
    it("MDXコンテンツが見つからない場合はエラーを返すこと", async () => {
      mockGetMdxContent.mockResolvedValue(null);

      const result = await service.generatePlan({ bookId: "test_book" });

      expect(result.plan).toBeNull();
      expect(result.message).toContain("MDXコンテンツが見つかりませんでした");
      expect(mockGetMdxContent).toHaveBeenCalledWith("test_book");
    });

    it("既存のプランがある場合はそれを返すこと", async () => {
      mockGetMdxContent.mockResolvedValue({ content: "mdx content" });

      const mockExistingPlan: IllustrationPlan = {
        bookId: "test_book",
        scenes: [
          {
            sceneId: "existing-scene-1",
            title: "既存シーン1",
            description: "既存の説明",
            mdxStart: 0,
            mdxEnd: 100,
          },
        ],
        createdAt: "2023-01-01T00:00:00Z",
      };

      mockGetPlan.mockResolvedValue(mockExistingPlan);

      const result = await service.generatePlan({ bookId: "test_book" });

      expect(result.plan).toEqual(mockExistingPlan);
      expect(result.message).toContain("既存の挿絵プラン");
      expect(mockGetPlan).toHaveBeenCalledWith("test_book");
      expect(mockSavePlan).not.toHaveBeenCalled();
    });

    it("新しいプランを生成して保存すること", async () => {
      mockGetMdxContent.mockResolvedValue({ content: "mdx content" });
      mockGetPlan.mockResolvedValue(null);
      mockSavePlan.mockResolvedValue(true);

      // Date.prototype.toISOStringをモック化
      const mockDate = new Date("2023-05-10T12:00:00Z");
      vi.spyOn(global, "Date").mockImplementation(() => mockDate);

      const result = await service.generatePlan({
        bookId: "test_book",
        sceneCount: 2,
      });

      expect(result.plan).toEqual({
        bookId: "test_book",
        scenes: [
          {
            sceneId: "scene-1",
            title: "シーン 1",
            description: "test_bookの挿絵シーン 1の説明",
            mdxStart: 0,
            mdxEnd: 99,
          },
          {
            sceneId: "scene-2",
            title: "シーン 2",
            description: "test_bookの挿絵シーン 2の説明",
            mdxStart: 100,
            mdxEnd: 199,
          },
        ],
        createdAt: mockDate.toISOString(),
      });
      expect(result.message).toContain("挿絵プランを生成し、保存しました");
      expect(mockGetPlan).toHaveBeenCalledWith("test_book");
      expect(mockSavePlan).toHaveBeenCalledWith("test_book", result.plan);
    });

    it("保存に失敗した場合は適切なメッセージを返すこと", async () => {
      mockGetMdxContent.mockResolvedValue({ content: "mdx content" });
      mockGetPlan.mockResolvedValue(null);
      mockSavePlan.mockResolvedValue(false);

      const result = await service.generatePlan({ bookId: "test_book" });

      expect(result.plan).not.toBeNull();
      expect(result.message).toContain("プランの生成に成功しましたが、保存に失敗しました");
      expect(mockSavePlan).toHaveBeenCalledWith("test_book", result.plan);
    });
  });

  describe("loadPlan", () => {
    it("プランが見つかった場合はそれを返すこと", async () => {
      const mockPlan: IllustrationPlan = {
        bookId: "test_book",
        scenes: [],
        createdAt: "2023-01-01T00:00:00Z",
      };
      mockGetPlan.mockResolvedValue(mockPlan);

      const result = await service.loadPlan("test_book");

      expect(result.plan).toEqual(mockPlan);
      expect(result.message).toContain("挿絵プランを読み込みました");
      expect(mockGetPlan).toHaveBeenCalledWith("test_book");
    });

    it("プランが見つからない場合はエラーを返すこと", async () => {
      mockGetPlan.mockResolvedValue(null);

      const result = await service.loadPlan("test_book");

      expect(result.plan).toBeNull();
      expect(result.message).toContain("挿絵プランが見つかりませんでした");
      expect(mockGetPlan).toHaveBeenCalledWith("test_book");
    });

    it("エラーが発生した場合は適切なメッセージを返すこと", async () => {
      mockGetPlan.mockRejectedValue(new Error("テストエラー"));

      const result = await service.loadPlan("test_book");

      expect(result.plan).toBeNull();
      expect(result.message).toContain("エラーが発生しました");
    });
  });

  describe("savePlan", () => {
    it("プランを保存できた場合は成功を返すこと", async () => {
      const mockPlan: IllustrationPlan = {
        bookId: "test_book",
        scenes: [],
        createdAt: "2023-01-01T00:00:00Z",
      };
      mockSavePlan.mockResolvedValue(true);

      const result = await service.savePlan(mockPlan);

      expect(result.success).toBe(true);
      expect(result.message).toContain("挿絵プランを保存しました");
      expect(mockSavePlan).toHaveBeenCalledWith("test_book", mockPlan);
    });

    it("保存に失敗した場合はエラーを返すこと", async () => {
      const mockPlan: IllustrationPlan = {
        bookId: "test_book",
        scenes: [],
        createdAt: "2023-01-01T00:00:00Z",
      };
      mockSavePlan.mockResolvedValue(false);

      const result = await service.savePlan(mockPlan);

      expect(result.success).toBe(false);
      expect(result.message).toContain("プランの保存に失敗しました");
      expect(mockSavePlan).toHaveBeenCalledWith("test_book", mockPlan);
    });

    it("エラーが発生した場合は適切なメッセージを返すこと", async () => {
      const mockPlan: IllustrationPlan = {
        bookId: "test_book",
        scenes: [],
        createdAt: "2023-01-01T00:00:00Z",
      };
      mockSavePlan.mockRejectedValue(new Error("テストエラー"));

      const result = await service.savePlan(mockPlan);

      expect(result.success).toBe(false);
      expect(result.message).toContain("エラーが発生しました");
    });
  });
});
