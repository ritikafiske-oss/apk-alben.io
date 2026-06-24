import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DynamicLoggerService } from './logger/dynamic-logger.service';

/**
 * Common Module
 *
 * Global module that provides shared guards and utilities across the entire application.
 * Marked as @Global() so it's available in all modules without explicit import.
 *
 * @global
 * This module is automatically available in all feature modules.
 * No need to import it explicitly in other modules.
 *
 * @purpose Circular Dependency Resolution
 * Created to break circular dependencies between AuthenticationModule and UsersModule.
 * JwtAuthGuard needs to be available globally without creating import cycles.
 *
 * @exports
 * - JwtAuthGuard: For protecting routes with JWT authentication
 *
 * @architecture
 * Following NestJS best practices for shared modules:
 * - Guards that need global availability
 * - Common filters and interceptors
 * - Shared utilities
 *
 * @see JwtAuthGuard for route protection implementation
 * @see JwtStrategy for token validation logic
 */
@Global()
@Module({
  imports: [PassportModule],
  providers: [JwtAuthGuard, DynamicLoggerService],
  exports: [JwtAuthGuard, DynamicLoggerService],
})
export class CommonModule {}
