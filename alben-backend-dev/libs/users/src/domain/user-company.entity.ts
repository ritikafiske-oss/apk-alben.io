/**
 * User-Company Domain Entity
 *
 * Represents the association between a user and a company in the business domain.
 * This is a junction/association entity linking users to companies with additional metadata.
 *
 * @architecture Hexagonal/Clean Architecture - Domain Layer
 * - Domain entities are framework-agnostic
 * - Contain only business-relevant properties
 * - Mapped from UserCompanyEntity via repository
 *
 * @properties
 * Contains:
 * - Relationship: userId, companyId
 * - Status: activityStatus (Check In/Check Out), status (active/inactive)
 * - Role: user's role within the company
 *
 * @usecase
 * This entity is primarily used for:
 * - Determining user's activity status (checked in/out)
 * - Validating active company associations during login
 * - Checking user's role within a company
 *
 * @note Activity Status
 * - "Check In": User is currently working/active
 * - "Check Out": User is not currently working
 *
 * @see UserCompanyEntity for complete database schema
 * @see AuthenticationService.login for usage in login validation
 */
export class UserCompany {
  constructor(
    /** Unique association identifier (primary key) */
    public readonly id: number,

    /** User ID (foreign key to users table) */
    public readonly userId: number,

    /** Company ID (foreign key to companies table) */
    public readonly companyId: number,

    /** Current activity/attendance status ('Check In' | 'Check Out') */
    public readonly activityStatus: string,

    /** Association status ('active' | 'inactive') */
    public readonly status: string,

    /** User's role within this company */
    public readonly role: string,

    /** Flag indicating if user is a manager */
    public readonly isManager: boolean = false,

    /** Allow popup notifications for vendor-related activities */
    public readonly allowPopupForVendor: boolean = true,

    /** Allow popup notifications for colleague-related activities */
    public readonly allowPopupForColleague: boolean = true,

    /** Owner ID of the company */
    public readonly companyOwnerId: number | null = null,

    /** Assigned shift ID (junction metadata) */
    public readonly shiftId: number | null = null,
  ) {}
}
