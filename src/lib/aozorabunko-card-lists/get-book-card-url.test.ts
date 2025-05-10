import { parse } from "csv-parse/sync";
import * as fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAozoraBunkoCardUrl } from "./get-book-card-url";

// CSVデータのモック
const mockCsvData = `作品ID,作品名,図書カードURL
59835,赤ずきん,https://www.aozora.gr.jp/cards/001091/card59835.html
59521,オオカミと七ひきの子ヤギ,https://www.aozora.gr.jp/cards/001091/card59521.html
42308,白雪姫,https://www.aozora.gr.jp/cards/001091/card42308.html
`;

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("csv-parse/sync", () => ({
  parse: vi.fn(),
}));

describe("getAozoraBunkoCardUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // モックの設定
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(mockCsvData);
    (parse as any).mockReturnValue([
      {
        作品ID: "59835",
        作品名: "赤ずきん",
        図書カードURL: "https://www.aozora.gr.jp/cards/001091/card59835.html",
      },
      {
        作品ID: "59521",
        作品名: "オオカミと七ひきの子ヤギ",
        図書カードURL: "https://www.aozora.gr.jp/cards/001091/card59521.html",
      },
      {
        作品ID: "42308",
        作品名: "白雪姫",
        図書カードURL: "https://www.aozora.gr.jp/cards/001091/card42308.html",
      },
    ]);
  });

  it("存在するbookIdの図書カードURLを正しく取得する", () => {
    const url = getAozoraBunkoCardUrl("59835_72466");
    expect(url).toBe("https://www.aozora.gr.jp/cards/001091/card59835.html");
  });

  it("存在しないbookIdの場合は推測URLを返す", () => {
    const url = getAozoraBunkoCardUrl("99999_00000");
    expect(url).toBe("https://www.aozora.gr.jp/cards/000000/card99999.html");
  });

  it("不正なbookIdの場合でも推測URLを返す", () => {
    const url = getAozoraBunkoCardUrl("invalid_format");
    expect(url).toBe("https://www.aozora.gr.jp/cards/000000/cardinvalid.html");
  });

  it("CSVファイルが存在しない場合はフォールバックURLを返す", () => {
    (fs.existsSync as any).mockReturnValue(false);
    const url = getAozoraBunkoCardUrl("59835_72466");
    expect(url).toBe("https://www.aozora.gr.jp/cards/000000/card59835.html");
  });
});
