import { Company } from '../../../domain/company.entity';
import { CompanyEntity } from '../entities/company.entity';
import { UserCompany } from '../../../domain/user-company.entity';
import { UserCompanyEntity } from '../entities/user-company.entity';

/**
 * Company Mapper
 *
 * Translates between domain entities and persistence entities for companies.
 * Implements the Adapter pattern for Hexagonal/Clean Architecture.
 *
 * @architecture Hexagonal Architecture - Infrastructure Layer
 * This mapper sits at the boundary between:
 * - Domain Layer: Business logic (Company domain entity)
 * - Infrastructure Layer: Database access (CompanyEntity persistence entity)
 * \n * @pattern Adapter Pattern
 * Adapts TypeORM entities to domain entities,
 * keeping the domain layer independent of ORM concerns.
 *
 * @methods
 * - toDomain: Converts CompanyEntity (database) → Company (domain)
 *
 * @note One-Way Mapping
 * Only toDomain is implemented as the app doesn't create/update companies.
 * Companies are managed by the Laravel backend.
 *
 * @note Field Mapping
 * Only fields defined in the domain Company entity are mapped.
 * CompanyEntity has additional fields (16 total) like address, GST, owner_id
 * that are not mapped as they're not needed for current use cases.
 *
 * @see Company for domain entity definition
 * @see CompanyEntity for complete database schema
 */
export class CompanyMapper {
  /**
   * Convert Persistence Entity to Domain Entity
   *
   * Translates a CompanyEntity (TypeORM) to a Company (domain model).
   * Called when fetching company data from the database.
   *
   * @param entity - TypeORM entity from database
   * @returns Domain entity for business logic
   *
   * @usage
   * ```typescript
   * const companyEntity = await repo.findOne(id);
   * const company = CompanyMapper.toDomain(companyEntity);
   * ```
   *
   * @usecase
   * Used in GET /users/companies to convert database records
   * to domain models before mapping to DTOs.
   */
  static toDomain(entity: CompanyEntity): Company {
    return new Company(
      entity.id,
      entity.businessName,
      entity.businessLogo,
      entity.helplineNo1,
      entity.helplineNo2,
    );
  }

  static toDomainUserCompany(entity: UserCompanyEntity): UserCompany {
    return new UserCompany(
      entity.id,
      entity.userId,
      entity.companyId,
      entity.activityStatus,
      entity.status,
      entity.role,
      entity.isManager,
      entity.allowPopupForVendor,
      entity.allowPopupForColleague,
      entity.company?.ownerId ?? null,
      entity.shiftId,
    );
  }
}
