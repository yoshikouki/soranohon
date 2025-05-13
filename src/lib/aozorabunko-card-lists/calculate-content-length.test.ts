import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../logger";
import { getContentLength } from "./calculate-content-length";

// readFileSyncAsUtf8のモック関数
const mockReadFileSyncAsUtf8 = vi.fn();

describe("getContentLength", () => {
  // テスト用HTMLコンテンツ
  const validHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>テスト用HTMLファイル</title>
</head>
<body>
  <div class="main_text">
    <p>これはテスト用の<ruby><rb>本文</rb><rp>（</rp><rt>ほんぶん</rt><rp>）</rp></ruby>です。</p>
    <p>この<ruby><rb>文章</rb><rp>（</rp><rt>ぶんしょう</rt><rp>）</rp></ruby>は<ruby><rb>青空文庫</rb><rp>（</rp><rt>あおぞらぶんこ</rt><rp>）</rp></ruby>の形式に<ruby><rb>似</rb><rp>（</rp><rt>に</rt><rp>）</rp></ruby>せています。</p>
    <p>
      <br>
      改行や空白も含まれています。
      <br>
    </p>
    <p>文字数は空白や改行を除いて計算されるはずです。</p>
  </div>
</body>
</html>`;

  const noMainTextHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>main_textクラスがないテストファイル</title>
</head>
<body>
  <div class="content">
    <p>これは.main_textクラスがないテスト用の文章です。</p>
    <p>getContentLength関数はこのファイルから文字数を抽出できないはずです。</p>
  </div>
</body>
</html>`;

  // コンソール出力のモック
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFileSyncAsUtf8.mockClear();
    vi.spyOn(logger, "warn").mockImplementation(() => {});
    vi.spyOn(logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("HTMLファイルから正しく文字数を計算する", () => {
    mockReadFileSyncAsUtf8.mockReturnValueOnce(validHtmlContent);

    const length = getContentLength("/path/to/valid.html", mockReadFileSyncAsUtf8);

    // テストファイルのルビを除外した文字数
    expect(length).toBe(70);
    expect(mockReadFileSyncAsUtf8).toHaveBeenCalledWith("/path/to/valid.html");
  });

  it("main_textクラスがない場合は0を返す", () => {
    mockReadFileSyncAsUtf8.mockReturnValueOnce(noMainTextHtmlContent);

    const length = getContentLength("/path/to/no-main-text.html", mockReadFileSyncAsUtf8);

    expect(length).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("本文要素 (.main_text) が見つかりません"),
    );
    expect(mockReadFileSyncAsUtf8).toHaveBeenCalledWith("/path/to/no-main-text.html");
  });

  it("存在しないファイルパスの場合はエラーをログ出力して0を返す", () => {
    mockReadFileSyncAsUtf8.mockImplementationOnce(() => {
      throw new Error("ENOENT: no such file or directory");
    });

    const length = getContentLength("/path/to/non-existent-file.html", mockReadFileSyncAsUtf8);

    expect(length).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("文字数計算中にエラーが発生しました"),
      expect.anything(),
    );
    expect(mockReadFileSyncAsUtf8).toHaveBeenCalledWith("/path/to/non-existent-file.html");
  });

  it("HTMLファイルの内容が空の場合はパースエラーとなり0を返す", () => {
    // パースエラーをシミュレートするためにmockを実装
    mockReadFileSyncAsUtf8.mockImplementationOnce(() => {
      throw new Error("Parse Error: empty HTML");
    });

    const length = getContentLength("/path/to/empty.html", mockReadFileSyncAsUtf8);

    expect(length).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("文字数計算中にエラーが発生しました"),
      expect.anything(),
    );
    expect(mockReadFileSyncAsUtf8).toHaveBeenCalledWith("/path/to/empty.html");
  });
});
