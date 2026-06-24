/**
 * App Version DTO (Data Transfer Object)
 *
 * Represents the active app version data in API responses.
 * Fields match the Laravel reference implementation's select:
 * `version`, `description`, `is_force`.
 *
 * @usage
 * - GET /users/app-version — Returns AppVersionDto or null
 *
 * @example Response
 * ```json
 * {
 *   "version": "1.0.0",
 *   "description": "Initial release",
 *   "is_force": 0
 * }
 * ```
 */
export class AppVersionDto {
  /** Version string (e.g. "1.0.0") */
  version: string;

  /** Optional release description */
  description: string | null;

  /** Whether this version requires a forced update (0 or 1) */
  is_force: number;
}
