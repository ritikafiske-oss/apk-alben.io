import { ApiProperty } from '@nestjs/swagger';

/**
 * Login Response Data DTO
 *
 * Contains the user data and JWT token returned upon successful authentication.
 * This nested object is wrapped in the LoginResponseDto.
 *
 * @security
 * The token field contains the JWT that must be included in all subsequent
 * requests to protected endpoints as: Authorization: Bearer <token>
 *
 * @note Laravel-compatible structure
 */
export class LoginResponseDataDto {
  /** User's unique identifier */
  @ApiProperty()
  id: number;

  /** User's first name */
  @ApiProperty()
  firstname: string;

  /** User's last name or surname */
  @ApiProperty()
  lastname: string;

  /** User's 10-digit mobile number */
  @ApiProperty()
  mobile: string;

  /** Flag indicating if user must reset password (1 = yes, 0 = no) */
  @ApiProperty()
  is_reset_password: number;

  /** JWT token for authentication (valid for 24 hours) */
  @ApiProperty()
  token: string;
}

/**
 * Login Response DTO
 *
 * Standard response structure for login endpoint.
 * Follows Laravel API response pattern for consistency.
 *
 * @example Success Response
 * ```json
 * {
 *   "success": true,
 *   "message": "Welcome John Doe!",
 *   "data": {
 *     "id": "5",
 *     "firstname": "John",
 *     "lastname": "Doe",
 *     "mobile": "9764233336",
 *     "profile_image": null,
 *     "activity_status": "Check Out",
 *     "is_reset_password": 0,
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   }
 * }
 * ```
 */
export class LoginResponseDto {
  /** Indicates if the login was successful */
  @ApiProperty()
  success: boolean;

  /** Deterministic machine-readable code (e.g. LOGIN_SUCCESS) */
  @ApiProperty()
  code: string;

  /** Welcome message or error description */
  @ApiProperty()
  message: string;

  /** User data and authentication token */
  @ApiProperty()
  data: LoginResponseDataDto;
}
