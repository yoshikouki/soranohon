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

export const defaultLogger = initLogger(console);

export function createCategoryLogger(
  category: string,
  baseLogger: Logger = defaultLogger,
): Logger {
  return {
    debug: (message: string, ...args: unknown[]) =>
      baseLogger.debug(`[${category}] ${message}`, ...args),
    info: (message: string, ...args: unknown[]) =>
      baseLogger.info(`[${category}] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) =>
      baseLogger.warn(`[${category}] ${message}`, ...args),
    error: (message: string, ...args: unknown[]) =>
      baseLogger.error(`[${category}] ${message}`, ...args),
    log: (level: LogLevel, message: string, ...args: unknown[]) =>
      baseLogger.log(level, `[${category}] ${message}`, ...args),
  };
}

export const log = {
  debug: (message: string, ...args: unknown[]) => defaultLogger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => defaultLogger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => defaultLogger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => defaultLogger.error(message, ...args),
  log: (level: LogLevel, message: string, ...args: unknown[]) =>
    defaultLogger.log(level, message, ...args),

  category: (category: string) => createCategoryLogger(category),
};
