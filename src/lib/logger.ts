// ロガーの抽象化
export interface Logger {
  error(message: string): void;
  info(message: string): void;
}

// デフォルトのロガー実装
export const defaultLogger: Logger = {
  error: (message: string) => console.error(message),
  info: (message: string) => console.log(message),
};
