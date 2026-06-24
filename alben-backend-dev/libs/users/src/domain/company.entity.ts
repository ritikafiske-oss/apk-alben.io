/**
 * Company Domain Entity
 *
 * Represents a company/business in the business domain layer.
 * This is a core business entity, independent of database or framework concerns.
 *
 * @architecture Hexagonal/Clean Architecture - Domain Layer
 * - Domain entities are framework-agnostic
 * - Contain only business-relevant properties
 * - Mapped from persistence entities via CompanyMapper
 *
 * @properties
 * Contains essential company information needed for business logic:
 * - Identity: id, businessName
 * - Branding: businessLogo
 * - Support: helplineNo1, helplineNo2
 *
 * @note Lean Design
 * This entity contains only fields currently needed for:
 * - Listing user's companies
 * - Displaying company information in app
 *
 * Additional company properties (address, GST, owner, etc.) exist in CompanyEntity
 * but are not mapped here as they're not required for current use cases.
 *
 * @see CompanyEntity for complete database schema
 * @see CompanyMapper for domain/persistence translation
 */
export class Company {
  constructor(
    /** Unique company identifier (primary key) */
    public readonly id: number,

    /** Company or business name */
    public readonly businessName: string,

    /** URL or path to company logo image (optional) */
    public readonly businessLogo: string | null,

    /** Primary helpline/support contact number (optional) */
    public readonly helplineNo1: string | null,

    /** Secondary helpline/support contact number (optional) */
    public readonly helplineNo2: string | null,
  ) {}
}
