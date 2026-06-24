/**
 * API Response DTO
 *
 * Generic wrapper for all API responses across the application.
 * Provides consistent response structure for all modules.
 *
 * @template T - Type of the data payload
 *
 * @structure
 * All API responses follow this format:
 * ```json
 * {
 *   "success": true,
 *   "code": "LOGIN_SUCCESS",
 *   "message": "Welcome John!",
 *   "data": { ... }
 * }
 * ```
 *
 * @usage
 * ```typescript
 * import { ApiResponse } from '@libs/common';
 *
 * // In controller/service:
 * return {
 *   success: true,
 *   code: 'USER_CREATED',
 *   message: 'User created successfully',
 *   data: userDto
 * } as ApiResponse<UserDto>;
 * ```
 *
 * @examples
 * - ApiResponse<UserProfileDto> - Profile endpoint
 * - ApiResponse<CompanyDto[]>   - Companies list endpoint
 * - ApiResponse<LoginResponseDataDto> - Login endpoint
 */
import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  /** Indicates if the operation was successful (true) or failed (false) */
  @ApiProperty({ description: 'Indicates if the operation was successful' })
  success: boolean;

  /** Deterministic machine-readable code (e.g. 'LOGIN_SUCCESS', 'ERR_USER_NOT_FOUND') */
  @ApiProperty({ description: 'Deterministic machine-readable code' })
  code: string;

  /** Human-readable message describing the result */
  @ApiProperty({ description: 'Human-readable message describing the result' })
  message: string;

  /** The actual data payload (type varies by endpoint) */
  @ApiProperty({ description: 'The actual data payload' })
  data: T;
}
