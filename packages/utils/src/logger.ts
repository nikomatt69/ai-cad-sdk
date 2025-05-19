/**
 * Logging utility for AI CAD SDK
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  enableConsole?: boolean;
  customHandler?: (level: LogLevel, message: string, ...args: any[]) => void;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enableConsole: boolean;
  private customHandler?: (
    level: LogLevel,
    message: string,
    ...args: any[]
  ) => void;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix ?? 'AI-CAD-SDK';
    this.enableConsole = options.enableConsole ?? true;
    this.customHandler = options.customHandler;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set a custom logging handler
   */
  setCustomHandler(
    handler?: (level: LogLevel, message: string, ...args: any[]) => void
  ): void {
    this.customHandler = handler;
  }

  /**
   * Enable or disable console logging
   */
  setEnableConsole(enable: boolean): void {
    this.enableConsole = enable;
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * General logging method
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.level) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${this.prefix}] [${LogLevel[level]}] ${message}`;

    // Call custom handler if provided
    if (this.customHandler) {
      this.customHandler(level, formattedMessage, ...args);
    }

    // Log to console if enabled
    if (this.enableConsole && typeof console !== 'undefined') {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...args);
          break;
      }
    }
  }
}

// Export a singleton instance
export const logger = new Logger();

// Proxy method for easier imports
export const createLogger = (options: LoggerOptions) => new Logger(options);
