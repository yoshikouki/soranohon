import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileSystem } from "@/lib/fs";
import { FilesystemMdxRepository } from "./mdx-repository";

// パスとbooksをモック
vi.mock("@/books", () => ({
  books: {
    test_book: { mdx: true },
    invalid_book: { mdx: false },
  },
}));

vi.mock("@/lib/file-paths", () => ({
  filePaths: {
    books: {
      sources: {
        mdx: (bookId: string) => `/src/books/${bookId}.mdx`,
      },
    },
  },
}));

describe("FilesystemMdxRepository", () => {
  let repository: FilesystemMdxRepository;
  let mockFs: FileSystem;

  beforeEach(() => {
    // ファイルシステムのモック
    mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi
        .fn()
        .mockReturnValue("# MDXコンテンツ\n\nこれはテスト用のMDXコンテンツです。"),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
      join: vi.fn((...args) => args.join("/")),
      dirname: vi.fn((path) => path.substring(0, path.lastIndexOf("/"))),
      getCwd: vi.fn(() => "/mock/cwd"),
    };

    repository = new FilesystemMdxRepository(mockFs);
  });

  describe("getMdxContent", () => {
    it("有効なBookIDでMDXコンテンツを取得できること", async () => {
      const result = await repository.getMdxContent("test_book");

      expect(result).not.toBeNull();
      expect(result?.content).toBe("# MDXコンテンツ\n\nこれはテスト用のMDXコンテンツです。");
      expect(mockFs.join).toHaveBeenCalled();
      const joinCalls = mockFs.join.mock.calls[0];
      expect(joinCalls[0]).toBe("/mock/cwd");
      expect(mockFs.readFileSync).toHaveBeenCalled();
      const readFileCalls = mockFs.readFileSync.mock.calls[0];
      expect(readFileCalls[1]).toBe("utf8");
    });

    it("無効なBook IDの場合はnullを返すこと", async () => {
      const result = await repository.getMdxContent("invalid_book");

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it("ファイルが存在しない場合はnullを返すこと", async () => {
      mockFs.existsSync = vi.fn().mockReturnValueOnce(false);

      const result = await repository.getMdxContent("test_book");

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it("エラーが発生した場合はnullを返すこと", async () => {
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error("Read error");
      });

      const result = await repository.getMdxContent("test_book");

      expect(result).toBeNull();
    });
  });
});
