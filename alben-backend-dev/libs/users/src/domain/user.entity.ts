/**
 * User Domain Entity
 *
 * Represents a user in the business domain layer.
 * This is the core business entity, independent of database or framework concerns.
 *
 * @architecture Hexagonal/Clean Architecture - Domain Layer
 * - Domain entities are framework-agnostic
 * - Contain only business-relevant properties
 * - Mapped from/to persistence entities via UserMapper
 *
 * @properties
 * Contains essential user information needed for business logic:
 * - Identity: id, firstname, lastname
 * - Contact: email, mobile
 * - Authentication: password, apiToken
 * - Profile: profileImage, gender, language, skill
 * - Settings: selectedCompanyId, isResetPassword
 *
 * @note Lean Design
 * This entity is kept minimal, containing only fields required for current business logic.
 * Additional user properties exist in the database (UserEntity) but are not mapped here
 * unless needed for domain operations.
 *
 * @see UserEntity for complete database schema
 * @see UserMapper for domain/persistence translation
 */
export class User {
  constructor(
    /** Unique user identifier (primary key) */
    public readonly id: number,

    /** User's first name */
    public readonly firstname: string,

    /** User's last name or surname (optional) */
    public readonly lastname: string | null,

    /** User's email address (optional, unique) */
    public readonly email: string | null,

    /** User's 10-digit mobile number (optional, unique) */
    public readonly mobile: string | null,

    /** Bcrypt hashed password for authentication */
    public readonly password: string,

    /** URL or path to user's profile image (optional) */
    public readonly profileImage: string | null,

    /** User's gender (Male/Female/Other, optional) */
    public readonly gender: string | null,

    /** Preferred language for app interface (optional) */
    public readonly language: string | null,

    /** User's skills or expertise (optional) */
    public readonly skill: string | null,

    /** Flag indicating if password reset is required on next login */
    public readonly isResetPassword: boolean,

    /** JWT token for authentication (null when logged out) */
    public readonly apiToken: string | null,

    /** ID of currently selected/active company (optional) */
    public readonly selectedCompanyId: number | null,

    /** User's skills or expertise (optional) */
    public readonly fcmToken: string | null,
  ) {}
}
