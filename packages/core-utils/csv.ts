import { parse } from "csv-parse/sync";

// CSVパーサーの抽象化
export interface CsvParser {
  parse<T = unknown>(input: string, options: Record<string, unknown>): T[];
}

// デフォルトのCSVパーサー実装
export const defaultCsvParser: CsvParser = {
  parse: <T = unknown>(input: string, options: Record<string, unknown>) =>
    parse(input, options) as T[],
};
