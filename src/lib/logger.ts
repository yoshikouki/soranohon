export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  log: (level: LogLevel, message: string, ...args: unknown[]) => void;
}

export const initLogger = (console: Console): Logger => ({
  debug: (message: string, ...args: unknown[]) => {
    console.debug(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  log: (level: LogLevel, message: string, ...args: unknown[]) => {
    switch (level) {
      case "debug":
        console.debug(`[DEBUG] ${message}`, ...args);
        break;
      case "info":
        console.info(`[INFO] ${message}`, ...args);
        break;
      case "warn":
        console.warn(`[WARN] ${message}`, ...args);
        break;
      case "error":
        console.error(`[ERROR] ${message}`, ...args);
        break;
    }
  },
});

export const logger = initLogger(console);
