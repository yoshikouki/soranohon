// ロガーの抽象化
export interface Logger {
  error(message: string): void;
}

// デフォルトのロガー実装
export const defaultLogger: Logger = {
  error: (message: string) => console.error(message),
};
