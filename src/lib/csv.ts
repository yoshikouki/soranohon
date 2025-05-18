import { parse } from "csv-parse/sync";

export interface CsvParser {
  parse<T = unknown>(input: string, options: Record<string, unknown>): T[];
}

export const defaultCsvParser: CsvParser = {
  parse: <T = unknown>(input: string, options: Record<string, unknown>) =>
    parse(input, options) as T[],
};
