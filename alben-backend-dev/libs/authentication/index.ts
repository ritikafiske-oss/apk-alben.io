/**
 * Authentication Module Barrel Exports
 *
 * This file provides convenient access to the authentication module's public API.
 * It re-exports commonly used classes and types from the authentication module.
 *
 * @module authentication
 *
 * @exports
 * - AuthenticationModule: NestJS module for authentication functionality
 * - AuthenticationService: Service for login and JWT token generation
 * - LoginRequestDto: DTO for login request validation
 * - LoginResponseDto: DTO for login response structure
 *
 * @usage
 * ```typescript
 * import {
 *   AuthenticationModule,
 *   AuthenticationService,
 *   LoginRequestDto
 * } from '@libs/authentication';
 * ```
 *
 * @note Internal Files
 * The following are NOT exported and should only be used within the module:
 * - JwtStrategy: Registered as provider, used internally by JwtAuthGuard
 * - AuthenticationController: Registered in module, not exported
 * - JwtAuthGuard: Use the one from @libs/common instead
 */
export { AuthenticationModule } from './src/authentication.module';
export { AuthenticationService } from './src/application/authentication.service';
export { LoginRequestDto } from './src/ui/dtos/login-request.dto';
export { LoginResponseDto } from './src/ui/dtos/login-response.dto';
