import { exec } from "child_process";
import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAozoraFilePaths,
  getEstimatedTextSizeFromHtml,
  getTextLength,
  getTextSizeFromZip,
} from "./text-length";

// モックのセットアップ
vi.mock("fs");
vi.mock("child_process");

describe("getAozoraFilePaths", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("正しいパスを生成すること", () => {
    // fs.existsSync のモック
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // fs.readdirSync のモック
    vi.mocked(fs.readdirSync).mockReturnValue([
      "15_ruby_904.zip",
      "15_14583.html",
      "16_ruby_905.zip",
      "other_file.txt",
    ] as unknown as fs.Dirent[]);

    const { zipPaths, htmlPaths } = getAozoraFilePaths("000879", "15");

    expect(zipPaths).toHaveLength(1);
    expect(zipPaths[0]).toContain("15_ruby_904.zip");

    expect(htmlPaths).toHaveLength(1);
    expect(htmlPaths[0]).toContain("15_14583.html");
  });

  it("ディレクトリが存在しない場合に空配列を返すこと", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const { zipPaths, htmlPaths } = getAozoraFilePaths("000879", "15");

    expect(zipPaths).toHaveLength(0);
    expect(htmlPaths).toHaveLength(0);
  });
});

describe("getTextSizeFromZip", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("ZIPファイルからテキストサイズを抽出すること", async () => {
    const mockOutput = `
Archive:  /path/to/file.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
    18565  02-08-2004 15:58   content.txt
---------                     -------
    18565                     1 file
`;

    // execAsync のモック
    vi.mocked(exec).mockImplementation(() => {
      return Promise.resolve({
        stdout: mockOutput,
        stderr: "",
      }) as unknown as ReturnType<typeof exec>;
    });

    const size = await getTextSizeFromZip("/path/to/file.zip");
    expect(size).toBe(18565);
  });
});

describe("getEstimatedTextSizeFromHtml", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("HTMLファイルからテキストサイズを推定すること", () => {
    const mockHtml = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<h1>タイトル</h1>
<p>これは&nbsp;テスト文章です。</p>
<div>
  改行を含む
  テキスト
</div>
</body>
</html>
`;

    vi.mocked(fs.readFileSync).mockReturnValue(mockHtml);

    const size = getEstimatedTextSizeFromHtml("/path/to/file.html");
    expect(size).toBeDefined();
    expect(typeof size).toBe("number");
  });
});

describe("getTextLength", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("ZIPファイルが存在する場合はZIPからテキストサイズを取得すること", async () => {
    // getAozoraFilePaths のモック
    vi.mock("./text-length", async () => {
      const actual = await vi.importActual("./text-length");
      return {
        ...(actual as object),
        getAozoraFilePaths: vi.fn().mockReturnValue({
          zipPaths: ["/path/to/file_ruby.zip"],
          htmlPaths: ["/path/to/file.html"],
        }),
        getTextSizeFromZip: vi.fn().mockResolvedValue(18565),
      };
    });

    const book = {
      id: "15",
      authorId: "000879",
    };

    const textLength = await getTextLength(book);
    expect(textLength).toBe(18565);
  });

  it("ZIPファイルが存在しない場合はHTMLからサイズを推定すること", async () => {
    // getAozoraFilePaths のモック
    vi.mock("./text-length", async () => {
      const actual = await vi.importActual("./text-length");
      return {
        ...(actual as object),
        getAozoraFilePaths: vi.fn().mockReturnValue({
          zipPaths: [],
          htmlPaths: ["/path/to/file.html"],
        }),
        getEstimatedTextSizeFromHtml: vi.fn().mockReturnValue(10000),
      };
    });

    const book = {
      id: "15",
      authorId: "000879",
    };

    const textLength = await getTextLength(book);
    expect(textLength).toBe(10000);
  });

  it("ファイルが存在しない場合はundefinedを返すこと", async () => {
    // getAozoraFilePaths のモック
    vi.mock("./text-length", async () => {
      const actual = await vi.importActual("./text-length");
      return {
        ...(actual as object),
        getAozoraFilePaths: vi.fn().mockReturnValue({
          zipPaths: [],
          htmlPaths: [],
        }),
      };
    });

    const book = {
      id: "15",
      authorId: "000879",
    };

    const textLength = await getTextLength(book);
    expect(textLength).toBeUndefined();
  });
});
