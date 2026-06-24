import { User } from '../user.entity';
import { Company } from '../company.entity';
import { UserCompany } from '../user-company.entity';
import { AppVersion } from '../app-version.entity';
import { UserUpdateData } from '../../interfaces/user-update-data.interface';

/**
 * User Repository Port (Interface)
 *
 * Defines the contract for user data access operations.
 * This is a PORT in Hexagonal/Clean Architecture, allowing the domain layer
 * to remain independent of infrastructure concerns.
 *
 * @architecture Dependency Inversion Principle
 * - Domain layer defines the interface (this port)
 * - Infrastructure layer implements the interface (UserRepository)
 * - Dependencies point inward: Infrastructure → Domain
 *
 * @pattern Repository Pattern
 * Abstracts data access logic, providing a collection-like interface
 * for domain entities without exposing database details.
 *
 * @implementations
 * - UserRepository: TypeORM-based implementation in infrastructure layer
 *
 * @usage
 * Inject via dependency injection using USER_REPOSITORY token:
 * ```typescript
 * constructor(
 *   @Inject(USER_REPOSITORY)
 *   private readonly userRepository: UserRepositoryPort
 * ) {}
 * ```
 *
 * @see UserRepository for concrete implementation
 * @see USER_REPOSITORY for injection token
 */

export interface UserRepositoryPort {
  /**
   * Find user by ID
   * @param id - User's unique identifier
   * @returns User if found, null otherwise
   */
  findById(id: number): Promise<User | null>;

  /**
   * Find user by mobile number
   * @param mobile - User's 10-digit mobile number
   * @returns User if found, null otherwise
   * @usage Used during login for credential validation
   */
  findByMobile(mobile: string): Promise<User | null>;

  /**
   * Find user-company association
   * @param userId - User's ID
   * @param companyId - Company's ID
   * @returns UserCompany if association exists, null otherwise
   * @usage Used to fetch activity status for selected company
   */
  findUserCompany(
    userId: number,
    companyId: number,
  ): Promise<UserCompany | null>;

  /**
   * Find all companies associated with a user
   * @param userId - User's ID
   * @returns Array of companies (empty if none)
   * @usage Used in GET /users/companies endpoint
   */
  findCompaniesByUserId(userId: number): Promise<Company[]>;

  /**
   * Update user's API token
   * @param userId - User's ID
   * @param apiToken - JWT token to store (null to clear)
   * @security Critical for single device login enforcement
   * @usage Called during login to store new JWT token
   */
  updateApiToken(userId: number, apiToken: string | null): Promise<void>;

  /**
   * Get user's activity status from selected company
   * @param userId - User's ID
   * @returns Activity status ('Check In' or 'Check Out')
   * @usage Called during login to include in response
   */
  getUserActivityStatus(userId: number): Promise<string>;

  /**
   * Get user's active company association
   * @param userId - User's ID
   * @returns UserCompany if active association exists, null otherwise
   * @usage Called during login to validate user has active company
   */
  getUserCompanyByUserId(userId: number): Promise<UserCompany | null>;

  /**
   * Update user's last login date
   * @param userId - User's ID
   * @usage Called during successful login for audit tracking
   */
  updateLastLoginDate(userId: number): Promise<void>;

  updateFcmToken(userId: number, fcmToken: string): Promise<void>;

  /**
   * Update User Password
   *
   * Updates the user's password and reset flag.
   * @param userId - User's ID
   * @param password - Hashed password
   * @param isReset - New value for is_reset_password flag
   */
  updatePassword(
    userId: number,
    password: string,
    isReset: boolean,
  ): Promise<void>;

  /**
   * Get active app version
   *
   * Fetches the first record from `app_versions` where status = 'active'.
   * Returns only version, description, and is_force fields.
   *
   * @returns AppVersion domain object or null if no active version exists
   * @usage Called by GetAppVersionUseCase for GET /users/app-version
   */
  getActiveAppVersion(): Promise<AppVersion | null>;

  /**
   * Find all user-company associations with 'active' status
   * @param userId - User's ID
   * @returns Array of active UserCompany associations
   * @usage Used for bulk synchronization operations in locations module
   */
  findActiveUserCompanies(userId: number): Promise<UserCompany[]>;

  /**
   * Get business setting by key for a company
   * @param companyId - Company ID
   * @param key - Setting key
   * @returns Setting value or null
   */
  getBusinessSetting(companyId: number, key: string): Promise<string | null>;

  /**
   * Find user by email
   * @param email - User's email address
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Update user profile fields
   * @param userId - User's ID
   * @param data - Fields to update
   */
  updateProfile(userId: number, data: UserUpdateData): Promise<void>;
}

/**
 * User Repository Injection Token
 *
 * Symbol used for dependency injection of UserRepositoryPort.
 *
 * @usage
 * ```typescript
 * // In module providers:
 * {
 *   provide: USER_REPOSITORY,
 *   useClass: UserRepository,
 * }
 *
 * // In service constructor:
 * @Inject(USER_REPOSITORY)
 * private readonly userRepository: UserRepositoryPort
 * ```
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
