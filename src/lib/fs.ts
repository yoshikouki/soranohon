import * as fs from "fs";
import path from "path";

// ファイルシステム操作の抽象化
export interface FileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: string): string;
  writeFileSync(path: string, data: string, encoding: string): void;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  join(...paths: string[]): string;
  dirname(path: string): string;
  getCwd(): string;
}

// デフォルトのファイルシステム実装
export const defaultFileSystem: FileSystem = {
  existsSync: (path: string) => fs.existsSync(path),
  readFileSync: (path: string, encoding: string) => fs.readFileSync(path, encoding),
  writeFileSync: (path: string, data: string, encoding: string) =>
    fs.writeFileSync(path, data, encoding),
  mkdirSync: (path: string, options?: { recursive?: boolean }) => fs.mkdirSync(path, options),
  join: (...paths: string[]) => path.join(...paths),
  dirname: (path: string) => path.dirname(path),
  getCwd: () => process.cwd(),
};
