import { describe, expect, it } from "vitest";
import {
  AozoraRecord,
  CsvParser,
  FileSystem,
  getAozoraBunkoCardUrl,
  Logger,
} from "./get-book-card-url";

describe("getAozoraBunkoCardUrl", () => {
  // モックデータ
  const mockRecords: AozoraRecord[] = [
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
  ];

  // モックの実装
  const createMockFileSystem = (exists = true): FileSystem => ({
    existsSync: () => exists,
    readFileSync: () => "mock csv data",
  });

  const createMockCsvParser = (customRecords?: AozoraRecord[]): CsvParser => ({
    parse: () => (customRecords ? [...customRecords] : [...mockRecords]),
  });

  // ログをキャプチャするモック
  const createMockLogger = (): [Logger, string[]] => {
    const messages: string[] = [];
    const logger: Logger = {
      error: (message: string) => {
        messages.push(message);
      },
    };
    return [logger, messages];
  };

  it("存在するbookIdの図書カードURLを正しく取得する", () => {
    const mockFs = createMockFileSystem();
    const mockCsvParser = createMockCsvParser();
    const [mockLogger] = createMockLogger();

    const url = getAozoraBunkoCardUrl("59835_72466", mockFs, mockCsvParser, mockLogger);
    expect(url).toBe("https://www.aozora.gr.jp/cards/001091/card59835.html");
  });

  it("存在しないbookIdの場合はエラーをスローする", () => {
    const mockFs = createMockFileSystem();
    const mockCsvParser = createMockCsvParser();
    const [mockLogger] = createMockLogger();

    expect(() =>
      getAozoraBunkoCardUrl("99999_00000", mockFs, mockCsvParser, mockLogger),
    ).toThrow("bookId が図書リストから見つかりません: 99999_00000");
  });

  it("不正なbookIdの場合はエラーをスローする", () => {
    const mockFs = createMockFileSystem();
    const mockCsvParser = createMockCsvParser();
    const [mockLogger] = createMockLogger();

    expect(() => getAozoraBunkoCardUrl("", mockFs, mockCsvParser, mockLogger)).toThrow(
      "不正なbookId形式です: ",
    );
  });

  it("CSVファイルが存在しない場合はエラーをスローする", () => {
    const mockFs = createMockFileSystem(false);
    const mockCsvParser = createMockCsvParser([]); // 空のレコード
    const [mockLogger, _messages] = createMockLogger();

    expect(() =>
      getAozoraBunkoCardUrl("59835_72466", mockFs, mockCsvParser, mockLogger),
    ).toThrow("bookId が図書リストから見つかりません: 59835_72466");
  });
});
