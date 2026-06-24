import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../domain/ports/user.repository.port';
import type { ApiResponse } from '@libs/common';
import { DynamicLoggerService } from '@libs/common';
import type { AppVersionDto } from '../ui/dtos/app-version.dto';

/**
 * Get App Version Use Case
 *
 * Fetches the active app version record from the database.
 * Implements the "Get App Version" delivery use case.
 *
 * @usecase App Version Retrieval
 * Returns the single active record from the `app_versions` table.
 * Used by the GET /users/app-version endpoint.
 *
 * @architecture Clean Architecture - Application Layer
 * This use case orchestrates the query without HTTP concerns.
 *
 * @see UsersController.getAppVersion for the HTTP endpoint
 * @see UserRepositoryPort.getActiveAppVersion for data access
 */
@Injectable()
export class GetAppVersionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: DynamicLoggerService,
  ) {}

  /**
   * Execute Use Case
   *
   * Retrieves the active app version from the repository.
   *
   * @returns Standardized API response with app version data (or null if none)
   *
   * @flow Execution Flow
   * 1. Fetch active app version from database
   * 2. Map domain entity to DTO
   * 3. Return success response
   */
  async execute(): Promise<ApiResponse<AppVersionDto | null>> {
    try {
      // Step 1: Fetch active app version
      const appVersion = await this.userRepository.getActiveAppVersion();

      // Step 2: Map domain entity to DTO (null stays null)
      const data: AppVersionDto | null = appVersion
        ? {
            version: appVersion.version,
            description: appVersion.description,
            is_force: appVersion.isForce,
          }
        : null;

      // Step 3: Return standardized success response
      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data,
      };
    } catch (error) {
      this.logger.error(
        `GetAppVersionUseCase: ${(error as Error).message}`,
        (error as Error).stack,
        'exceptions',
      );
      throw error;
    }
  }
}
