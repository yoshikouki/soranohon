import * as fs from "fs";
import * as path from "path";

// ファイルシステム操作の抽象化
export interface FileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: BufferEncoding): string;
  writeFileSync(path: string, data: string, encoding?: BufferEncoding): void;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  join(...paths: string[]): string;
  dirname(path: string): string;
  getCwd(): string;
}

// デフォルトのファイルシステム実装
export const defaultFileSystem: FileSystem = {
  existsSync: (filePath: string) => fs.existsSync(filePath),
  readFileSync: (filePath: string, encoding: BufferEncoding) =>
    fs.readFileSync(filePath, { encoding }),
  writeFileSync: (filePath: string, data: string, encoding: BufferEncoding = "utf-8") =>
    fs.writeFileSync(filePath, data, { encoding }),
  mkdirSync: (filePath: string, options?: { recursive?: boolean }) =>
    fs.mkdirSync(filePath, options),
  join: (...paths: string[]) => path.join(...paths),
  dirname: (filePath: string) => path.dirname(filePath),
  getCwd: () => process.cwd(),
};
