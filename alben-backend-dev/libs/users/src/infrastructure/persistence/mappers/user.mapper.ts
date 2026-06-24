import { User } from '../../../domain/user.entity';
import { UserEntity } from '../entities/user.entity';

/**
 * User Mapper
 *
 * Translates between domain entities and persistence entities.
 * Implements the Adapter pattern for Hexagonal/Clean Architecture.
 *
 * @architecture Hexagonal Architecture - Infrastructure Layer
 * This mapper sits at the boundary between:
 * - Domain Layer: Business logic (User domain entity)
 * - Infrastructure Layer: Database access (UserEntity persistence entity)
 *
 * @pattern Adapter Pattern
 * Adapts TypeORM entities to domain entities and vice versa,
 * keeping the domain layer independent of ORM concerns.
 *
 * @methods
 * - toDomain: Converts UserEntity (database) → User (domain)
 * - toPersistence: Converts User (domain) → UserEntity (database)
 *
 * @note Field Mapping
 * Only fields defined in the domain User entity are mapped.
 * UserEntity has additional fields (31 total) that are not mapped here
 * as they're not required for current business logic.
 *
 * @see User for domain entity definition
 * @see UserEntity for complete database schema
 */

export class UserMapper {
  /**
   * Convert Persistence Entity to Domain Entity
   *
   * Translates a UserEntity (TypeORM) to a User (domain model).
   * Called when fetching data from the database.
   *
   * @param entity - TypeORM entity from database
   * @returns Domain entity for business logic
   *
   * @usage
   * ```typescript
   * const userEntity = await repo.findOne(id);
   * const user = UserMapper.toDomain(userEntity);
   * ```
   */
  static toDomain(entity: UserEntity): User {
    return new User(
      Number(entity.id), // Convert bigint to number
      entity.firstname,
      entity.lastname,
      entity.email,
      entity.mobile,
      entity.password,
      entity.profileImage,
      entity.gender,
      entity.language,
      entity.skill,
      entity.isResetPassword,
      entity.apiToken,
      entity.selectedCompanyId,
      entity.fcmToken,
    );
  }

  /**
   * Convert Domain Entity to Persistence Entity
   *
   * Translates a User (domain model) to a UserEntity (TypeORM).
   * Called when saving data to the database.
   *
   * @param domain - Domain entity from business logic
   * @returns TypeORM entity for database persistence
   *
   * @usage
   * ```typescript
   * const user = new User(...);
   * const userEntity = UserMapper.toPersistence(user);
   * await repo.save(userEntity);
   * ```
   *
   * @note
   * This method is currently not used as the app doesn't create users yet.
   * Kept for future user creation/update functionality.
   */
  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.firstname = domain.firstname;
    entity.lastname = domain.lastname;
    entity.email = domain.email;
    entity.mobile = domain.mobile;
    entity.password = domain.password;
    entity.profileImage = domain.profileImage;
    entity.gender = domain.gender;
    entity.language = domain.language;
    entity.skill = domain.skill;
    entity.isResetPassword = domain.isResetPassword;
    entity.apiToken = domain.apiToken;
    entity.selectedCompanyId = domain.selectedCompanyId;
    entity.fcmToken = domain.fcmToken;
    return entity;
  }
}
