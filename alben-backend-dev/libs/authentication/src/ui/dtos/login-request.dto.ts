import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Login Request DTO
 *
 * Data Transfer Object for user login requests.
 * Validates and structures the login credentials sent by clients.
 *
 * @validation
 * - Mobile: Must be exactly 10 digits (Indian mobile number format)
 * - Password: Required, non-empty string
 * - FCM Token: Optional, for push notifications
 *
 * @example
 * ```json
 * {
 *   "mobile": "9764233336",
 *   "password": "Alben@123",
 *   "fcm_token": "firebase-cloud-messaging-token"
 * }
 * ```
 */
export class LoginRequestDto {
  /**
   * Mobile Number
   *
   * 10-digit mobile number used as the username for login.
   * Must be a valid Indian mobile number format.
   *
   * @validation Exactly 10 numeric digits
   * @example "9764233336"
   */
  @ApiProperty({ example: '9764223236', description: '10 digit mobile number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
  mobile: string;

  /**
   * Password
   *
   * User's password for authentication.
   * Password is validated against bcrypt hash in the database.
   *
   * @validation Required, non-empty string
   * @security Password is never returned in responses
   * @example "Alben@123"
   */
  @ApiProperty({ example: 'A23en@123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  /**
   * FCM Token (Optional)
   *
   * Firebase Cloud Messaging token for sending push notifications
   * to the user's device after successful login.
   *
   * @validation Optional string
   * @note This token is used for sending notifications about app events
   * @example "firebase-fcm-token-abc123"
   */
  @ApiProperty({
    example: 'fcm-token-string',
    required: false,
    description: 'FCM Token for push notifications',
  })
  @IsString()
  @IsOptional()
  fcm_token?: string;
}
