import { DynamicLoggerService } from '../logger/dynamic-logger.service';

/**
 * Global Exception Handler Utility
 *
 * Provides a standardized way to log exceptions and rethrow them
 * to be caught by the global AllExceptionsFilter.
 */
export class ExceptionHandler {
  // Static instance of the logger to avoid Dependency Injection boilerplate in controllers
  private static readonly logger = new DynamicLoggerService();

  /**
   * Logs an exception using the DynamicLoggerService and then rethrows it.
   *
   * @param error - The caught error object
   * @param context - The context/filename for the log (defaults to 'exceptions')
   * @throws The original error after logging it
   *
   * @example
   * try {
   *   await this.service.doSomething();
   * } catch (error) {
   *   ExceptionHandler.handleAndThrow(error);
   * }
   */
  static handleAndThrow(error: unknown, context: string = 'exceptions'): never {
    this.logger.error(
      error instanceof Error ? error.message : 'Unknown error',
      error instanceof Error ? error.stack : undefined,
      context,
    );
    throw error;
  }
}
