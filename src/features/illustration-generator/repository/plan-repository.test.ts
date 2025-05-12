import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileSystem } from "@/lib/fs";
import { IllustrationPlan } from "../types";
import { FilesystemPlanRepository } from "./plan-repository";

describe("FilesystemPlanRepository", () => {
  let repository: FilesystemPlanRepository;
  let mockPlan: IllustrationPlan;
  let mockFs: FileSystem;

  beforeEach(() => {
    // ファイルシステムのモック
    mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn().mockReturnValue(`# 挿絵プラン: test_book

作成日時: 2023-01-01T00:00:00Z

## テストシーン1

- **ID**: scene-1
- **説明**: テスト説明1
- **MDX範囲**: 0-99

## テストシーン2

- **ID**: scene-2
- **説明**: テスト説明2
- **MDX範囲**: 100-199`),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
      join: vi.fn((...args) => args.join("/")),
      dirname: vi.fn((path) => path.substring(0, path.lastIndexOf("/"))),
      getCwd: vi.fn(() => "/mock/cwd"),
    };

    repository = new FilesystemPlanRepository(mockFs);

    mockPlan = {
      bookId: "test_book",
      scenes: [
        {
          sceneId: "scene-1",
          title: "テストシーン1",
          description: "テスト説明1",
          mdxStart: 0,
          mdxEnd: 99,
        },
        {
          sceneId: "scene-2",
          title: "テストシーン2",
          description: "テスト説明2",
          mdxStart: 100,
          mdxEnd: 199,
        },
      ],
      rawPlan: "",
    };
  });

  describe("getPlan", () => {
    it("ファイルからプランを読み込めること", async () => {
      const result = await repository.getPlan(mockPlan.bookId);

      expect(result).not.toBeNull();
      expect(result?.bookId).toBe(mockPlan.bookId);
      expect(result?.scenes.length).toBeGreaterThan(0);
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it("ファイルが存在しない場合はnullを返すこと", async () => {
      mockFs.existsSync = vi.fn().mockReturnValueOnce(false);

      const result = await repository.getPlan("non_existent_book");

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it("エラーが発生した場合はnullを返すこと", async () => {
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error("Read error");
      });

      const result = await repository.getPlan(mockPlan.bookId);

      expect(result).toBeNull();
    });
  });
});
