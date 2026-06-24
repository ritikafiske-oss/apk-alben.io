import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class DynamicLoggerService implements LoggerService {
  private loggers: Map<string, winston.Logger> = new Map();

  private getLogger(context: string): winston.Logger {
    const safeContext = context || 'default';

    if (this.loggers.has(safeContext)) {
      return this.loggers.get(safeContext)!;
    }

    const newLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        }),
        winston.format.json(),
      ),
      transports: [
        new DailyRotateFile({
          filename: `logs/${safeContext}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });

    // Optionally also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      newLogger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }

    this.loggers.set(safeContext, newLogger);
    return newLogger;
  }

  /**
   * Write a 'log' level log.
   */
  log(message: unknown, context?: string) {
    const logger = this.getLogger(context || 'app');
    if (typeof message === 'object' && message !== null) {
      logger.info(message);
    } else {
      logger.info(message as string);
    }
  }

  /**
   * Write an 'error' level log.
   */
  error(message: unknown, trace?: string, context?: string) {
    const logger = this.getLogger(context || 'exception');
    if (typeof message === 'object' && message !== null) {
      logger.error({ ...(message as Record<string, unknown>), trace });
    } else {
      logger.error(message as string, { trace });
    }
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: unknown, context?: string) {
    const logger = this.getLogger(context || 'app');
    logger.warn(message as string);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: unknown, context?: string) {
    const logger = this.getLogger(context || 'debug');
    logger.debug(message as string);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: unknown, context?: string) {
    const logger = this.getLogger(context || 'app');
    logger.verbose(message as string);
  }
}
