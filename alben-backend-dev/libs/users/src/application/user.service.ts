import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../domain/ports/user.repository.port';
import { User } from '../domain/user.entity';
import { UserCompany } from '../domain/user-company.entity';
import * as bcrypt from 'bcrypt';

/**
 * User Service
 *
 * Handles user-related business logic focused on authentication.
 * Primary responsibility is validating user credentials during login.
 *
 * @security Password Validation
 * - Uses bcrypt for secure password comparison
 * - Compatible with PHP Laravel bcrypt hashes ($2y$ format)
 * - Automatically converts hash format for Node.js compatibility
 *
 * @see AuthenticationService for complete login flow
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  /**
   * Validate User Credentials
   *
   * Checks if the provided mobile and password combination is valid.
   * Called during login to authenticate users.
   *
   * @param mobile - User's 10-digit mobile number
   * @param pass - Plain text password to validate
   * @returns User object if valid, null if invalid
   *
   * @security PHP/Laravel Compatibility
   * Laravel uses $2y$ bcrypt format while Node.js uses $2a$.
   * This method automatically converts the hash format for compatibility.
   *
   * @flow Validation Process
   * 1. Fetch user by mobile number
   * 2. Convert password hash from PHP ($2y$) to Node.js ($2a$) format
   * 3. Compare provided password with stored hash using bcrypt
   * 4. Return user if valid, null if invalid
   *
   * @example
   * ```typescript
   * const user = await userService.validateUser('9764233336', 'Alben@123');
   * if (user) {
   *   // User authenticated successfully
   * }
   * ```
   */
  async validateUser(mobile: string, pass: string): Promise<User | null> {
    // Step 1: Fetch user from database by mobile number
    const user = await this.userRepository.findByMobile(mobile);
    if (!user) {
      return null;
    }

    // Step 2: Convert PHP bcrypt format to Node.js format
    // PHP uses $2y$ bcrypt format, Node.js uses $2a$
    // This ensures compatibility with Laravel-generated password hashes
    const nodeHash = user.password.replace(/^\$2y\$/, '$2a$');

    // Step 3: Compare plain text password with bcrypt hash
    // bcrypt.compare() securely validates the password
    const isPasswordValid = await bcrypt.compare(pass, nodeHash);

    // Step 4: Return user if password is valid
    if (isPasswordValid) {
      return user;
    }

    return null;
  }

  /**
   * Find User by Mobile
   *
   * @param mobile - User's mobile number
   * @returns User entity or null
   */
  async findByMobile(mobile: string): Promise<User | null> {
    return this.userRepository.findByMobile(mobile);
  }

  /**
   * Centralized Company Validation
   *
   * Validates if the user is associated with the company and if the status is active.
   * Throws BadRequestException directly if validation fails.
   *
   * @param userId - User's ID
   * @param companyId - Company's ID
   * @throws BadRequestException { code: 'INVALID_COMPANY' }
   */
  async validateUserCompany(
    userId: number,
    companyId: number,
  ): Promise<UserCompany> {
    const userCompany = await this.userRepository.findUserCompany(
      userId,
      companyId,
    );

    if (!userCompany || userCompany.status !== 'active') {
      throw new BadRequestException({
        success: false,
        code: 'INVALID_COMPANY',
        message: 'Invalid company.',
        data: {},
      });
    }

    return userCompany;
  }

  async findActiveUserCompanies(userId: number): Promise<UserCompany[]> {
    return this.userRepository.findActiveUserCompanies(userId);
  }

  /**
   * Get Business Setting
   *
   * @param companyId - Company ID
   * @param key - Setting key
   * @returns Setting value or null
   */
  async getBusinessSetting(
    companyId: number,
    key: string,
  ): Promise<string | null> {
    return this.userRepository.getBusinessSetting(companyId, key);
  }
}
