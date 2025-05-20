import { describe, expect, it, vi } from "vitest";
import * as path from "path";
import { convertHtmlUrlToFilePath, getAozoraBunkoHtmlUrl } from "./get-aozora-bunko-html-url";
import * as getBookCardUrl from "./get-book-card-url";

describe("getAozoraBunkoHtmlUrl", () => {
  it("CSVファイルからHTMLファイルURLを取得する", () => {
    // モックデータを準備
    const mockRecords = [
      {
        作品ID: "59835",
        作品名: "赤ずきん",
        図書カードURL: "https://www.aozora.gr.jp/cards/001091/card59835.html",
        "XHTML/HTMLファイルURL": "https://www.aozora.gr.jp/cards/001091/files/59835_72466.html",
      },
    ];

    // loadCsvDataをモック化
    vi.spyOn(getBookCardUrl, "loadCsvData").mockReturnValue(mockRecords);

    // テスト対象の関数を実行
    const result = getAozoraBunkoHtmlUrl("59835_72466");

    // 期待される結果を検証
    expect(result).toBe("https://www.aozora.gr.jp/cards/001091/files/59835_72466.html");
  });

  it("先頭にゼロがある作品IDでもHTMLファイルURLを取得する", () => {
    // モックデータを準備
    const mockRecords = [
      {
        作品ID: "059835",
        作品名: "赤ずきん",
        図書カードURL: "https://www.aozora.gr.jp/cards/001091/card59835.html",
        "XHTML/HTMLファイルURL": "https://www.aozora.gr.jp/cards/001091/files/59835_72466.html",
      },
    ];

    // loadCsvDataをモック化
    vi.spyOn(getBookCardUrl, "loadCsvData").mockReturnValue(mockRecords);

    // テスト対象の関数を実行
    const result = getAozoraBunkoHtmlUrl("59835_72466");

    // 期待される結果を検証
    expect(result).toBe("https://www.aozora.gr.jp/cards/001091/files/59835_72466.html");
  });

  it("存在しない作品IDの場合はエラーをスローする", () => {
    // モックデータを準備（空の配列）
    vi.spyOn(getBookCardUrl, "loadCsvData").mockReturnValue([]);

    // エラーがスローされることを期待
    expect(() => getAozoraBunkoHtmlUrl("99999_99999")).toThrow();
  });

  it("不正なbookId形式の場合はエラーをスローする", () => {
    // 不正なbookId
    expect(() => getAozoraBunkoHtmlUrl("invalid-id")).toThrow();
  });
});

describe("convertHtmlUrlToFilePath", () => {
  it("URLからファイルパスに変換する", () => {
    const originalEnv = process.env.AOZORA_PATH;
    process.env.AOZORA_PATH = "/tmp/aozora";
    const url = "https://www.aozora.gr.jp/cards/001091/files/59835_72466.html";
    const expected = path.join(
      "/tmp/aozora",
      "cards",
      "001091",
      "files",
      "59835_72466.html",
    );

    expect(convertHtmlUrlToFilePath(url)).toBe(expected);
    process.env.AOZORA_PATH = originalEnv;
  });

  it("環境変数がない場合はデフォルトパスを使用する", () => {
    const originalEnv = process.env.AOZORA_PATH;
    delete process.env.AOZORA_PATH;
    const url = "https://www.aozora.gr.jp/cards/001091/files/59835_72466.html";
    const expected = path.join(
      "/Users/yoshikouki/src/github.com/aozorabunko/aozorabunko",
      "cards",
      "001091",
      "files",
      "59835_72466.html",
    );

    expect(convertHtmlUrlToFilePath(url)).toBe(expected);
    if (originalEnv !== undefined) {
      process.env.AOZORA_PATH = originalEnv;
    } else {
      delete process.env.AOZORA_PATH;
    }
  });

  it("青空文庫以外のURLの場合はエラーをスローする", () => {
    const url = "https://example.com/test.html";

    expect(() => convertHtmlUrlToFilePath(url)).toThrow();
  });

  it("不正なURL形式の場合はエラーをスローする", () => {
    const url = "not-a-url";

    expect(() => convertHtmlUrlToFilePath(url)).toThrow();
  });
});
