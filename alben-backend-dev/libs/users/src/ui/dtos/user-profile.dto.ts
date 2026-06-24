/**
 * User Profile DTO (Data Transfer Object)
 *
 * Represents user profile data in API responses.
 * Used for transferring user information from server to client.
 *
 * @usage
 * - GET /users/profile - Returns UserProfileDto
 * - Shows user's personal information and current activity status
 *
 * @note Snake Case
 * Uses snake_case for field names to match Laravel/mobile app conventions.
 *
 * @security
 * Password and sensitive fields are NOT included in this DTO.
 * Only safe-to-display user information is exposed.
 *
 * @example Response
 * ```json
 * {
 *   \"id\": 5,
 *   \"firstname\": \"John\",
 *   \"lastname\": \"Doe\",
 *   \"mobile\": \"9764233336\",
 *   \"email\": \"john@example.com\",
 *   \"profile_image\": \"https://example.com/john.jpg\",
 *   \"gender\": \"Male\",
 *   \"language\": \"en\",
 *   \"skill\": \"Sales, Marketing\",
 *   \"activity_status\": \"Check Out\"
 * }
 * ```
 */
export class UserProfileDto {
  /** Unique user identifier */
  id: number;

  /** User's first name */
  firstname: string;

  /** User's last name or surname */
  lastname: string | null;

  /** User's 10-digit mobile number */
  mobile: string | null;

  /** User's email address */
  email: string | null;

  /** URL or path to user's profile image */
  profile_image: string | null;

  /** User's gender (Male/Female/Other) */
  gender: string | null;

  /** Preferred language code (e.g., 'en', 'hi') */
  language: string | null;

  /** User's skills or expertise */
  skill: string | null;

  /** Current activity/attendance status from selected company */
  activity_status: string;
}
