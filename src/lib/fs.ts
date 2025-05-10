import * as fs from "fs";

// ファイルシステム操作の抽象化
export interface FileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: string): string;
}

// デフォルトのファイルシステム実装
export const defaultFileSystem: FileSystem = {
  existsSync: (path: string) => fs.existsSync(path),
  readFileSync: (path: string, encoding: string) => fs.readFileSync(path, encoding),
};
