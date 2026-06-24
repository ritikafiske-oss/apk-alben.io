import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../domain/ports/user.repository.port';
import type { ApiResponse } from '@libs/common';
import type { CompanyDto } from '../ui/dtos/company.dto';

/**
 * Get User Companies Use Case
 *
 * Retrieves all companies associated with a user.
 * Implements the "Get User Companies" business use case.
 *
 * @usecase User Companies Retrieval
 * Fetches all companies where the user has an active association.
 * Used by the /users/companies endpoint.
 *
 * @architecture Clean Architecture - Application Layer
 * This use case orchestrates the business logic without HTTP concerns.
 *
 * @see UsersController.getCompanies for the HTTP endpoint
 * @see UserRepositoryPort for data access interface
 */
@Injectable()
export class GetUserCompaniesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  /**
   * Execute Use Case
   *
   * Retrieves all companies where the user has an association.
   *
   * @param userId - ID of the user whose companies to fetch
   * @returns Standardized API response with array of company data
   *
   * @flow Execution Flow
   * 1. Fetch all companies associated with user from database
   * 2. Map company entities to company DTOs
   * 3. Return success response with company list
   *
   * @note
   * Returns companies through the user_companies junction table.
   * Only active associations are included.
   */
  async execute(userId: number): Promise<ApiResponse<CompanyDto[]>> {
    // Step 1: Fetch companies associated with this user
    const companies = await this.userRepository.findCompaniesByUserId(userId);

    // Step 2: Map company domain entities to DTOs
    const data: CompanyDto[] = companies.map((c) => ({
      id: c.id,
      business_name: c.businessName,
      business_logo: c.businessLogo,
      helpline_no_1: c.helplineNo1,
      helpline_no_2: c.helplineNo2,
    }));

    // Step 3: Return standardized success response
    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data,
    };
  }
}
