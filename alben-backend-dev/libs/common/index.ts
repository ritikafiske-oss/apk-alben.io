/**
 * Common Module Barrel Exports
 *
 * Provides access to shared utilities used across all modules.
 *
 * @exports
 * - CommonModule: Global NestJS module
 * - JwtAuthGuard: JWT authentication guard
 * - ApiResponse: Generic API response wrapper
 */
export { CommonModule } from './src/common.module';
export { JwtAuthGuard } from './src/guards/jwt-auth.guard';
export { ApiResponse } from './src/dtos/api-response.dto';
export type { Request } from 'express';
export { User } from './src/decorators/user.decorator';
export { AllExceptionsFilter } from './src/filters/all-exceptions.filter';
export { DynamicLoggerService } from './src/logger/dynamic-logger.service';
export { ExceptionHandler } from './src/utils/exception-handler.util';
export { DateUtil } from './src/utils/date.util';
