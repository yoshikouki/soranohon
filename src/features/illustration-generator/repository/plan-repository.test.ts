import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileSystem } from "@/lib/fs";
import { IllustrationPlan } from "../types/illustration-plan";
import { FilesystemPlanRepository } from "./plan-repository";

// パスをモック
vi.mock("@/lib/file-paths", () => ({
  filePaths: {
    books: {
      sources: {
        plan: (bookId: string) => `/src/books/${bookId}.plan.md`,
      },
    },
  },
}));

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
      createdAt: "2023-01-01T00:00:00Z",
    };
  });

  describe("savePlan", () => {
    it("プランをファイルに保存できること", async () => {
      const result = await repository.savePlan(mockPlan.bookId, mockPlan);

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writeFileCalls = mockFs.writeFileSync.mock.calls[0];
      expect(writeFileCalls[1]).toEqual(expect.any(String));
      expect(writeFileCalls[2]).toBe("utf8");
    });

    it("ディレクトリが存在しない場合は作成すること", async () => {
      mockFs.existsSync = vi.fn().mockReturnValueOnce(false);

      const result = await repository.savePlan(mockPlan.bookId, mockPlan);

      expect(result).toBe(true);
      expect(mockFs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      const mkdirCalls = mockFs.mkdirSync.mock.calls[0];
      expect(mkdirCalls[1]).toEqual({ recursive: true });
    });

    it("エラーが発生した場合はfalseを返すこと", async () => {
      mockFs.writeFileSync = vi.fn().mockImplementation(() => {
        throw new Error("Write error");
      });

      const result = await repository.savePlan(mockPlan.bookId, mockPlan);

      expect(result).toBe(false);
    });
  });

  describe("getPlan", () => {
    it("ファイルからプランを読み込めること", async () => {
      const result = await repository.getPlan(mockPlan.bookId);

      expect(result).toEqual(mockPlan);
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
      expect(mockFs.readFileSync).toHaveBeenCalled();
      const readFileCalls = mockFs.readFileSync.mock.calls[0];
      expect(readFileCalls[1]).toBe("utf8");
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
