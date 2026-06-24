/**
 * Company DTO (Data Transfer Object)
 *
 * Represents company data in API responses.
 * Used for transferring company information from server to client.
 *
 * @usage
 * - GET /users/companies - Returns array of CompanyDto
 * - User can see all companies they are associated with
 *
 * @note Snake Case
 * Uses snake_case for field names to match Laravel/mobile app conventions.
 *
 * @example Response
 * ```json
 * {
 *   \"id\": 1,
 *   \"business_name\": \"Acme Corp\",
 *   \"business_logo\": \"https://example.com/logo.png\",
 *   \"helpline_no_1\": \"1800-123-4567\",
 *   \"helpline_no_2\": \"1800-765-4321\"
 * }
 * ```
 */
export class CompanyDto {
  /** Unique company identifier */
  id: number;

  /** Company or business name */
  business_name: string;

  /** URL or path to company logo image */
  business_logo: string | null;

  /** Primary helpline/support contact number */
  helpline_no_1: string | null;

  /** Secondary helpline/support contact number */
  helpline_no_2: string | null;
}
