import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { UserRepositoryPort } from '../domain/ports/user.repository.port';
import { USER_REPOSITORY } from '../domain/ports/user.repository.port';
import type { ApiResponse } from '@libs/common';
import type { UserProfileDto } from '../ui/dtos/user-profile.dto';

/**
 * Get User Profile Use Case
 *
 * Retrieves the complete profile information for a user.
 * Implements the "Get User Profile" business use case.
 *
 * @usecase User Profile Retrieval
 * Fetches user data and activity status from their selected company.
 * Used by the /users/profile endpoint.
 *
 * @architecture Clean Architecture - Application Layer
 * This use case orchestrates the business logic without HTTP concerns.
 *
 * @see UsersController.getProfile for the HTTP endpoint
 * @see UserRepositoryPort for data access interface
 */
@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  /**
   * Execute Use Case
   *
   * Retrieves user profile with activity status from selected company.
   *
   * @param userId - ID of the user whose profile to fetch
   * @returns Standardized API response with user profile data
   * @throws NotFoundException if user doesn't exist
   *
   * @flow Execution Flow
   * 1. Fetch user from database by ID
   * 2. Verify user exists (throw 404 if not)
   * 3. Get activity status from user's selected company
   * 4. Map user data to profile DTO
   * 5. Return success response
   *
   * @note Activity Status Logic
   * - If user has no selected company: defaults to 'Check Out'
   * - If user has selected company: fetches from user_companies table
   * - Activity status indicates if user is currently checked in/out
   */
  async execute(userId: number): Promise<ApiResponse<UserProfileDto>> {
    // Step 1: Fetch user from database
    const user = await this.userRepository.findById(userId);

    // Step 2: Verify user exists
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Step 3: Get activity status from selected company
    let activityStatus = 'Check Out'; // Default when no company selected
    if (user.selectedCompanyId) {
      const userCompany = await this.userRepository.findUserCompany(
        userId,
        user.selectedCompanyId,
      );
      if (userCompany) {
        activityStatus = userCompany.activityStatus;
      }
    }

    // Step 4: Map user entity to profile DTO
    const data: UserProfileDto = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      mobile: user.mobile,
      email: user.email,
      profile_image: user.profileImage,
      gender: user.gender,
      language: user.language,
      skill: user.skill,
      activity_status: activityStatus,
    };

    // Step 5: Return standardized success response
    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data,
    };
  }
}
